/**
 * Migration script: Courses from v3 → v4
 *
 * This script:
 * 1. Reads the educator mapping from migrate-educators.ts output
 * 2. Connects to v3 database using pg (raw SQL)
 * 3. Maps v3 data to v4 schema:
 *    - CourseType: WSET_NIVEL_X → type=wset + wsetLevel=X
 *    - CourseStatus: Anunciado→announced, Inscribiendo→enrolling, Finalizado→finished
 *    - Modality: default 'presencial' (v3 doesn't have this field)
 *    - Dates: classDates[0]→startDate, classDates[last] or examDate→endDate
 *    - Duration: totalDuration as string (e.g., '8 horas')
 *
 * Run: pnpm tsx scripts/migration/migrate-courses.ts
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

interface V3Course {
  id: string
  type: string
  status: string
  title: string
  slug: string
  totalDuration: number
  location: string | null
  maxCapacity: number
  priceUSD: number
  classDates: Date[]
  examDate: Date | null
  description: string | null
  imageUrl: string | null
  educatorId: string
  educatorName: string
  createdAt: Date
}

interface EducatorMapping {
  v3Id: string
  v4Id: string
  name: string
}

function cuid(): string {
  // Generate a cuid-like ID
  const timestamp = Date.now().toString(36)
  const random = randomUUID().replace(/-/g, '').substring(0, 12)
  return `c${timestamp}${random}`
}

// Type mapping from v3 to v4
function mapCourseType(v3Type: string): { type: string; wsetLevel: number | null } {
  switch (v3Type) {
    case 'WSET_NIVEL_1':
      return { type: 'wset', wsetLevel: 1 }
    case 'WSET_NIVEL_2':
      return { type: 'wset', wsetLevel: 2 }
    case 'WSET_NIVEL_3':
      return { type: 'wset', wsetLevel: 3 }
    case 'TALLER':
      return { type: 'taller', wsetLevel: null }
    case 'CATA':
      return { type: 'cata', wsetLevel: null }
    case 'CURSO':
      return { type: 'curso', wsetLevel: null }
    default:
      console.warn(`   ⚠️  Unknown course type: ${v3Type}, defaulting to 'curso'`)
      return { type: 'curso', wsetLevel: null }
  }
}

// Status mapping from v3 to v4
function mapCourseStatus(v3Status: string): string {
  switch (v3Status) {
    case 'Anunciado':
      return 'announced'
    case 'Inscribiendo':
      return 'enrolling'
    case 'Finalizado':
      return 'finished'
    default:
      console.warn(`   ⚠️  Unknown course status: ${v3Status}, defaulting to 'announced'`)
      return 'announced'
  }
}

async function migrateCourses(
  v3Pool: Pool,
  v4Pool: Pool,
  educatorMappings: EducatorMapping[]
): Promise<number> {
  console.log('🔄 Fetching courses from v3 database...')

  // Create educator ID lookup
  const educatorMap = new Map<string, string>()
  for (const mapping of educatorMappings) {
    educatorMap.set(mapping.v3Id, mapping.v4Id)
  }

  // Fetch all courses from v3 with educator name using raw SQL
  const result = await v3Pool.query<V3Course>(`
    SELECT
      c.id, c.type, c.status, c.title, c.slug,
      c."totalDuration", c.location, c."maxCapacity", c."priceUSD",
      c."classDates", c."examDate", c.description, c."imageUrl",
      c."educatorId", e.name as "educatorName", c."createdAt"
    FROM "Course" c
    JOIN "Educator" e ON c."educatorId" = e.id
    ORDER BY c."createdAt" ASC
  `)

  const v3Courses = result.rows
  console.log(`📊 Found ${v3Courses.length} courses in v3`)

  let migratedCount = 0
  let skippedCount = 0

  for (const v3Course of v3Courses) {
    console.log(`\n📚 Processing: ${v3Course.title}`)
    console.log(`   v3 ID: ${v3Course.id}`)
    console.log(`   Slug: ${v3Course.slug}`)

    // Check if course already exists in v4
    const existingCourse = await v4Pool.query(
      'SELECT id FROM "Course" WHERE slug = $1',
      [v3Course.slug]
    )

    if (existingCourse.rows.length > 0) {
      console.log(`   ⏭️  Already exists in v4 (ID: ${existingCourse.rows[0].id})`)
      skippedCount++
      continue
    }

    // Get v4 educator ID
    const v4EducatorId = educatorMap.get(v3Course.educatorId)
    if (!v4EducatorId) {
      console.error(`   ❌ No educator mapping for v3 ID: ${v3Course.educatorId}`)
      console.error(`      Run migrate-educators.ts first!`)
      continue
    }

    // Map course type and wset level
    const { type, wsetLevel } = mapCourseType(v3Course.type)

    // Map course status
    const status = mapCourseStatus(v3Course.status)

    // Calculate dates
    const classDates = v3Course.classDates || []
    const startDate = classDates.length > 0 ? classDates[0] : null
    const endDate = v3Course.examDate || (classDates.length > 0 ? classDates[classDates.length - 1] : null)

    // Format duration
    const duration = `${v3Course.totalDuration} horas`

    // Default modality to presencial (v3 doesn't have this field)
    const modality = 'presencial'

    console.log(`   Type: ${v3Course.type} → ${type}${wsetLevel ? ` (level ${wsetLevel})` : ''}`)
    console.log(`   Status: ${v3Course.status} → ${status}`)
    console.log(`   Educator: ${v3Course.educatorName} (v4 ID: ${v4EducatorId})`)

    // Create course in v4
    const courseId = cuid()
    const now = new Date()

    await v4Pool.query(
      `INSERT INTO "Course" (
        id, slug, title, type, modality, description,
        "startDate", "endDate", duration, "maxCapacity", "enrolledCount",
        "priceUSD", location, "imageUrl", status, "educatorId", "wsetLevel",
        "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16, $17,
        $18, $18
      )`,
      [
        courseId, v3Course.slug, v3Course.title, type, modality, v3Course.description,
        startDate, endDate, duration, v3Course.maxCapacity, 0,
        v3Course.priceUSD, v3Course.location, v3Course.imageUrl, status, v4EducatorId, wsetLevel,
        now
      ]
    )

    console.log(`   ✅ Migrated successfully (v4 ID: ${courseId})`)
    migratedCount++
  }

  console.log(`\n   Skipped: ${skippedCount} (already exist)`)
  return migratedCount
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Course Migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Load educator mappings
  const mappingPath = path.join(__dirname, 'educator-mapping.json')

  if (!fs.existsSync(mappingPath)) {
    console.error('❌ Educator mapping file not found!')
    console.error('   Run migrate-educators.ts first.')
    process.exit(1)
  }

  const educatorMappings: EducatorMapping[] = JSON.parse(
    fs.readFileSync(mappingPath, 'utf-8')
  )

  console.log(`📄 Loaded ${educatorMappings.length} educator mappings`)

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
    const migratedCount = await migrateCourses(v3Pool, v4Pool, educatorMappings)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Migration Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Migrated: ${migratedCount} courses`)
    console.log('\n🎉 Migration complete!')
    console.log('   Verify data with: pnpm prisma studio')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await v3Pool.end()
    await v4Pool.end()
  }
}

main()
