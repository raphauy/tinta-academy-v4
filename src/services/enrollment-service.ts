import { prisma } from '@/lib/prisma'
import { EnrollmentStatus } from '@prisma/client'

// ============================================
// ENROLLMENT QUERIES
// ============================================

export async function getEnrollmentsByCourse(courseId: string) {
  return prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
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
            },
          },
        },
      },
      course: true,
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
 * Get all students enrolled in any course of an educator
 * Returns unique students with their enrollment info
 */
export async function getEducatorStudents(educatorId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: {
        educatorId,
      },
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
    orderBy: [
      { student: { firstName: 'asc' } },
      { student: { lastName: 'asc' } },
    ],
  })

  return enrollments
}
