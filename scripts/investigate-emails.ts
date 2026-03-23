import { config } from 'dotenv'
config({ path: '.env.local' })

import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!)

async function main() {
  const emails = ['fbolognaboidi@gmail.com', 'mathiasdiron@gmail.com']

  console.log('=== 1. USERS ===')
  const users = await sql`SELECT id, email, name, role, "isActive" FROM "User" WHERE email = ANY(${emails})`
  console.table(users)

  const userIds = users.map(u => u.id)

  console.log('\n=== 2. STUDENTS ===')
  const students = await sql`
    SELECT s.id, s."userId", s."firstName", s."lastName", u.email as "userEmail"
    FROM "Student" s JOIN "User" u ON s."userId" = u.id
    WHERE s."userId" = ANY(${userIds})`
  console.table(students)

  const studentIds = students.map(s => s.id)

  console.log('\n=== 3. ENROLLMENTS ===')
  const enrollments = await sql`
    SELECT e.id, e."studentId", e.status, c.title as "courseTitle"
    FROM "Enrollment" e JOIN "Course" c ON e."courseId" = c.id
    WHERE e."studentId" = ANY(${studentIds})`
  console.table(enrollments)

  console.log('\n=== 4. ORDERS (by userId) ===')
  const orders = await sql`
    SELECT o.id, o."orderNumber", o."userId", o."studentId", o.status,
           u.email as "userEmail", c.title as "courseTitle"
    FROM "Order" o
    JOIN "User" u ON o."userId" = u.id
    JOIN "Course" c ON o."courseId" = c.id
    WHERE o."userId" = ANY(${userIds})`
  console.table(orders)

  console.log('\n=== 5. EMAIL RECIPIENTS (by email or studentId) ===')
  const recipients = await sql`
    SELECT er.id, er."campaignId", er."studentId", er.email, er.status,
           ec.name as "campaignName"
    FROM "EmailRecipient" er
    JOIN "EmailCampaign" ec ON er."campaignId" = ec.id
    WHERE er.email = ANY(${emails}) OR er."studentId" = ANY(${studentIds})`
  console.table(recipients)

  console.log('\n=== 6. WORKFLOW EXECUTIONS (by email or studentId) ===')
  const execs = await sql`
    SELECT we.id, we."studentId", we.email, we.status, we."scheduledAt"
    FROM "WorkflowExecution" we
    WHERE we.email = ANY(${emails}) OR we."studentId" = ANY(${studentIds})`
  console.table(execs)
}

main().catch(console.error)
