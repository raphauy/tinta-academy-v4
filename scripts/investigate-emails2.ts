import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!)

async function main() {
  // Check if fbolognaboidi exists anywhere
  console.log('=== Searching for fbolognaboidi@gmail.com ANYWHERE ===')
  
  console.log('\n-- In User table:')
  const users = await sql`SELECT id, email, name, role FROM "User" WHERE email ILIKE '%fbologna%' OR email ILIKE '%bologna%'`
  console.table(users)

  console.log('\n-- In Order table (all fields):')
  const orders = await sql`SELECT id, "orderNumber", "userId", "studentId", status FROM "Order" WHERE "userId" IN (SELECT id FROM "User" WHERE email ILIKE '%fbologna%')`
  console.table(orders)
  
  console.log('\n-- In EmailRecipient table:')
  const recipients = await sql`SELECT id, email, "studentId", "campaignId" FROM "EmailRecipient" WHERE email ILIKE '%fbologna%'`
  console.table(recipients)

  console.log('\n-- In WorkflowExecution table:')
  const execs = await sql`SELECT id, email, "studentId" FROM "WorkflowExecution" WHERE email ILIKE '%fbologna%'`
  console.table(execs)

  console.log('\n-- In NewsletterSubscription table:')
  const newsletter = await sql`SELECT id, email, "isActive" FROM "NewsletterSubscription" WHERE email ILIKE '%fbologna%'`
  console.table(newsletter)

  console.log('\n-- In Coupon table (restrictedToEmail):')
  const coupons = await sql`SELECT id, code, "restrictedToEmail" FROM "Coupon" WHERE "restrictedToEmail" ILIKE '%fbologna%'`
  console.table(coupons)

  // Now let's look at the campaign from the screenshot to understand where emails come from
  console.log('\n=== Campaign recipients for "A 2 días del WSET 1" ===')
  const campaignRecipients = await sql`
    SELECT er.id, er.email, er."studentId", er.status,
           s."firstName", s."lastName", u.email as "userEmail"
    FROM "EmailRecipient" er
    JOIN "Student" s ON er."studentId" = s.id
    JOIN "User" u ON s."userId" = u.id
    WHERE er."campaignId" = 'cmmjsfvhb000004jrv649o362'`
  console.table(campaignRecipients)

  // Check: what was the original email on the order before the change?
  console.log('\n=== Order TA-20260115-7704 details ===')
  const orderDetail = await sql`
    SELECT o.*, u.email as "buyerEmail" 
    FROM "Order" o 
    JOIN "User" u ON o."userId" = u.id 
    WHERE o."orderNumber" = 'TA-20260115-7704'`
  console.table(orderDetail)
}

main().catch(console.error)
