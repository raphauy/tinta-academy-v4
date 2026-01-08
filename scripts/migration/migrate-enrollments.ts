/**
 * Migration script: Enrollments from v3 Orders → v4 Enrollments
 *
 * This script:
 * 1. Loads student mappings from migrate-students.ts output
 * 2. Creates course mappings by querying both databases by slug
 * 3. Connects to v3 database and fetches all Orders
 * 4. Maps v3 OrderStatus to v4 EnrollmentStatus:
 *    - Paid → confirmed
 *    - Created, Pending, PaymentSent → pending
 *    - Rejected, Refunded, Cancelled → cancelled
 * 5. Creates Enrollments in v4 database
 * 6. Updates enrolledCount for each course based on confirmed enrollments
 *
 * Run: pnpm tsx scripts/migration/migrate-enrollments.ts
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

interface V3Order {
  id: string
  studentId: string
  courseId: string
  status: string
  createdAt: Date
  courseSlug: string
}

interface StudentMapping {
  v3Id: string
  v4Id: string
  email: string
  name: string
}

// CourseMapping is built dynamically by buildCourseMappings function

function cuid(): string {
  const timestamp = Date.now().toString(36)
  const random = randomUUID().replace(/-/g, '').substring(0, 12)
  return `c${timestamp}${random}`
}

// Map v3 OrderStatus to v4 EnrollmentStatus
function mapOrderStatus(v3Status: string): 'pending' | 'confirmed' | 'cancelled' {
  switch (v3Status) {
    case 'Paid':
      return 'confirmed'
    case 'Created':
    case 'Pending':
    case 'PaymentSent':
      return 'pending'
    case 'Rejected':
    case 'Refunded':
    case 'Cancelled':
      return 'cancelled'
    default:
      console.warn(`   ⚠️  Unknown order status: ${v3Status}, defaulting to 'pending'`)
      return 'pending'
  }
}

async function buildCourseMappings(v3Pool: Pool, v4Pool: Pool): Promise<Map<string, string>> {
  console.log('🔄 Building course mappings by slug...')

  // Get all courses from v3
  const v3Courses = await v3Pool.query<{ id: string; slug: string }>(
    `SELECT id, slug FROM "Course"`
  )

  // Get all courses from v4
  const v4Courses = await v4Pool.query<{ id: string; slug: string }>(
    `SELECT id, slug FROM "Course"`
  )

  // Create v4 slug -> id lookup
  const v4BySlug = new Map<string, string>()
  for (const course of v4Courses.rows) {
    v4BySlug.set(course.slug, course.id)
  }

  // Build v3 id -> v4 id mapping
  const courseMap = new Map<string, string>()
  let matched = 0
  let unmatched = 0

  for (const v3Course of v3Courses.rows) {
    const v4Id = v4BySlug.get(v3Course.slug)
    if (v4Id) {
      courseMap.set(v3Course.id, v4Id)
      matched++
    } else {
      console.log(`   ⚠️  No v4 course found for slug: ${v3Course.slug}`)
      unmatched++
    }
  }

  console.log(`   ✅ Matched: ${matched} courses`)
  if (unmatched > 0) {
    console.log(`   ⚠️  Unmatched: ${unmatched} courses (their enrollments will be skipped)`)
  }

  return courseMap
}

async function migrateEnrollments(
  v3Pool: Pool,
  v4Pool: Pool,
  studentMap: Map<string, string>,
  courseMap: Map<string, string>
): Promise<{ created: number; skipped: number; errors: number }> {
  console.log('\n🔄 Fetching orders from v3 database...')

  // Fetch all orders from v3
  const result = await v3Pool.query<V3Order>(`
    SELECT
      o.id, o."studentId", o."courseId", o.status, o."createdAt",
      c.slug as "courseSlug"
    FROM "Order" o
    JOIN "Course" c ON o."courseId" = c.id
    ORDER BY o."createdAt" ASC
  `)

  const v3Orders = result.rows
  console.log(`📊 Found ${v3Orders.length} orders in v3`)

  let created = 0
  let skipped = 0
  let errors = 0

  // Track existing enrollments to handle duplicates (keep most recent/confirmed)
  const existingEnrollments = new Map<string, { id: string; status: string; enrolledAt: Date }>()

  // First, load existing enrollments from v4
  const existingResult = await v4Pool.query<{ id: string; studentId: string; courseId: string; status: string; enrolledAt: Date }>(
    `SELECT id, "studentId", "courseId", status, "enrolledAt" FROM "Enrollment"`
  )
  for (const enrollment of existingResult.rows) {
    const key = `${enrollment.studentId}:${enrollment.courseId}`
    existingEnrollments.set(key, {
      id: enrollment.id,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
    })
  }

  for (const order of v3Orders) {
    // Get v4 IDs
    const v4StudentId = studentMap.get(order.studentId)
    const v4CourseId = courseMap.get(order.courseId)

    if (!v4StudentId) {
      console.log(`   ⏭️  Skipping order ${order.id}: student not found in mappings`)
      skipped++
      continue
    }

    if (!v4CourseId) {
      console.log(`   ⏭️  Skipping order ${order.id}: course "${order.courseSlug}" not migrated`)
      skipped++
      continue
    }

    const status = mapOrderStatus(order.status)
    const key = `${v4StudentId}:${v4CourseId}`
    const existing = existingEnrollments.get(key)

    // Handle duplicates: keep confirmed over pending/cancelled, or most recent
    if (existing) {
      const shouldUpdate =
        (status === 'confirmed' && existing.status !== 'confirmed') ||
        (status === existing.status && order.createdAt > existing.enrolledAt)

      if (shouldUpdate) {
        // Update existing enrollment
        try {
          await v4Pool.query(
            `UPDATE "Enrollment" SET status = $1, "enrolledAt" = $2, "updatedAt" = $3 WHERE id = $4`,
            [status, order.createdAt, new Date(), existing.id]
          )
          existingEnrollments.set(key, {
            id: existing.id,
            status,
            enrolledAt: order.createdAt,
          })
          console.log(`   🔄 Updated enrollment for student ${v4StudentId} in course ${v4CourseId} → ${status}`)
        } catch (error) {
          console.error(`   ❌ Failed to update enrollment: ${error}`)
          errors++
        }
      } else {
        skipped++
      }
      continue
    }

    // Create new enrollment
    const enrollmentId = cuid()
    const now = new Date()

    try {
      await v4Pool.query(
        `INSERT INTO "Enrollment" (id, "studentId", "courseId", "enrolledAt", status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $6)`,
        [enrollmentId, v4StudentId, v4CourseId, order.createdAt, status, now]
      )

      existingEnrollments.set(key, {
        id: enrollmentId,
        status,
        enrolledAt: order.createdAt,
      })

      created++
    } catch (error) {
      console.error(`   ❌ Failed to create enrollment: ${error}`)
      errors++
    }
  }

  return { created, skipped, errors }
}

async function updateEnrolledCounts(v4Pool: Pool): Promise<number> {
  console.log('\n🔄 Updating enrolledCount for courses...')

  // Get confirmed enrollment counts per course
  const result = await v4Pool.query<{ courseId: string; count: string }>(`
    SELECT "courseId", COUNT(*) as count
    FROM "Enrollment"
    WHERE status = 'confirmed'
    GROUP BY "courseId"
  `)

  let updated = 0

  // Reset all counts first
  await v4Pool.query(`UPDATE "Course" SET "enrolledCount" = 0`)

  // Update counts for courses with enrollments
  for (const row of result.rows) {
    await v4Pool.query(
      `UPDATE "Course" SET "enrolledCount" = $1 WHERE id = $2`,
      [parseInt(row.count), row.courseId]
    )
    updated++
  }

  console.log(`   ✅ Updated ${updated} courses with enrollment counts`)
  return updated
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Enrollment Migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Load student mappings
  const studentMappingPath = path.join(__dirname, 'student-mapping.json')

  if (!fs.existsSync(studentMappingPath)) {
    console.error('❌ Student mapping file not found!')
    console.error('   Run migrate-students.ts first.')
    process.exit(1)
  }

  const studentMappings: StudentMapping[] = JSON.parse(
    fs.readFileSync(studentMappingPath, 'utf-8')
  )

  console.log(`📄 Loaded ${studentMappings.length} student mappings`)

  // Build student map
  const studentMap = new Map<string, string>()
  for (const mapping of studentMappings) {
    studentMap.set(mapping.v3Id, mapping.v4Id)
  }

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
    // Build course mappings by querying both databases
    const courseMap = await buildCourseMappings(v3Pool, v4Pool)

    // Migrate enrollments
    const { created, skipped, errors } = await migrateEnrollments(v3Pool, v4Pool, studentMap, courseMap)

    // Update enrolled counts
    await updateEnrolledCounts(v4Pool)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Migration Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Created: ${created} enrollments`)
    console.log(`⏭️  Skipped: ${skipped} (duplicates or missing references)`)
    if (errors > 0) {
      console.log(`❌ Errors: ${errors}`)
    }
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
