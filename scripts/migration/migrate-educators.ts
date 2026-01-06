/**
 * Migration script: Educators from v3 → v4
 *
 * This script:
 * 1. Connects to v3 database using pg (raw SQL)
 * 2. For each v3 educator, creates:
 *    - A User with email {slug}@educator.tinta.academy, role: educator
 *    - An Educator linked to that User
 * 3. Outputs a mapping of v3 educatorId → v4 educatorId for course migration
 *
 * Run: pnpm tsx scripts/migration/migrate-educators.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

// Use DIRECT_DATABASE_URL for scripts (bypasses connection pooler)
const V4_DATABASE_URL = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const V3_DATABASE_URL = process.env.V3_DATABASE_URL

interface V3Educator {
  id: string
  name: string
  title: string
  bio: string
  imageUrl: string
  createdAt: Date
}

interface EducatorMapping {
  v3Id: string
  v4Id: string
  name: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function cuid(): string {
  // Generate a cuid-like ID
  const timestamp = Date.now().toString(36)
  const random = randomUUID().replace(/-/g, '').substring(0, 12)
  return `c${timestamp}${random}`
}

async function migrateEducators(
  v3Pool: Pool,
  v4Pool: Pool
): Promise<EducatorMapping[]> {
  console.log('🔄 Fetching educators from v3 database...')

  // Fetch all educators from v3 using raw SQL
  const result = await v3Pool.query<V3Educator>(
    'SELECT id, name, title, bio, "imageUrl", "createdAt" FROM "Educator" ORDER BY "createdAt" ASC'
  )

  const v3Educators = result.rows
  console.log(`📊 Found ${v3Educators.length} educators in v3`)

  const mappings: EducatorMapping[] = []

  for (const v3Educator of v3Educators) {
    const slug = slugify(v3Educator.name)
    const email = `${slug}@educator.tinta.academy`

    console.log(`\n👤 Processing: ${v3Educator.name}`)
    console.log(`   v3 ID: ${v3Educator.id}`)
    console.log(`   Email: ${email}`)

    // Check if user already exists in v4
    const existingUser = await v4Pool.query(
      `SELECT u.id as "userId", e.id as "educatorId"
       FROM "User" u
       LEFT JOIN "Educator" e ON e."userId" = u.id
       WHERE u.email = $1`,
      [email]
    )

    if (existingUser.rows.length > 0 && existingUser.rows[0].educatorId) {
      console.log(`   ✅ Already migrated (v4 ID: ${existingUser.rows[0].educatorId})`)
      mappings.push({
        v3Id: v3Educator.id,
        v4Id: existingUser.rows[0].educatorId,
        name: v3Educator.name,
      })
      continue
    }

    // Create User + Educator in v4 using transaction
    const userId = cuid()
    const educatorId = cuid()
    const now = new Date()

    await v4Pool.query('BEGIN')

    try {
      // Insert User
      await v4Pool.query(
        `INSERT INTO "User" (id, email, name, image, role, "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'educator', true, $5, $5)`,
        [userId, email, v3Educator.name, v3Educator.imageUrl, now]
      )

      // Insert Educator
      await v4Pool.query(
        `INSERT INTO "Educator" (id, "userId", name, title, bio, "imageUrl", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
        [educatorId, userId, v3Educator.name, v3Educator.title, v3Educator.bio, v3Educator.imageUrl, now]
      )

      await v4Pool.query('COMMIT')

      console.log(`   ✅ Created (v4 ID: ${educatorId})`)

      mappings.push({
        v3Id: v3Educator.id,
        v4Id: educatorId,
        name: v3Educator.name,
      })
    } catch (error) {
      await v4Pool.query('ROLLBACK')
      throw error
    }
  }

  return mappings
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Educator Migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  if (!V3_DATABASE_URL) {
    console.error('❌ V3_DATABASE_URL not set in environment')
    console.error('   Add V3_DATABASE_URL to .env.local')
    process.exit(1)
  }

  if (!V4_DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in environment')
    process.exit(1)
  }

  // Initialize pg pools for both databases
  const v3Pool = new Pool({ connectionString: V3_DATABASE_URL })
  const v4Pool = new Pool({ connectionString: V4_DATABASE_URL })

  try {
    const mappings = await migrateEducators(v3Pool, v4Pool)

    // Save mappings to file for course migration
    const mappingPath = path.join(__dirname, 'educator-mapping.json')
    fs.writeFileSync(mappingPath, JSON.stringify(mappings, null, 2))

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Migration Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Migrated: ${mappings.length} educators`)
    console.log(`📄 Mapping saved: ${mappingPath}`)
    console.log('\nNext: Run migrate-courses.ts')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await v3Pool.end()
    await v4Pool.end()
  }
}

main()
