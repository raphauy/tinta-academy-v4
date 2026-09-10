/**
 * TINTA-58: Cambiar manualmente a un alumno del Nivel 1 al Nivel 2
 *
 * Contexto:
 *  - Gerardo Tasende se anotó a "WSET Nivel 1 - septiembre 2026" y quiere pasar
 *    al Nivel 2. El único Nivel 2 abierto es "WSET Nivel 2 - noviembre 2026".
 *  - La baja del Nivel 1 ya se hizo desde el panel (inscripción cancelada y
 *    órdenes anuladas). Este script solo hace el alta en el Nivel 2.
 *  - El dinero se gestiona por fuera (igual que "Quitar del curso"): no se crea
 *    ninguna orden, solo la inscripción confirmada.
 *
 * Qué hace (en una transacción):
 *  1. Verifica que el alumno exista y que su inscripción al curso origen esté cancelada
 *  2. Crea la inscripción confirmada en el curso destino (o reactiva una cancelada)
 *  3. Incrementa enrolledCount del curso destino
 *  4. Genera los emails automáticos (WorkflowExecution) de los workflows activos
 *     del curso destino, igual que hace el checkout
 *
 * Uso:
 *   pnpm tsx scripts/tinta-58-mover-tasende-nivel2.ts            # simulación (no escribe)
 *   pnpm tsx scripts/tinta-58-mover-tasende-nivel2.ts --apply    # aplica los cambios
 *
 * Usa DATABASE_URL de .env.local: verificar el host que imprime antes de aplicar.
 */

import { config } from 'dotenv'

config({ path: '.env.local' })

const STUDENT_EMAIL = 'gtasende@gts.com.uy'
const FROM_COURSE_SLUG = 'wset-nivel-1-septiembre-2026'
const TO_COURSE_SLUG = 'wset-nivel-2-noviembre-2026'

const APPLY = process.argv.includes('--apply')

function fail(message: string): never {
  console.error(`\n❌ ${message}`)
  process.exit(1)
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) fail('DATABASE_URL no está definida')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  TINTA-58: mover alumno del Nivel 1 al Nivel 2')
  console.log(`  Modo: ${APPLY ? '🔴 APLICAR CAMBIOS' : '🟢 simulación (sin escribir)'}`)
  console.log(`  Base: ${new URL(dbUrl).host}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Imports dinámicos para que dotenv cargue antes de instanciar Prisma
  const { prisma } = await import('@/lib/prisma')
  const { generateExecutionsForNewStudent } = await import(
    '@/services/workflow-execution-service'
  )

  // 1. Alumno
  const user = await prisma.user.findUnique({
    where: { email: STUDENT_EMAIL },
    include: { student: true },
  })
  if (!user) fail(`No existe usuario con email ${STUDENT_EMAIL}`)
  if (!user.student) fail(`El usuario ${STUDENT_EMAIL} no tiene registro de Student`)
  const student = user.student
  console.log(
    `👤 Alumno: ${student.firstName} ${student.lastName} <${user.email}> (student ${student.id}, rol ${user.role})`
  )

  // 2. Curso origen: la baja ya tiene que estar hecha
  const fromCourse = await prisma.course.findUnique({
    where: { slug: FROM_COURSE_SLUG },
    select: { id: true, title: true, status: true, enrolledCount: true },
  })
  if (!fromCourse) fail(`No existe el curso origen ${FROM_COURSE_SLUG}`)

  const fromEnrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId: fromCourse.id } },
  })
  if (!fromEnrollment) fail(`El alumno no tiene inscripción en ${fromCourse.title}`)
  if (fromEnrollment.status !== 'cancelled') {
    fail(
      `La inscripción a "${fromCourse.title}" está en estado "${fromEnrollment.status}". ` +
        `Primero hay que quitarlo del curso desde el panel (Quitar del curso).`
    )
  }
  const fromOrders = await prisma.order.findMany({
    where: { courseId: fromCourse.id, OR: [{ studentId: student.id }, { userId: user.id }] },
    select: { orderNumber: true, status: true, currency: true, finalAmount: true },
  })
  console.log(`📕 Origen: ${fromCourse.title} → inscripción ${fromEnrollment.status} ✔`)
  for (const o of fromOrders) {
    console.log(`   orden ${o.orderNumber}: ${o.status} (${o.finalAmount} ${o.currency})`)
  }

  // 3. Curso destino
  const toCourse = await prisma.course.findUnique({
    where: { slug: TO_COURSE_SLUG },
    select: {
      id: true,
      title: true,
      status: true,
      enrolledCount: true,
      maxCapacity: true,
      startDate: true,
      courseWorkflows: { where: { status: 'active' }, select: { id: true } },
    },
  })
  if (!toCourse) fail(`No existe el curso destino ${TO_COURSE_SLUG}`)
  if (toCourse.status === 'in_progress' || toCourse.status === 'finished') {
    fail(`El curso destino "${toCourse.title}" ya está ${toCourse.status}`)
  }
  console.log(
    `📗 Destino: ${toCourse.title} (${toCourse.status}, ${toCourse.enrolledCount}/${toCourse.maxCapacity ?? '∞'}, ` +
      `${toCourse.courseWorkflows.length} workflow(s) activo(s))`
  )

  const existing = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: student.id, courseId: toCourse.id } },
  })
  if (existing?.status === 'confirmed') {
    console.log('\n✅ El alumno ya está inscripto y confirmado en el curso destino. Nada que hacer.')
    return
  }
  if (existing?.status === 'pending') {
    fail('El alumno tiene una inscripción pendiente en el destino: revisar antes de continuar')
  }
  if (toCourse.maxCapacity && toCourse.enrolledCount >= toCourse.maxCapacity) {
    fail(`El curso destino está completo (${toCourse.enrolledCount}/${toCourse.maxCapacity})`)
  }

  const action = existing ? 'reactivar inscripción cancelada' : 'crear inscripción nueva'
  console.log(`\n📝 Plan: ${action} como "confirmed" y enrolledCount ${toCourse.enrolledCount} → ${toCourse.enrolledCount + 1}`)

  if (!APPLY) {
    console.log('\n🟢 Simulación terminada. Ejecutar con --apply para aplicar los cambios.')
    return
  }

  // 4. Aplicar
  const enrollment = await prisma.$transaction(async (tx) => {
    const enr = existing
      ? await tx.enrollment.update({
          where: { id: existing.id },
          data: { status: 'confirmed', enrolledAt: new Date() },
        })
      : await tx.enrollment.create({
          data: { studentId: student.id, courseId: toCourse.id, status: 'confirmed' },
        })

    await tx.course.update({
      where: { id: toCourse.id },
      data: { enrolledCount: { increment: 1 } },
    })

    return enr
  })
  console.log(`\n✅ Inscripción ${enrollment.id} confirmada en "${toCourse.title}"`)

  const executions = await generateExecutionsForNewStudent(toCourse.id, student.id, enrollment.id)
  console.log(`📧 Emails automáticos programados: ${executions}`)

  // 5. Verificación final
  const check = await prisma.course.findUnique({
    where: { id: toCourse.id },
    select: {
      enrolledCount: true,
      _count: { select: { enrollments: { where: { status: 'confirmed' } } } },
    },
  })
  console.log(
    `🔎 Verificación: enrolledCount=${check?.enrolledCount}, inscripciones confirmadas=${check?._count.enrollments}`
  )
}

main()
  .catch((error) => {
    console.error('\n❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('@/lib/prisma')
    await prisma.$disconnect()
  })
