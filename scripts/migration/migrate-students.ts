/**
 * Migration script: Students from v3 → v4
 *
 * This script:
 * 1. Connects to v3 database using pg (raw SQL)
 * 2. For each v3 student, creates:
 *    - A User with the student's email, role: student
 *    - A Student linked to that User
 * 3. Outputs a mapping of v3 studentId → v4 studentId for enrollment migration
 *
 * Run: pnpm tsx scripts/migration/migrate-students.ts
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

interface V3Student {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: Date | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  zip: string | null
  country: string | null
  createdAt: Date
  userId: string
}

interface StudentMapping {
  v3Id: string
  v4Id: string
  email: string
  name: string
}

function cuid(): string {
  // Generate a cuid-like ID
  const timestamp = Date.now().toString(36)
  const random = randomUUID().replace(/-/g, '').substring(0, 12)
  return `c${timestamp}${random}`
}

async function migrateStudents(
  v3Pool: Pool,
  v4Pool: Pool
): Promise<StudentMapping[]> {
  console.log('🔄 Fetching students from v3 database...')

  // Fetch all students from v3 (v3 Student has email directly)
  const result = await v3Pool.query<V3Student>(
    `SELECT
      id, "firstName", "lastName", "dateOfBirth", email,
      phone, address, city, zip, country,
      "createdAt", "userId"
     FROM "Student"
     ORDER BY "createdAt" ASC`
  )

  const v3Students = result.rows
  console.log(`📊 Found ${v3Students.length} students in v3`)

  const mappings: StudentMapping[] = []
  let skipped = 0
  let created = 0

  for (const v3Student of v3Students) {
    const fullName = [v3Student.firstName, v3Student.lastName].filter(Boolean).join(' ') || 'Student'

    console.log(`\n👤 Processing: ${fullName}`)
    console.log(`   v3 ID: ${v3Student.id}`)
    console.log(`   Email: ${v3Student.email}`)

    // Check if user already exists in v4
    const existingUser = await v4Pool.query(
      `SELECT u.id as "userId", s.id as "studentId"
       FROM "User" u
       LEFT JOIN "Student" s ON s."userId" = u.id
       WHERE u.email = $1`,
      [v3Student.email]
    )

    if (existingUser.rows.length > 0 && existingUser.rows[0].studentId) {
      console.log(`   ✅ Already migrated (v4 ID: ${existingUser.rows[0].studentId})`)
      mappings.push({
        v3Id: v3Student.id,
        v4Id: existingUser.rows[0].studentId,
        email: v3Student.email,
        name: fullName,
      })
      skipped++
      continue
    }

    // Create User + Student in v4 using transaction
    const userId = existingUser.rows.length > 0 ? existingUser.rows[0].userId : cuid()
    const studentId = cuid()
    const now = new Date()

    await v4Pool.query('BEGIN')

    try {
      // Insert User if not exists
      if (existingUser.rows.length === 0) {
        await v4Pool.query(
          `INSERT INTO "User" (id, email, name, role, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, 'student', true, $4, $4)`,
          [userId, v3Student.email, fullName, now]
        )
      }

      // Insert Student
      await v4Pool.query(
        `INSERT INTO "Student" (id, "userId", "firstName", "lastName", "dateOfBirth", phone, address, city, zip, country, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)`,
        [
          studentId,
          userId,
          v3Student.firstName,
          v3Student.lastName,
          v3Student.dateOfBirth,
          v3Student.phone,
          v3Student.address,
          v3Student.city,
          v3Student.zip,
          v3Student.country,
          now,
        ]
      )

      await v4Pool.query('COMMIT')

      console.log(`   ✅ Created (v4 ID: ${studentId})`)

      mappings.push({
        v3Id: v3Student.id,
        v4Id: studentId,
        email: v3Student.email,
        name: fullName,
      })
      created++
    } catch (error) {
      await v4Pool.query('ROLLBACK')
      console.error(`   ❌ Failed to migrate: ${error}`)
      // Continue with next student instead of failing entirely
    }
  }

  console.log(`\n📈 Created: ${created}, Skipped (already exists): ${skipped}`)
  return mappings
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Student Migration')
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
    const mappings = await migrateStudents(v3Pool, v4Pool)

    // Save mappings to file for enrollment migration
    const mappingPath = path.join(__dirname, 'student-mapping.json')
    fs.writeFileSync(mappingPath, JSON.stringify(mappings, null, 2))

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Migration Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Migrated: ${mappings.length} students`)
    console.log(`📄 Mapping saved: ${mappingPath}`)
    console.log('\nNext: Run migrate-enrollments.ts')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await v3Pool.end()
    await v4Pool.end()
  }
}

main()
