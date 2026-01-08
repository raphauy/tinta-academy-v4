/**
 * Migration script: Run all migrations in sequence
 *
 * This script runs all migration scripts in the correct order:
 * 1. Educators (generates educator-mapping.json)
 * 2. Courses (uses educator-mapping.json, generates course-mapping.json)
 * 3. Students (generates student-mapping.json)
 * 4. Enrollments (uses student-mapping.json and course-mapping.json)
 *
 * Run: pnpm tsx scripts/migration/migrate-all.ts
 */

import { execSync } from 'child_process'
import * as path from 'path'

const scripts = [
  { name: 'Educators', file: 'migrate-educators.ts' },
  { name: 'Courses', file: 'migrate-courses.ts' },
  { name: 'Students', file: 'migrate-students.ts' },
  { name: 'Enrollments', file: 'migrate-enrollments.ts' },
]

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Tinta Academy v3 → v4 Full Migration')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script.file)

    console.log(`\n${'═'.repeat(50)}`)
    console.log(`  Starting: ${script.name}`)
    console.log(`${'═'.repeat(50)}\n`)

    try {
      execSync(`pnpm tsx ${scriptPath}`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      })
      console.log(`\n✅ ${script.name} completed successfully`)
    } catch (error) {
      console.error(`\n❌ ${script.name} failed`)
      console.error('Stopping migration. Fix the issue and re-run.')
      process.exit(1)
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  ✅ Full Migration Complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
