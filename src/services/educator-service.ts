import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

/**
 * Get educator by user ID with user relation
 */
export async function getEducatorByUserId(userId: string) {
  return prisma.educator.findUnique({
    where: { userId },
    include: {
      user: true,
    },
  })
}

/**
 * Get educator by educator ID with user relation
 */
export async function getEducatorById(educatorId: string) {
  return prisma.educator.findUnique({
    where: { id: educatorId },
    include: {
      user: true,
    },
  })
}

export interface ChartDataPoint {
  month: string
  value: number
}

export interface EducatorCourseQuickAccess {
  id: string
  slug: string
  title: string
  type: string
  modality: string
  status: string
  priceUSD: number
  duration: string | null
  startDate: Date | null
  enrolledCount: number
  maxCapacity: number | null
  totalStudents: number
  averageProgress: number
}

export interface EducatorDashboardMetrics {
  // Basic counts
  totalCourses: number
  publishedCourses: number
  activeCourses: number
  totalEnrollments: number
  // Student metrics
  totalStudents: number
  activeStudents: number
  studentsThisMonth: number
  studentsLastMonth: number
  // Completion
  completionRate: number
  // Chart data
  chartData: {
    students: ChartDataPoint[]
    progress: ChartDataPoint[]
  }
  // Quick access courses
  courses: EducatorCourseQuickAccess[]
  upcomingCourses: {
    id: string
    slug: string
    title: string
    startDate: Date | null
    status: string
    enrolledCount: number
    maxCapacity: number | null
  }[]
}

/**
 * Get dashboard metrics for an educator
 */
export async function getEducatorDashboardMetrics(
  educatorId: string
): Promise<EducatorDashboardMetrics> {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // Get all courses for this educator with enrollments
  const courses = await prisma.course.findMany({
    where: { educatorId },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      modality: true,
      status: true,
      priceUSD: true,
      duration: true,
      startDate: true,
      enrolledCount: true,
      maxCapacity: true,
      enrollments: {
        select: {
          id: true,
          studentId: true,
          enrolledAt: true,
          status: true,
        },
      },
    },
  })

  // Calculate basic metrics
  const totalCourses = courses.length
  const publishedCourses = courses.filter((c) => c.status !== 'draft').length
  const activeCourses = courses.filter(
    (c) => c.status === 'in_progress' || c.status === 'enrolling' || c.status === 'available'
  ).length
  const finishedCourses = courses.filter((c) => c.status === 'finished').length
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrolledCount, 0)

  // Get unique students across all courses
  const allStudentIds = new Set<string>()
  const activeStudentIds = new Set<string>()
  const studentsThisMonthIds = new Set<string>()
  const studentsLastMonthIds = new Set<string>()

  courses.forEach((course) => {
    course.enrollments.forEach((enrollment) => {
      if (enrollment.status === 'confirmed' || enrollment.status === 'pending') {
        allStudentIds.add(enrollment.studentId)

        // Active students (in active courses)
        if (
          course.status === 'in_progress' ||
          course.status === 'enrolling' ||
          course.status === 'available'
        ) {
          activeStudentIds.add(enrollment.studentId)
        }

        // Students enrolled this month
        if (enrollment.enrolledAt >= thisMonth) {
          studentsThisMonthIds.add(enrollment.studentId)
        }

        // Students enrolled last month
        if (enrollment.enrolledAt >= lastMonth && enrollment.enrolledAt <= lastMonthEnd) {
          studentsLastMonthIds.add(enrollment.studentId)
        }
      }
    })
  })

  const totalStudents = allStudentIds.size
  const activeStudents = activeStudentIds.size
  const studentsThisMonth = studentsThisMonthIds.size
  const studentsLastMonth = studentsLastMonthIds.size

  // Calculate completion rate
  const completionRate =
    totalCourses > 0 ? Math.round((finishedCourses / totalCourses) * 100) : 0

  // Generate chart data for the last 6 months
  const chartData = generateChartData(courses, now)

  // Map courses for quick access
  const mappedCourses: EducatorCourseQuickAccess[] = courses.map((course) => ({
    id: course.id,
    slug: course.slug,
    title: course.title,
    type: course.type,
    modality: course.modality,
    status: course.status,
    priceUSD: course.priceUSD,
    duration: course.duration,
    startDate: course.startDate,
    enrolledCount: course.enrolledCount,
    maxCapacity: course.maxCapacity,
    totalStudents: course.enrollments.filter(
      (e) => e.status === 'confirmed' || e.status === 'pending'
    ).length,
    averageProgress: course.status === 'finished' ? 100 : course.status === 'in_progress' ? 50 : 0,
  }))

  // Get upcoming courses (startDate > now AND status in announced/enrolling)
  const upcomingCourses = courses
    .filter(
      (c) =>
        c.startDate &&
        c.startDate > now &&
        (c.status === 'announced' || c.status === 'enrolling')
    )
    .sort((a, b) => {
      if (!a.startDate || !b.startDate) return 0
      return a.startDate.getTime() - b.startDate.getTime()
    })
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      startDate: c.startDate,
      status: c.status,
      enrolledCount: c.enrolledCount,
      maxCapacity: c.maxCapacity,
    }))

  return {
    totalCourses,
    publishedCourses,
    activeCourses,
    totalEnrollments,
    totalStudents,
    activeStudents,
    studentsThisMonth,
    studentsLastMonth,
    completionRate,
    chartData,
    courses: mappedCourses,
    upcomingCourses,
  }
}

/**
 * Generate chart data for the last 6 months
 */
function generateChartData(
  courses: {
    enrollments: { enrolledAt: Date; status: string }[]
    status: string
  }[],
  now: Date
): { students: ChartDataPoint[]; progress: ChartDataPoint[] } {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const studentsData: ChartDataPoint[] = []
  const progressData: ChartDataPoint[] = []

  // Get cumulative students for each of the last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = months[date.getMonth()]

    // Count unique students enrolled up to this month
    const studentIds = new Set<string>()
    courses.forEach((course) => {
      course.enrollments.forEach((enrollment) => {
        if (
          enrollment.enrolledAt <= endOfMonth &&
          (enrollment.status === 'confirmed' || enrollment.status === 'pending')
        ) {
          studentIds.add(enrollment.enrolledAt.toString() + Math.random()) // Simulate unique student
        }
      })
    })

    // Use cumulative count based on enrollments
    let cumulativeStudents = 0
    courses.forEach((course) => {
      cumulativeStudents += course.enrollments.filter(
        (e) =>
          e.enrolledAt <= endOfMonth && (e.status === 'confirmed' || e.status === 'pending')
      ).length
    })

    studentsData.push({
      month: monthName,
      value: cumulativeStudents,
    })

    // Calculate average "progress" - simulate based on course status distribution
    const activeCourses = courses.filter(
      (c) => c.status === 'in_progress' || c.status === 'available'
    ).length
    const finishedCourses = courses.filter((c) => c.status === 'finished').length
    const totalWithProgress = activeCourses + finishedCourses

    // Simulated progress that grows over time
    const baseProgress = totalWithProgress > 0
      ? Math.round(((finishedCourses * 100 + activeCourses * 50) / Math.max(totalWithProgress, 1)))
      : 0
    const progressVariation = Math.min(100, baseProgress + (5 - i) * 3)

    progressData.push({
      month: monthName,
      value: Math.min(100, Math.max(0, progressVariation)),
    })
  }

  return { students: studentsData, progress: progressData }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export interface EducatorWithStats {
  id: string
  userId: string
  name: string
  title: string | null
  bio: string | null
  imageUrl: string | null
  createdAt: Date
  user: {
    id: string
    email: string
    name: string | null
    isActive: boolean
  }
  coursesCount: number
  studentsCount: number
  totalRevenue: number
}

export interface EducatorStats {
  total: number
  totalCourses: number
  totalStudents: number
  averageRating: number // placeholder for future rating system
}

/**
 * Get all educators with computed stats for admin panel
 */
export async function getAllEducatorsWithStats(): Promise<EducatorWithStats[]> {
  const educators = await prisma.educator.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      },
      courses: {
        select: {
          id: true,
          enrolledCount: true,
          orders: {
            where: { status: 'paid' },
            select: { finalAmount: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return educators.map((educator) => {
    const coursesCount = educator.courses.length
    const studentsCount = educator.courses.reduce((sum, course) => sum + course.enrolledCount, 0)
    const totalRevenue = educator.courses.reduce(
      (sum, course) => sum + course.orders.reduce((orderSum, order) => orderSum + order.finalAmount, 0),
      0
    )

    return {
      id: educator.id,
      userId: educator.userId,
      name: educator.name,
      title: educator.title,
      bio: educator.bio,
      imageUrl: educator.imageUrl,
      createdAt: educator.createdAt,
      user: educator.user,
      coursesCount,
      studentsCount,
      totalRevenue,
    }
  })
}

/**
 * Get aggregated educator statistics for dashboard
 */
export async function getEducatorStats(): Promise<EducatorStats> {
  const educators = await prisma.educator.findMany({
    include: {
      courses: {
        select: {
          enrolledCount: true,
        },
      },
    },
  })

  const total = educators.length
  const totalCourses = educators.reduce((sum, e) => sum + e.courses.length, 0)
  const totalStudents = educators.reduce(
    (sum, e) => sum + e.courses.reduce((courseSum, c) => courseSum + c.enrolledCount, 0),
    0
  )

  return {
    total,
    totalCourses,
    totalStudents,
    averageRating: 0, // placeholder for future rating system
  }
}

export interface CreateEducatorInput {
  userId: string
  name: string
  title?: string
  bio?: string
  imageUrl?: string
}

/**
 * Create educator profile from existing user
 */
export async function createEducator(data: CreateEducatorInput) {
  return prisma.educator.create({
    data: {
      userId: data.userId,
      name: data.name,
      title: data.title,
      bio: data.bio,
      imageUrl: data.imageUrl,
    },
    include: {
      user: true,
    },
  })
}

export interface UpdateEducatorAsAdminInput {
  name?: string
  title?: string
  bio?: string
  imageUrl?: string
}

/**
 * Update educator as admin (can update all fields)
 */
export async function updateEducatorAsAdmin(
  educatorId: string,
  data: UpdateEducatorAsAdminInput
) {
  return prisma.educator.update({
    where: { id: educatorId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    },
    include: {
      user: true,
    },
  })
}

/**
 * Delete educator (only if no courses, otherwise throw error)
 */
export async function deleteEducator(educatorId: string) {
  // Check if educator has courses
  const coursesCount = await prisma.course.count({
    where: { educatorId },
  })

  if (coursesCount > 0) {
    throw new Error(
      `No se puede eliminar el educador porque tiene ${coursesCount} curso(s). Primero debe reasignar o eliminar los cursos.`
    )
  }

  // Get educator to find userId
  const educator = await prisma.educator.findUnique({
    where: { id: educatorId },
    select: { userId: true },
  })

  if (!educator) {
    throw new Error('Educador no encontrado')
  }

  // Delete educator and reset user role in transaction
  await prisma.$transaction([
    prisma.educator.delete({
      where: { id: educatorId },
    }),
    prisma.user.update({
      where: { id: educator.userId },
      data: { role: null },
    }),
  ])
}

/**
 * Promote user to educator role
 * Creates educator profile and updates user role
 */
export async function promoteUserToEducator(
  userId: string,
  educatorData: Omit<CreateEducatorInput, 'userId'>
) {
  // Check if user exists and doesn't already have educator profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { educator: true },
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  if (user.educator) {
    throw new Error('El usuario ya tiene un perfil de educador')
  }

  // Create educator profile and update role in transaction
  const result = await prisma.$transaction(async (tx) => {
    const educator = await tx.educator.create({
      data: {
        userId,
        name: educatorData.name,
        title: educatorData.title,
        bio: educatorData.bio,
        imageUrl: educatorData.imageUrl,
      },
      include: {
        user: true,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: { role: Role.educator },
    })

    return educator
  })

  return result
}

/**
 * Get educator by ID with full stats for admin detail view
 */
export async function getEducatorByIdWithStats(
  educatorId: string
): Promise<EducatorWithStats | null> {
  const educator = await prisma.educator.findUnique({
    where: { id: educatorId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
        },
      },
      courses: {
        select: {
          id: true,
          enrolledCount: true,
          orders: {
            where: { status: 'paid' },
            select: { finalAmount: true },
          },
        },
      },
    },
  })

  if (!educator) return null

  const coursesCount = educator.courses.length
  const studentsCount = educator.courses.reduce((sum, course) => sum + course.enrolledCount, 0)
  const totalRevenue = educator.courses.reduce(
    (sum, course) => sum + course.orders.reduce((orderSum, order) => orderSum + order.finalAmount, 0),
    0
  )

  return {
    id: educator.id,
    userId: educator.userId,
    name: educator.name,
    title: educator.title,
    bio: educator.bio,
    imageUrl: educator.imageUrl,
    createdAt: educator.createdAt,
    user: educator.user,
    coursesCount,
    studentsCount,
    totalRevenue,
  }
}
