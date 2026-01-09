import { prisma } from '@/lib/prisma'

/**
 * Get student by user ID with user relation
 */
export async function getStudentByUserId(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  })
}

/**
 * Get student by student ID with user relation
 */
export async function getStudentById(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
    },
  })
}

export interface StudentCourseQuickAccess {
  id: string
  slug: string
  title: string
  type: string
  modality: string
  status: string
  imageUrl: string | null
  startDate: Date | null
  endDate: Date | null
  location: string | null
  enrolledAt: Date
  /** The most relevant date for display/sorting based on course type */
  effectiveDate: Date | null
  // Extended fields for richer card display
  description: string | null
  duration: string | null
  wsetLevel: number | null
  educator: {
    name: string
    imageUrl: string | null
  }
  tags: Array<{ id: string; name: string }>
}

export interface StudentDashboardMetrics {
  totalCourses: number
  inProgressCourses: number
  completedCourses: number
  upcomingCoursesCount: number
  upcomingCourses: StudentCourseQuickAccess[]
  recentCourses: StudentCourseQuickAccess[]
}

/**
 * Get dashboard metrics for a student
 */
export async function getStudentDashboardMetrics(
  studentId: string
): Promise<StudentDashboardMetrics> {
  const now = new Date()

  // Get all confirmed enrollments with course, educator, and tags data
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'confirmed',
    },
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

  /**
   * Get the most relevant date for a course based on its type:
   * - WSET: first classDate > examDate > startDate
   * - Taller/Cata/Curso: first classDate > startDate
   */
  function getEffectiveDate(course: (typeof enrollments)[0]['course']): Date | null {
    const firstClassDate = course.classDates?.[0] ?? null

    if (course.type === 'wset') {
      return firstClassDate ?? course.examDate ?? course.startDate
    }

    return firstClassDate ?? course.startDate
  }

  // Calculate metrics
  const totalCourses = enrollments.length

  const inProgressCourses = enrollments.filter(
    (e) =>
      e.course.status === 'in_progress' ||
      e.course.status === 'enrolling' ||
      e.course.status === 'available'
  ).length

  const completedCourses = enrollments.filter(
    (e) => e.course.status === 'finished'
  ).length

  // Upcoming courses: effectiveDate > now
  const upcomingEnrollments = enrollments.filter((e) => {
    const effectiveDate = getEffectiveDate(e.course)
    return effectiveDate && effectiveDate > now
  })

  const upcomingCoursesCount = upcomingEnrollments.length

  // Map to quick access format
  const mapToQuickAccess = (enrollment: (typeof enrollments)[0]): StudentCourseQuickAccess => ({
    id: enrollment.course.id,
    slug: enrollment.course.slug,
    title: enrollment.course.title,
    type: enrollment.course.type,
    modality: enrollment.course.modality,
    status: enrollment.course.status,
    imageUrl: enrollment.course.imageUrl,
    startDate: enrollment.course.startDate,
    endDate: enrollment.course.endDate,
    location: enrollment.course.location,
    enrolledAt: enrollment.enrolledAt,
    effectiveDate: getEffectiveDate(enrollment.course),
    description: enrollment.course.description,
    duration: enrollment.course.duration,
    wsetLevel: enrollment.course.wsetLevel,
    educator: {
      name: enrollment.course.educator.name,
      imageUrl: enrollment.course.educator.imageUrl,
    },
    tags: enrollment.course.tags.map((t) => ({ id: t.id, name: t.name })),
  })

  // Upcoming courses sorted by effectiveDate (ascending - soonest first)
  const upcomingCourses = upcomingEnrollments
    .sort((a, b) => {
      const dateA = getEffectiveDate(a.course)
      const dateB = getEffectiveDate(b.course)
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)
    .map(mapToQuickAccess)

  // Recent courses: sorted by effectiveDate desc (most recent/upcoming first)
  const recentCourses = [...enrollments]
    .sort((a, b) => {
      const dateA = getEffectiveDate(a.course)
      const dateB = getEffectiveDate(b.course)
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 3)
    .map(mapToQuickAccess)

  return {
    totalCourses,
    inProgressCourses,
    completedCourses,
    upcomingCoursesCount,
    upcomingCourses,
    recentCourses,
  }
}

/**
 * Get full student profile for editing
 */
export async function getStudentProfile(studentId: string) {
  return prisma.student.findUnique({
    where: { id: studentId },
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
  })
}

export interface UpdateStudentInput {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: Date | null
  address?: string
  city?: string
  zip?: string
  country?: string
  billingName?: string
  billingTaxId?: string
  billingAddress?: string
  notifyNewCourses?: boolean
  notifyPromotions?: boolean
  notifyCourseUpdates?: boolean
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  studentId: string,
  data: UpdateStudentInput
) {
  return prisma.student.update({
    where: { id: studentId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      city: data.city,
      zip: data.zip,
      country: data.country,
      billingName: data.billingName,
      billingTaxId: data.billingTaxId,
      billingAddress: data.billingAddress,
      notifyNewCourses: data.notifyNewCourses,
      notifyPromotions: data.notifyPromotions,
      notifyCourseUpdates: data.notifyCourseUpdates,
    },
    include: {
      user: true,
    },
  })
}

/**
 * Get all students with minimal data for selection (superadmin only)
 */
export async function getAllStudents() {
  return prisma.student.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  })
}

export type StudentForSelection = Awaited<ReturnType<typeof getAllStudents>>[number]
