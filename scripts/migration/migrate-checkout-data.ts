/**
 * Migration script: BankData and Coupons from v3 → v4
 *
 * This script:
 * 1. Connects to v3 database using pg (raw SQL)
 * 2. Migrates BankData records to BankAccount model
 * 3. Migrates active Coupons (not expired, uses < maxUses)
 * 4. Handles course ID mapping for course-restricted coupons
 *
 * Run: pnpm tsx scripts/migration/migrate-checkout-data.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import { randomUUID } from 'crypto'

// Use DIRECT_DATABASE_URL for scripts (bypasses connection pooler)
const V4_DATABASE_URL = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
const V3_DATABASE_URL = process.env.V3_DATABASE_URL

// v3 model interfaces (from tinta-academy-v3/prisma/schema.prisma)
interface V3BankData {
  id: string
  name: string // Bank name (e.g., "BROU - Caja de Ahorro USD")
  info: string // Account details (multi-line text)
  createdAt: Date
  updatedAt: Date
}

interface V3Coupon {
  id: string
  code: string
  discount: number // percentage 0-100
  maxUses: number
  uses: number
  expiresAt: Date | null
  courseId: string | null // v3 courseId if restricted
  email: string | null // restricted to email
  createdAt: Date
  updatedAt: Date
}

// CourseMapping interface - used for documentation, maps v3 course IDs to v4
// The actual mapping is stored in a Map<string, string> for efficiency

function cuid(): string {
  const timestamp = Date.now().toString(36)
  const random = randomUUID().replace(/-/g, '').substring(0, 12)
  return `c${timestamp}${random}`
}

/**
 * Parse v3 BankData name and info to extract account details
 * v3 stores bank name like "BROU - Caja de Ahorro USD" and info as multi-line text
 */
function parseBankInfo(
  name: string,
  info: string
): {
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: 'USD' | 'UYU'
} {
  const lines = info.split('\n').map((l) => l.trim()).filter(Boolean)

  let bankName = name
  let accountHolder = ''
  let accountType = ''
  let accountNumber = ''
  // Infer currency from name (e.g., "BROU - Caja de Ahorro USD")
  let currency: 'USD' | 'UYU' = 'USD'

  const upperName = name.toUpperCase()
  if (upperName.includes('UYU') || upperName.includes('PESOS')) {
    currency = 'UYU'
  }

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    if (lowerLine.includes('titular:') || lowerLine.includes('nombre:')) {
      accountHolder = line.split(':').slice(1).join(':').trim()
    } else if (
      lowerLine.includes('caja de ahorro') ||
      lowerLine.includes('cuenta corriente') ||
      lowerLine.includes('savings') ||
      lowerLine.includes('checking')
    ) {
      accountType = line
    } else if (
      lowerLine.includes('nro:') ||
      lowerLine.includes('número:') ||
      lowerLine.includes('cuenta:') ||
      lowerLine.includes('account:')
    ) {
      accountNumber = line.split(':').slice(1).join(':').trim()
    } else if (/^\d[\d\s-]+$/.test(line)) {
      // Just a number, probably account number
      accountNumber = line.replace(/\s/g, '')
    }
  }

  // If bank name includes account type, extract it
  if (name.includes('-')) {
    const parts = name.split('-').map((p) => p.trim())
    bankName = parts[0]
    if (!accountType && parts[1]) {
      // Remove currency suffix from account type (e.g., "Caja de Ahorro USD" -> "Caja de Ahorro")
      accountType = parts[1].replace(/\s*(USD|UYU)\s*$/i, '').trim()
    }
  }

  return {
    bankName: bankName || 'Unknown',
    accountHolder: accountHolder || 'Tinta Academy',
    accountType: accountType || 'Cuenta',
    accountNumber: accountNumber || 'Ver detalles',
    currency,
  }
}

async function buildCourseMapping(v3Pool: Pool, v4Pool: Pool): Promise<Map<string, string>> {
  console.log('🔄 Building course mapping v3 → v4...')

  const v3Courses = await v3Pool.query<{ id: string; slug: string }>(
    'SELECT id, slug FROM "Course"'
  )
  const v4Courses = await v4Pool.query<{ id: string; slug: string }>(
    'SELECT id, slug FROM "Course"'
  )

  const v4BySlug = new Map<string, string>()
  for (const c of v4Courses.rows) {
    v4BySlug.set(c.slug, c.id)
  }

  const mapping = new Map<string, string>()
  for (const v3Course of v3Courses.rows) {
    const v4Id = v4BySlug.get(v3Course.slug)
    if (v4Id) {
      mapping.set(v3Course.id, v4Id)
    }
  }

  console.log(`📊 Mapped ${mapping.size} courses`)
  return mapping
}

async function migrateBankData(v3Pool: Pool, v4Pool: Pool): Promise<number> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Migrating Bank Accounts')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Check if BankData table exists in v3
  const tableCheck = await v3Pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'BankData'
    )
  `)

  if (!tableCheck.rows[0].exists) {
    console.log('⚠️  BankData table not found in v3 - skipping bank account migration')
    return 0
  }

  // v3 BankData only has: id, name, info, createdAt, updatedAt (no currency column)
  const result = await v3Pool.query<V3BankData>(
    'SELECT id, name, info, "createdAt", "updatedAt" FROM "BankData" ORDER BY "createdAt" ASC'
  )

  const v3Banks = result.rows
  console.log(`📊 Found ${v3Banks.length} bank accounts in v3`)

  let migrated = 0

  for (let i = 0; i < v3Banks.length; i++) {
    const bank = v3Banks[i]
    const parsedInfo = parseBankInfo(bank.name, bank.info)

    console.log(`\n🏦 Processing: ${bank.name}`)
    console.log(`   Currency (inferred): ${parsedInfo.currency}`)

    // Check if already exists by bank name + account number
    const existing = await v4Pool.query(
      'SELECT id FROM "BankAccount" WHERE "bankName" = $1 AND "accountNumber" = $2',
      [parsedInfo.bankName, parsedInfo.accountNumber]
    )

    if (existing.rows.length > 0) {
      console.log(`   ✅ Already exists (ID: ${existing.rows[0].id})`)
      continue
    }

    const id = cuid()
    const now = new Date()

    await v4Pool.query(
      `INSERT INTO "BankAccount"
       (id, "bankName", "accountHolder", "accountType", "accountNumber", currency, "displayOrder", "isActive", "createdAt", "updatedAt", notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $8, $9)`,
      [
        id,
        parsedInfo.bankName,
        parsedInfo.accountHolder,
        parsedInfo.accountType,
        parsedInfo.accountNumber,
        parsedInfo.currency,
        i, // displayOrder based on original order
        now,
        `Migrated from v3. Original info: ${bank.info}`, // Keep original info as note
      ]
    )

    console.log(`   ✅ Created (ID: ${id})`)
    migrated++
  }

  return migrated
}

async function migrateCoupons(
  v3Pool: Pool,
  v4Pool: Pool,
  courseMapping: Map<string, string>
): Promise<number> {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Migrating Coupons')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // Check if Coupon table exists in v3
  const tableCheck = await v3Pool.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_name = 'Coupon'
    )
  `)

  if (!tableCheck.rows[0].exists) {
    console.log('⚠️  Coupon table not found in v3 - skipping coupon migration')
    return 0
  }

  // Fetch active coupons (not expired or no expiry, uses < maxUses)
  const result = await v3Pool.query<V3Coupon>(
    `SELECT id, code, discount, "maxUses", uses, "expiresAt", "courseId", email, "createdAt", "updatedAt"
     FROM "Coupon"
     WHERE uses < "maxUses"
     AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
     ORDER BY "createdAt" ASC`
  )

  const v3Coupons = result.rows
  console.log(`📊 Found ${v3Coupons.length} active coupons in v3`)

  let migrated = 0
  const courseMappingIssues: string[] = []

  for (const coupon of v3Coupons) {
    console.log(`\n🎟️  Processing: ${coupon.code}`)
    console.log(`   Discount: ${coupon.discount}%`)
    console.log(`   Uses: ${coupon.uses}/${coupon.maxUses}`)

    // Check if already exists by code
    const existing = await v4Pool.query('SELECT id FROM "Coupon" WHERE code = $1', [coupon.code])

    if (existing.rows.length > 0) {
      console.log(`   ✅ Already exists (ID: ${existing.rows[0].id})`)
      continue
    }

    // Map course ID if restricted
    let restrictedToCourseId: string | null = null
    if (coupon.courseId) {
      restrictedToCourseId = courseMapping.get(coupon.courseId) || null
      if (!restrictedToCourseId) {
        console.log(`   ⚠️  Course ${coupon.courseId} not found in v4 - removing course restriction`)
        courseMappingIssues.push(`Coupon ${coupon.code}: v3 courseId ${coupon.courseId} not mapped`)
      }
    }

    const id = cuid()
    const now = new Date()

    await v4Pool.query(
      `INSERT INTO "Coupon"
       (id, code, "discountPercent", "maxUses", "currentUses", "restrictedToEmail", "restrictedToCourseId",
        "validFrom", "expiresAt", "isActive", description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $11)`,
      [
        id,
        coupon.code,
        coupon.discount,
        coupon.maxUses,
        coupon.uses, // Preserve current usage count
        coupon.email || null,
        restrictedToCourseId,
        coupon.createdAt,
        coupon.expiresAt,
        `Migrated from v3${coupon.courseId && !restrictedToCourseId ? ` (original courseId: ${coupon.courseId})` : ''}`,
        now,
      ]
    )

    console.log(`   ✅ Created (ID: ${id})`)
    migrated++
  }

  if (courseMappingIssues.length > 0) {
    console.log('\n⚠️  Course mapping issues:')
    courseMappingIssues.forEach((issue) => console.log(`   - ${issue}`))
  }

  return migrated
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Checkout Data Migration')
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

  const v3Pool = new Pool({ connectionString: V3_DATABASE_URL })
  const v4Pool = new Pool({ connectionString: V4_DATABASE_URL })

  try {
    // Build course mapping first (needed for coupon course restrictions)
    const courseMapping = await buildCourseMapping(v3Pool, v4Pool)

    // Migrate bank accounts
    const banksMigrated = await migrateBankData(v3Pool, v4Pool)

    // Migrate coupons
    const couponsMigrated = await migrateCoupons(v3Pool, v4Pool, courseMapping)

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('  Migration Summary')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Bank Accounts: ${banksMigrated} migrated`)
    console.log(`✅ Coupons: ${couponsMigrated} migrated`)
    console.log('\n📋 Manual steps if needed:')
    console.log('   - Review bank account details in Prisma Studio')
    console.log('   - Check coupon course restrictions are correct')
    console.log('   - Test coupon codes work as expected')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await v3Pool.end()
    await v4Pool.end()
  }
}

main()
