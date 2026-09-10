/**
 * Alta manual de un alumno en un curso (sin pasar por el checkout).
 *
 * Para casos en que el alumno no pudo anotarse desde la web y el pago se
 * gestiona por fuera de la plataforma. No crea ninguna orden: solo deja la
 * inscripción confirmada, igual que "Quitar del curso" hace la baja.
 *
 * Qué hace:
 *  1. Busca o crea el usuario por email, le pone nombre y rol `student`
 *  2. Crea o completa el registro de Student con los datos personales
 *     (solo pisa los campos que vienen con valor)
 *  3. Crea la inscripción confirmada en el curso (o reactiva una cancelada)
 *     e incrementa enrolledCount, en una transacción
 *  4. Genera los emails automáticos (WorkflowExecution) de los workflows
 *     activos del curso, igual que hace el checkout
 *
 * Uso: editar el bloque DATOS y correr
 *   pnpm tsx scripts/inscribir-alumno-manual.ts            # simulación (no escribe)
 *   pnpm tsx scripts/inscribir-alumno-manual.ts --apply    # aplica los cambios
 *
 * Usa DATABASE_URL de .env.local: verificar el host que imprime antes de aplicar.
 *
 * Primer uso: TINTA-57, Ruben Azar en WSET Nivel 1 - septiembre 2026.
 */

import { config } from 'dotenv'
import { fromZonedTime } from 'date-fns-tz'

config({ path: '.env.local' })

// ============================================
// DATOS
// ============================================

const COURSE_SLUG = 'wset-nivel-1-septiembre-2026'

const ALUMNO = {
  email: 'razar@gruporas.com',
  firstName: 'Ruben',
  lastName: 'Azar',
  identityDocument: '1717082-6',
  dateOfBirth: '1960-11-01', // yyyy-MM-dd, se guarda como medianoche de Montevideo
  phone: '+59894440955',
  address: 'Calle del Sol 879',
  city: '',
  country: 'Uruguay',
}

// ============================================

const APPLY = process.argv.includes('--apply')

function fail(message: string): never {
  console.error(`\n❌ ${message}`)
  process.exit(1)
}

/** Deja solo los campos con valor, para no pisar datos existentes con vacíos. */
function withValues<T extends Record<string, string | Date | undefined>>(obj: T) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')
  ) as Partial<T>
}

async function main() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) fail('DATABASE_URL no está definida')

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('  Alta manual de alumno en curso')
  console.log(`  Modo: ${APPLY ? '🔴 APLICAR CAMBIOS' : '🟢 simulación (sin escribir)'}`)
  console.log(`  Base: ${new URL(dbUrl).host}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Imports dinámicos para que dotenv cargue antes de instanciar Prisma
  const { prisma } = await import('@/lib/prisma')
  const { generateExecutionsForNewStudent } = await import(
    '@/services/workflow-execution-service'
  )

  const email = ALUMNO.email.trim().toLowerCase()
  const fullName = `${ALUMNO.firstName} ${ALUMNO.lastName}`.trim()

  // 1. Curso
  const course = await prisma.course.findUnique({
    where: { slug: COURSE_SLUG },
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
  if (!course) fail(`No existe el curso ${COURSE_SLUG}`)
  if (course.status === 'in_progress' || course.status === 'finished') {
    fail(`El curso "${course.title}" ya está ${course.status}`)
  }
  console.log(
    `📗 Curso: ${course.title} (${course.status}, ${course.enrolledCount}/${course.maxCapacity ?? '∞'}, ` +
      `${course.courseWorkflows.length} workflow(s) activo(s))`
  )

  // 2. Usuario y alumno
  const user = await prisma.user.findUnique({
    where: { email },
    include: { student: true },
  })
  if (user) {
    console.log(
      `👤 Usuario existente: ${user.email} (nombre: ${user.name ?? '—'}, rol: ${user.role ?? '—'}, ` +
        `activo: ${user.isActive}, student: ${user.student ? user.student.id : 'no'})`
    )
    if (!user.isActive) fail('El usuario está desactivado')
    if (user.role && user.role !== 'student') {
      fail(`El usuario tiene rol "${user.role}", no se le puede cambiar a student automáticamente`)
    }
  } else {
    console.log(`👤 Usuario nuevo: ${email}`)
  }

  const studentData = withValues({
    firstName: ALUMNO.firstName,
    lastName: ALUMNO.lastName,
    identityDocument: ALUMNO.identityDocument,
    dateOfBirth: ALUMNO.dateOfBirth
      ? fromZonedTime(ALUMNO.dateOfBirth, 'America/Montevideo')
      : undefined,
    phone: ALUMNO.phone,
    address: ALUMNO.address,
    city: ALUMNO.city,
    country: ALUMNO.country,
  })
  console.log(`📋 Datos del alumno: ${JSON.stringify(studentData)}`)

  // 3. Inscripción existente
  const existing = user?.student
    ? await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: user.student.id, courseId: course.id } },
      })
    : null
  if (existing?.status === 'confirmed') {
    console.log('\n✅ El alumno ya está inscripto y confirmado en este curso. Nada que hacer.')
    return
  }
  if (existing?.status === 'pending') {
    fail('El alumno tiene una inscripción pendiente en este curso: revisar antes de continuar')
  }
  if (course.maxCapacity && course.enrolledCount >= course.maxCapacity) {
    fail(`El curso está completo (${course.enrolledCount}/${course.maxCapacity})`)
  }

  const action = existing ? 'reactivar inscripción cancelada' : 'crear inscripción nueva'
  console.log(
    `\n📝 Plan: ${user ? 'actualizar' : 'crear'} usuario "${fullName}" con rol student, ` +
      `${user?.student ? 'completar' : 'crear'} Student, ${action} como "confirmed", ` +
      `enrolledCount ${course.enrolledCount} → ${course.enrolledCount + 1}`
  )

  if (!APPLY) {
    console.log('\n🟢 Simulación terminada. Ejecutar con --apply para aplicar los cambios.')
    return
  }

  // 4. Aplicar
  const result = await prisma.$transaction(async (tx) => {
    const savedUser = user
      ? await tx.user.update({
          where: { id: user.id },
          data: { name: user.name ?? fullName, role: 'student' },
        })
      : await tx.user.create({
          data: { email, name: fullName, role: 'student' },
        })

    const student = await tx.student.upsert({
      where: { userId: savedUser.id },
      create: { userId: savedUser.id, ...studentData },
      update: studentData,
    })

    const enrollment = existing
      ? await tx.enrollment.update({
          where: { id: existing.id },
          data: { status: 'confirmed', enrolledAt: new Date() },
        })
      : await tx.enrollment.create({
          data: { studentId: student.id, courseId: course.id, status: 'confirmed' },
        })

    await tx.course.update({
      where: { id: course.id },
      data: { enrolledCount: { increment: 1 } },
    })

    return { student, enrollment }
  })
  console.log(`\n✅ Inscripción ${result.enrollment.id} confirmada en "${course.title}"`)

  const executions = await generateExecutionsForNewStudent(
    course.id,
    result.student.id,
    result.enrollment.id
  )
  console.log(`📧 Emails automáticos programados: ${executions}`)

  // 5. Verificación final
  const check = await prisma.course.findUnique({
    where: { id: course.id },
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
