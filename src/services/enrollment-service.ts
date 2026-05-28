import { prisma } from '@/lib/prisma'
import {
  CourseStatus,
  EmailDeliveryStatus,
  EnrollmentStatus,
  OrderStatus,
} from '@prisma/client'

// ============================================
// ENROLLMENT QUERIES
// ============================================

/**
 * Check if a user is enrolled in a course (by userId)
 * Returns true if the user has an active enrollment (not cancelled)
 */
export async function isUserEnrolledInCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      student: {
        userId,
      },
      status: {
        not: EnrollmentStatus.cancelled,
      },
    },
    select: { id: true },
  })
  return !!enrollment
}

export async function getEnrollmentsByCourse(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          identityDocument: true,
          dateOfBirth: true,
          phone: true,
          address: true,
          city: true,
          country: true,
          user: {
            select: {
              email: true,
              name: true,
              image: true,
            },
          },
          orders: {
            where: {
              courseId,
              status: 'paid',
            },
            select: {
              finalAmount: true,
              currency: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  })

  // Calculate course spending for each enrollment
  return enrollments.map((enrollment) => {
    const courseSpentUSD = enrollment.student.orders
      .filter((o) => o.currency === 'USD')
      .reduce((sum, order) => sum + order.finalAmount, 0)
    const courseSpentUYU = enrollment.student.orders
      .filter((o) => o.currency === 'UYU')
      .reduce((sum, order) => sum + order.finalAmount, 0)

    return {
      ...enrollment,
      courseSpentUSD,
      courseSpentUYU,
    }
  })
}

export async function getEnrollmentsByStudent(studentId: string) {
  return prisma.enrollment.findMany({
    where: { studentId },
    include: {
      course: {
        include: {
          educator: true,
          tags: true,
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  })
}

/**
 * Get student enrollments with full course details including materials
 * Used for student course list page with optional status filter
 */
export async function getStudentEnrollments(
  studentId: string,
  filters?: { status?: EnrollmentStatus }
) {
  return prisma.enrollment.findMany({
    where: {
      studentId,
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      course: {
        include: {
          educator: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
            },
          },
          materials: {
            orderBy: {
              order: 'asc',
            },
          },
          tags: true,
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  })
}

/**
 * Get single enrollment with full course details for student course detail page
 */
export async function getEnrollmentWithCourseDetails(enrollmentId: string) {
  return prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      },
      course: {
        include: {
          educator: {
            select: {
              id: true,
              name: true,
              title: true,
              bio: true,
              imageUrl: true,
            },
          },
          materials: {
            orderBy: {
              order: 'asc',
            },
          },
          tags: true,
        },
      },
    },
  })
}

export async function getEnrollmentById(id: string) {
  return prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
              image: true,
            },
          },
        },
      },
      course: true,
    },
  })
}

/**
 * Get a student's enrollment in a specific course with full details
 * Used for student course detail page where URL has courseId
 */
export async function getStudentEnrollmentByCourse(
  studentId: string,
  courseId: string
) {
  return prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
        },
      },
      course: {
        include: {
          educator: {
            select: {
              id: true,
              name: true,
              title: true,
              bio: true,
              imageUrl: true,
            },
          },
          materials: {
            orderBy: {
              order: 'asc',
            },
          },
          tags: true,
        },
      },
    },
  })
}

/**
 * Get the count of confirmed enrollments for a course
 */
export async function getConfirmedEnrollmentCount(
  courseId: string
): Promise<number> {
  return prisma.enrollment.count({
    where: {
      courseId,
      status: EnrollmentStatus.confirmed,
    },
  })
}

// ============================================
// ENROLLMENT MUTATIONS
// ============================================

export async function createEnrollment(studentId: string, courseId: string) {
  // Check if enrollment already exists
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId,
        courseId,
      },
    },
  })

  if (existing) {
    throw new Error('El estudiante ya está inscrito en este curso')
  }

  // Check course capacity
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { maxCapacity: true, enrolledCount: true },
  })

  if (!course) {
    throw new Error('Curso no encontrado')
  }

  if (course.maxCapacity && course.enrolledCount >= course.maxCapacity) {
    throw new Error('El curso ha alcanzado su capacidad máxima')
  }

  // Create enrollment and update course count in a transaction
  const enrollment = await prisma.$transaction(async (tx) => {
    const newEnrollment = await tx.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'pending',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
        course: true,
      },
    })

    return newEnrollment
  })

  return enrollment
}

export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus
) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    select: { status: true, courseId: true },
  })

  if (!enrollment) {
    throw new Error('Inscripción no encontrada')
  }

  const previousStatus = enrollment.status

  // Update enrollment status
  const updated = await prisma.$transaction(async (tx) => {
    const updatedEnrollment = await tx.enrollment.update({
      where: { id },
      data: { status },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
        course: true,
      },
    })

    // Update course enrolledCount if status changed to/from confirmed
    if (previousStatus !== 'confirmed' && status === 'confirmed') {
      await tx.course.update({
        where: { id: enrollment.courseId },
        data: { enrolledCount: { increment: 1 } },
      })
    } else if (previousStatus === 'confirmed' && status !== 'confirmed') {
      await tx.course.update({
        where: { id: enrollment.courseId },
        data: { enrolledCount: { decrement: 1 } },
      })
    }

    return updatedEnrollment
  })

  return updated
}

export async function cancelEnrollment(id: string) {
  return updateEnrollmentStatus(id, 'cancelled')
}

export async function confirmEnrollment(id: string) {
  return updateEnrollmentStatus(id, 'confirmed')
}

// ============================================
// REMOVE STUDENT FROM COURSE (anular inscripción)
// ============================================

// Estados que cuentan como "curso ya iniciado": no se permite quitar al alumno.
const STARTED_COURSE_STATUSES: CourseStatus[] = [
  CourseStatus.in_progress,
  CourseStatus.finished,
]

export interface RemoveStudentFromCourseResult {
  studentName: string
  courseTitle: string
  cancelledEmails: number
  voidedOrders: number
}

/**
 * Quita por completo a un alumno de un curso que aún no inició.
 * En una sola transacción:
 *  - Cancela la inscripción y decrementa enrolledCount (si estaba confirmada)
 *  - Cancela los emails automáticos (WorkflowExecution) pendientes de ese alumno
 *  - Anula las órdenes activas del alumno para ese curso (conserva el registro)
 *
 * Pensado para casos administrativos como cambios de curso, donde el dinero
 * se gestionó por fuera (no es un reembolso).
 */
export async function removeStudentFromCourse(params: {
  courseId: string
  enrollmentId: string
  cancelledById: string
}): Promise<RemoveStudentFromCourseResult> {
  const { courseId, enrollmentId, cancelledById } = params

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { select: { id: true, title: true, status: true } },
      student: {
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
  })

  if (!enrollment) {
    throw new Error('Inscripción no encontrada')
  }

  if (enrollment.courseId !== courseId) {
    throw new Error('La inscripción no corresponde a este curso')
  }

  if (enrollment.status === EnrollmentStatus.cancelled) {
    throw new Error('El alumno ya fue quitado de este curso')
  }

  if (STARTED_COURSE_STATUSES.includes(enrollment.course.status)) {
    throw new Error(
      'No se puede quitar al alumno: el curso ya está en curso o finalizado'
    )
  }

  const wasConfirmed = enrollment.status === EnrollmentStatus.confirmed
  const studentName =
    [enrollment.student.firstName, enrollment.student.lastName]
      .filter(Boolean)
      .join(' ') ||
    enrollment.student.user.name ||
    enrollment.student.user.email

  const result = await prisma.$transaction(async (tx) => {
    // 1. Cancelar la inscripción
    await tx.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.cancelled },
    })

    // 2. Decrementar el contador solo si estaba confirmada
    if (wasConfirmed) {
      await tx.course.update({
        where: { id: enrollment.courseId },
        data: { enrolledCount: { decrement: 1 } },
      })
    }

    // 3. Cancelar los emails automáticos pendientes de este alumno
    const cancelled = await tx.workflowExecution.deleteMany({
      where: { enrollmentId, status: EmailDeliveryStatus.pending },
    })

    // 4. Anular las órdenes activas del alumno para este curso (conserva el registro)
    const voided = await tx.order.updateMany({
      where: {
        courseId: enrollment.courseId,
        OR: [
          { studentId: enrollment.studentId },
          { userId: enrollment.student.userId },
        ],
        status: {
          notIn: [
            OrderStatus.cancelled,
            OrderStatus.refunded,
            OrderStatus.rejected,
          ],
        },
      },
      data: {
        status: OrderStatus.cancelled,
        cancelledAt: new Date(),
        cancelledById,
      },
    })

    return { cancelledEmails: cancelled.count, voidedOrders: voided.count }
  })

  return {
    studentName,
    courseTitle: enrollment.course.title,
    cancelledEmails: result.cancelledEmails,
    voidedOrders: result.voidedOrders,
  }
}

// ============================================
// ENROLLMENT STATS
// ============================================

export async function getCourseEnrollmentStats(courseId: string) {
  const stats = await prisma.enrollment.groupBy({
    by: ['status'],
    where: { courseId },
    _count: true,
  })

  return {
    pending: stats.find((s) => s.status === 'pending')?._count ?? 0,
    confirmed: stats.find((s) => s.status === 'confirmed')?._count ?? 0,
    cancelled: stats.find((s) => s.status === 'cancelled')?._count ?? 0,
    total: stats.reduce((sum, s) => sum + s._count, 0),
  }
}

/**
 * Check if an educator can view a specific student
 * Returns true if student is enrolled in any of educator's courses
 */
export async function canEducatorViewStudent(
  educatorId: string,
  studentId: string
): Promise<boolean> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      course: {
        educatorId,
      },
    },
    select: { id: true },
  })
  return enrollment !== null
}

/**
 * Get all students enrolled in any course of an educator
 * Returns students with their enrollments in educator's courses
 */
export async function getEducatorStudents(educatorId: string) {
  const students = await prisma.student.findMany({
    where: {
      enrollments: {
        some: {
          course: {
            educatorId,
          },
        },
      },
    },
    include: {
      user: {
        select: {
          email: true,
          name: true,
          image: true,
        },
      },
      enrollments: {
        where: {
          course: {
            educatorId,
          },
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          enrolledAt: 'desc',
        },
      },
    },
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
  })

  return students
}
