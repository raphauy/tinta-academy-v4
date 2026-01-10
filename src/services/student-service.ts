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
  identityDocument?: string
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
      identityDocument: data.identityDocument,
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

// ============================================
// ADMIN FUNCTIONS
// ============================================

export interface StudentWithStats {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  identityDocument: string | null
  phone: string | null
  city: string | null
  country: string | null
  createdAt: Date
  user: {
    id: string
    email: string
    name: string | null
    image: string | null
    isActive: boolean
    createdAt: Date
  }
  enrollmentsCount: number
  completedCourses: number
  totalSpent: number
  lastActivityAt: Date | null
}

export interface StudentStats {
  total: number
  newThisMonth: number
  activeThisMonth: number
  withCompletedCourses: number
}

/**
 * Get all students with computed stats for admin panel
 */
export async function getAllStudentsWithStats(): Promise<StudentWithStats[]> {
  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          isActive: true,
          createdAt: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          course: {
            select: {
              status: true,
            },
          },
        },
      },
      orders: {
        where: { status: 'paid' },
        select: {
          finalAmount: true,
          paidAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return students.map((student) => {
    const confirmedEnrollments = student.enrollments.filter((e) => e.status === 'confirmed')
    const completedCourses = confirmedEnrollments.filter(
      (e) => e.course.status === 'finished'
    ).length
    const totalSpent = student.orders.reduce((sum, order) => sum + order.finalAmount, 0)

    // Find last activity (most recent enrollment or payment)
    const enrollmentDates = student.enrollments.map((e) => e.enrolledAt)
    const paymentDates = student.orders.map((o) => o.paidAt).filter(Boolean) as Date[]
    const allDates = [...enrollmentDates, ...paymentDates]
    const lastActivityAt = allDates.length > 0
      ? new Date(Math.max(...allDates.map((d) => d.getTime())))
      : null

    return {
      id: student.id,
      userId: student.userId,
      firstName: student.firstName,
      lastName: student.lastName,
      identityDocument: student.identityDocument,
      phone: student.phone,
      city: student.city,
      country: student.country,
      createdAt: student.createdAt,
      user: student.user,
      enrollmentsCount: confirmedEnrollments.length,
      completedCourses,
      totalSpent,
      lastActivityAt,
    }
  })
}

/**
 * Get aggregated student statistics for dashboard
 */
export async function getStudentStats(): Promise<StudentStats> {
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [total, newThisMonth, studentsWithActivity, studentsWithCompletedCourses] =
    await Promise.all([
      // Total students
      prisma.student.count(),
      // New students this month
      prisma.student.count({
        where: {
          createdAt: { gte: thisMonthStart },
        },
      }),
      // Students with activity this month (enrollments or orders)
      prisma.student.count({
        where: {
          OR: [
            {
              enrollments: {
                some: {
                  enrolledAt: { gte: thisMonthStart },
                },
              },
            },
            {
              orders: {
                some: {
                  createdAt: { gte: thisMonthStart },
                },
              },
            },
          ],
        },
      }),
      // Students with at least one completed course
      prisma.student.count({
        where: {
          enrollments: {
            some: {
              status: 'confirmed',
              course: {
                status: 'finished',
              },
            },
          },
        },
      }),
    ])

  return {
    total,
    newThisMonth,
    activeThisMonth: studentsWithActivity,
    withCompletedCourses: studentsWithCompletedCourses,
  }
}

/**
 * Get student by ID with full stats for admin detail view
 */
export async function getStudentByIdWithStats(
  studentId: string
): Promise<StudentWithStats | null> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          isActive: true,
          createdAt: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          course: {
            select: {
              status: true,
            },
          },
        },
      },
      orders: {
        where: { status: 'paid' },
        select: {
          finalAmount: true,
          paidAt: true,
        },
      },
    },
  })

  if (!student) return null

  const confirmedEnrollments = student.enrollments.filter((e) => e.status === 'confirmed')
  const completedCourses = confirmedEnrollments.filter(
    (e) => e.course.status === 'finished'
  ).length
  const totalSpent = student.orders.reduce((sum, order) => sum + order.finalAmount, 0)

  const enrollmentDates = student.enrollments.map((e) => e.enrolledAt)
  const paymentDates = student.orders.map((o) => o.paidAt).filter(Boolean) as Date[]
  const allDates = [...enrollmentDates, ...paymentDates]
  const lastActivityAt = allDates.length > 0
    ? new Date(Math.max(...allDates.map((d) => d.getTime())))
    : null

  return {
    id: student.id,
    userId: student.userId,
    firstName: student.firstName,
    lastName: student.lastName,
    identityDocument: student.identityDocument,
    phone: student.phone,
    city: student.city,
    country: student.country,
    createdAt: student.createdAt,
    user: student.user,
    enrollmentsCount: confirmedEnrollments.length,
    completedCourses,
    totalSpent,
    lastActivityAt,
  }
}

// Admin can update the same fields as regular update for now
// This type alias allows for future extension if needed
export type UpdateStudentAsAdminInput = UpdateStudentInput

/**
 * Update student as admin (can update more fields)
 */
export async function updateStudentAsAdmin(
  studentId: string,
  data: UpdateStudentAsAdminInput
) {
  return prisma.student.update({
    where: { id: studentId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      identityDocument: data.identityDocument,
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
 * Get students who have been active in the last N days
 */
export async function getStudentsByActivity(days: number): Promise<StudentWithStats[]> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const students = await prisma.student.findMany({
    where: {
      OR: [
        {
          enrollments: {
            some: {
              enrolledAt: { gte: cutoffDate },
            },
          },
        },
        {
          orders: {
            some: {
              createdAt: { gte: cutoffDate },
            },
          },
        },
      ],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          isActive: true,
          createdAt: true,
        },
      },
      enrollments: {
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          course: {
            select: {
              status: true,
            },
          },
        },
      },
      orders: {
        where: { status: 'paid' },
        select: {
          finalAmount: true,
          paidAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return students.map((student) => {
    const confirmedEnrollments = student.enrollments.filter((e) => e.status === 'confirmed')
    const completedCourses = confirmedEnrollments.filter(
      (e) => e.course.status === 'finished'
    ).length
    const totalSpent = student.orders.reduce((sum, order) => sum + order.finalAmount, 0)

    const enrollmentDates = student.enrollments.map((e) => e.enrolledAt)
    const paymentDates = student.orders.map((o) => o.paidAt).filter(Boolean) as Date[]
    const allDates = [...enrollmentDates, ...paymentDates]
    const lastActivityAt = allDates.length > 0
      ? new Date(Math.max(...allDates.map((d) => d.getTime())))
      : null

    return {
      id: student.id,
      userId: student.userId,
      firstName: student.firstName,
      lastName: student.lastName,
      identityDocument: student.identityDocument,
      phone: student.phone,
      city: student.city,
      country: student.country,
      createdAt: student.createdAt,
      user: student.user,
      enrollmentsCount: confirmedEnrollments.length,
      completedCourses,
      totalSpent,
      lastActivityAt,
    }
  })
}
