import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface StudentForEmailSelection {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  courses: string[]
}

export interface StudentSelectionFilters {
  courseId?: string
  searchQuery?: string
}

/**
 * Get students enrolled in educator's courses for email recipient selection
 * Returns students with their email and list of enrolled course names
 */
export async function getStudentsForSelection(
  educatorId: string,
  filters?: StudentSelectionFilters
): Promise<StudentForEmailSelection[]> {
  // Build where clause for students
  const whereClause: Prisma.StudentWhereInput = {
    enrollments: {
      some: {
        status: 'confirmed',
        course: {
          educatorId,
          ...(filters?.courseId ? { id: filters.courseId } : {}),
        },
      },
    },
  }

  // Add search filter if provided
  if (filters?.searchQuery) {
    const search = filters.searchQuery.toLowerCase()
    whereClause.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }

  const students = await prisma.student.findMany({
    where: whereClause,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          email: true,
        },
      },
      enrollments: {
        where: {
          status: 'confirmed',
          course: {
            educatorId,
          },
        },
        select: {
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })

  return students.map((student) => ({
    id: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.user.email,
    courses: student.enrollments.map((e) => e.course.title),
  }))
}

/**
 * Get all enrolled students for a specific course
 * Verifies the course belongs to the educator
 */
export async function getStudentsByCourse(
  courseId: string,
  educatorId: string
): Promise<StudentForEmailSelection[]> {
  // First verify the course belongs to the educator
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      educatorId,
    },
    select: {
      id: true,
      title: true,
    },
  })

  if (!course) {
    return []
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      status: 'confirmed',
    },
    select: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      student: {
        firstName: 'asc',
      },
    },
  })

  return enrollments.map((enrollment) => ({
    id: enrollment.student.id,
    firstName: enrollment.student.firstName,
    lastName: enrollment.student.lastName,
    email: enrollment.student.user.email,
    courses: [course.title],
  }))
}
