/**
 * Migration script: Orders from v3 → v4
 *
 * This script:
 * 1. Loads student mappings from migrate-students.ts output
 * 2. Creates course mappings by querying both databases by slug
 * 3. Creates user mappings (student email → v4 userId)
 * 4. Connects to v3 database and fetches all Orders
 * 5. Maps v3 Order fields to v4 Order model
 * 6. Creates Orders in v4 database
 *
 * Prerequisites:
 * - Students already migrated (student-mapping.json exists)
 * - Courses already migrated
 *
 * Run: pnpm tsx scripts/migration/migrate-orders.ts
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

// v3 Order model (based on tinta-academy-v3/prisma/schema.prisma)
interface V3Order {
  id: string
  number: number
  studentId: string
  courseId: string
  status: string // 'Created', 'Pending', 'PaymentSent', 'Paid', 'Rejected', 'Refunded', 'Cancelled'
  email: string
  paymentMethod: string // 'MercadoPago', 'TransferenciaBancaria', 'Gratuito'
  amount: number
  currency: string
  bankDataId: string | null
  bankTransferComment: string | null
  couponId: string | null
  createdAt: Date
  updatedAt: Date
  // Joined fields
  courseSlug: string
  studentEmail: string
}

interface StudentMapping {
  v3Id: string
  v4Id: string
  email: string
  name: string
}

function cuid(): string {
  const timestamp = Date.now().toString(36)
  const random = randomUUID().replace(/-/g, '').substring(0, 12)
  return `c${timestamp}${random}`
}

/**
 * Generate order number in format TA-YYYYMMDD-XXXX
 */
function generateOrderNumber(date: Date, index: number): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  // Use index to ensure uniqueness within same day
  const suffix = String(index).padStart(4, '0')
  return `TA-${year}${month}${day}-${suffix}`
}

/**
 * Map v3 OrderStatus to v4 OrderStatus
 */
function mapOrderStatus(
  v3Status: string
): 'created' | 'pending_payment' | 'payment_processing' | 'paid' | 'cancelled' | 'refunded' | 'rejected' {
  switch (v3Status) {
    case 'Paid':
      return 'paid'
    case 'Created':
      return 'created'
    case 'Pending':
      return 'pending_payment'
    case 'PaymentSent':
      return 'pending_payment' // User said they sent the transfer
    case 'Rejected':
      return 'rejected'
    case 'Refunded':
      return 'refunded'
    case 'Cancelled':
      return 'cancelled'
    default:
      console.warn(`   ⚠️  Unknown order status: ${v3Status}, defaulting to 'created'`)
      return 'created'
  }
}

/**
 * Map v3 payment method to v4
 */
function mapPaymentMethod(v3Method: string): 'mercadopago' | 'bank_transfer' | 'free' {
  switch (v3Method) {
    case 'MercadoPago':
      return 'mercadopago'
    case 'TransferenciaBancaria':
      return 'bank_transfer'
    case 'Gratuito':
      return 'free'
    default:
      console.warn(`   ⚠️  Unknown payment method: ${v3Method}, defaulting to 'mercadopago'`)
      return 'mercadopago'
  }
}

/**
 * Map v3 currency to v4
 */
function mapCurrency(v3Currency: string): 'USD' | 'UYU' {
  const upper = v3Currency.toUpperCase()
  if (upper === 'UYU' || upper.includes('UYU') || upper.includes('PESO')) {
    return 'UYU'
  }
  return 'USD'
}

async function buildCourseMappings(v3Pool: Pool, v4Pool: Pool): Promise<Map<string, { v4Id: string; priceUSD: number; priceUYU: number }>> {
  console.log('🔄 Building course mappings by slug...')

  // Get all courses from v3 with prices
  const v3Courses = await v3Pool.query<{ id: string; slug: string; priceUSD: number; priceUYU: number }>(
    `SELECT id, slug, "priceUSD", "priceUYU" FROM "Course"`
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

  // Build v3 id -> v4 data mapping (using v3 prices as they were at time of order)
  const courseMap = new Map<string, { v4Id: string; priceUSD: number; priceUYU: number }>()
  let matched = 0
  let unmatched = 0

  for (const v3Course of v3Courses.rows) {
    const v4Id = v4BySlug.get(v3Course.slug)
    if (v4Id) {
      courseMap.set(v3Course.id, {
        v4Id,
        priceUSD: v3Course.priceUSD,
        priceUYU: v3Course.priceUYU,
      })
      matched++
    } else {
      console.log(`   ⚠️  No v4 course found for slug: ${v3Course.slug}`)
      unmatched++
    }
  }

  console.log(`   ✅ Matched: ${matched} courses`)
  if (unmatched > 0) {
    console.log(`   ⚠️  Unmatched: ${unmatched} courses (their orders will be skipped)`)
  }

  return courseMap
}

async function buildUserMappings(v4Pool: Pool, studentMappings: StudentMapping[]): Promise<Map<string, string>> {
  console.log('🔄 Building user mappings by email...')

  // Get all users from v4
  const v4Users = await v4Pool.query<{ id: string; email: string }>(
    `SELECT id, email FROM "User"`
  )

  // Create email -> userId lookup
  const userByEmail = new Map<string, string>()
  for (const user of v4Users.rows) {
    userByEmail.set(user.email.toLowerCase(), user.id)
  }

  // Build student email -> v4 userId mapping
  const userMap = new Map<string, string>()
  for (const student of studentMappings) {
    const userId = userByEmail.get(student.email.toLowerCase())
    if (userId) {
      userMap.set(student.email.toLowerCase(), userId)
    }
  }

  console.log(`   ✅ Mapped ${userMap.size} users`)
  return userMap
}

async function getExistingOrderNumbers(v4Pool: Pool): Promise<Set<string>> {
  const result = await v4Pool.query<{ orderNumber: string }>(
    `SELECT "orderNumber" FROM "Order"`
  )
  return new Set(result.rows.map((r) => r.orderNumber))
}

async function migrateOrders(
  v3Pool: Pool,
  v4Pool: Pool,
  studentMap: Map<string, string>,
  courseMap: Map<string, { v4Id: string; priceUSD: number; priceUYU: number }>,
  userMap: Map<string, string>
): Promise<{ created: number; skipped: number; errors: number }> {
  console.log('\n🔄 Fetching orders from v3 database...')

  // Fetch all orders from v3 with course slug and student email
  const query = `
    SELECT
      o.id, o.number, o."studentId", o."courseId", o.status, o.email,
      o."paymentMethod", o.amount, o.currency,
      o."bankDataId", o."bankTransferComment", o."couponId",
      o."createdAt", o."updatedAt",
      c.slug as "courseSlug",
      s.email as "studentEmail"
    FROM "Order" o
    JOIN "Course" c ON o."courseId" = c.id
    JOIN "Student" s ON o."studentId" = s.id
    ORDER BY o."createdAt" ASC
  `

  const result = await v3Pool.query<V3Order>(query)
  const v3Orders = result.rows
  console.log(`📊 Found ${v3Orders.length} orders in v3`)

  // Get existing order numbers to avoid duplicates
  const existingOrderNumbers = await getExistingOrderNumbers(v4Pool)
  console.log(`   📋 Found ${existingOrderNumbers.size} existing orders in v4`)

  let created = 0
  let skipped = 0
  let errors = 0
  let orderIndex = existingOrderNumbers.size // Start from existing count for unique order numbers

  // Track orders by day for unique order number generation
  const ordersByDay = new Map<string, number>()

  for (const order of v3Orders) {
    // Get v4 IDs
    const v4StudentId = studentMap.get(order.studentId)
    const courseData = courseMap.get(order.courseId)
    const v4UserId = userMap.get(order.studentEmail?.toLowerCase() || '')

    if (!v4StudentId) {
      console.log(`   ⏭️  Skipping order ${order.id}: student not found in mappings`)
      skipped++
      continue
    }

    if (!courseData) {
      console.log(`   ⏭️  Skipping order ${order.id}: course "${order.courseSlug}" not migrated`)
      skipped++
      continue
    }

    if (!v4UserId) {
      console.log(`   ⏭️  Skipping order ${order.id}: user for email "${order.studentEmail}" not found`)
      skipped++
      continue
    }

    // Generate unique order number
    const orderDate = new Date(order.createdAt)
    const dayKey = orderDate.toISOString().split('T')[0]
    const dayCount = ordersByDay.get(dayKey) || 0
    ordersByDay.set(dayKey, dayCount + 1)

    let orderNumber = generateOrderNumber(orderDate, dayCount + 1)

    // Ensure uniqueness
    while (existingOrderNumbers.has(orderNumber)) {
      orderIndex++
      orderNumber = generateOrderNumber(orderDate, orderIndex)
    }
    existingOrderNumbers.add(orderNumber)

    const status = mapOrderStatus(order.status)
    const paymentMethod = mapPaymentMethod(order.paymentMethod)
    const currency = mapCurrency(order.currency)
    const finalAmount = order.amount

    // Use original price based on currency
    const originalPriceUSD = courseData.priceUSD
    const originalPriceUYU = courseData.priceUYU

    // Calculate discount if finalAmount differs from original price
    let discountAmount = 0
    let discountPercent = 0
    const originalPrice = currency === 'USD' ? originalPriceUSD : originalPriceUYU
    if (finalAmount < originalPrice) {
      discountAmount = originalPrice - finalAmount
      discountPercent = Math.round((discountAmount / originalPrice) * 100)
    }

    // Determine timestamps based on status
    let paidAt: Date | null = null
    let cancelledAt: Date | null = null
    let refundedAt: Date | null = null

    if (status === 'paid') {
      paidAt = order.updatedAt || order.createdAt
    } else if (status === 'cancelled' || status === 'rejected') {
      cancelledAt = order.updatedAt || order.createdAt
    } else if (status === 'refunded') {
      refundedAt = order.updatedAt || order.createdAt
      paidAt = order.createdAt // Was paid before refund
    }

    try {
      await v4Pool.query(
        `INSERT INTO "Order" (
          id, "orderNumber", "userId", "courseId", "studentId",
          "originalPriceUSD", "originalPriceUYU", "discountPercent", "discountAmount", "finalAmount", currency,
          "paymentMethod", status, "transferReference",
          "createdAt", "updatedAt", "paidAt", "cancelledAt", "refundedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15, $16, $17, $18)`,
        [
          cuid(),
          orderNumber,
          v4UserId,
          courseData.v4Id,
          status === 'paid' ? v4StudentId : null, // Only link student if paid
          originalPriceUSD,
          originalPriceUYU,
          discountPercent,
          discountAmount,
          finalAmount,
          currency,
          paymentMethod,
          status,
          order.bankTransferComment || null, // Map to transferReference
          order.createdAt,
          paidAt,
          cancelledAt,
          refundedAt,
        ]
      )

      created++
      if (created % 50 === 0) {
        console.log(`   ✅ Created ${created} orders...`)
      }
    } catch (error) {
      console.error(`   ❌ Failed to create order ${order.id}: ${error}`)
      errors++
    }
  }

  return { created, skipped, errors }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Order Migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Load student mappings
  const studentMappingPath = path.join(__dirname, 'student-mapping.json')

  if (!fs.existsSync(studentMappingPath)) {
    console.error('❌ Student mapping file not found!')
    console.error('   Run migrate-students.ts first.')
    process.exit(1)
  }

  const studentMappings: StudentMapping[] = JSON.parse(fs.readFileSync(studentMappingPath, 'utf-8'))
  console.log(`📄 Loaded ${studentMappings.length} student mappings`)

  // Build student map (v3Id -> v4Id)
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

    // Build user mappings
    const userMap = await buildUserMappings(v4Pool, studentMappings)

    // Migrate orders
    const { created, skipped, errors } = await migrateOrders(v3Pool, v4Pool, studentMap, courseMap, userMap)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Migration Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Created: ${created} orders`)
    console.log(`⏭️  Skipped: ${skipped} (missing references)`)
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
