import { prisma } from '@/lib/prisma'
import { Prisma, CourseModality, CourseType, CourseStatus } from '@prisma/client'

interface CourseFilters {
  modality?: string
  type?: string
  tagIds?: string[]
}

interface EducatorCourseFilters {
  status?: CourseStatus
  type?: CourseType
  modality?: CourseModality
}

export interface CreateCourseInput {
  title: string
  slug: string
  type: CourseType
  description?: string
  startDate?: Date
  endDate?: Date
  duration?: string
  // Class schedule fields
  classDates?: Date[]
  startTime?: string
  classDuration?: number
  examDate?: Date
  registrationDeadline?: Date
  // Capacity and other fields
  maxCapacity?: number
  priceUSD: number
  priceUYU?: number
  location?: string
  address?: string
  imageUrl?: string
  wsetLevel?: number
  educatorId: string
  // Tags
  tagIds?: string[]
}

export interface UpdateCourseInput {
  title?: string
  slug?: string
  type?: CourseType
  description?: string
  startDate?: Date
  endDate?: Date
  duration?: string
  // Class schedule fields
  classDates?: Date[]
  startTime?: string
  classDuration?: number
  examDate?: Date
  registrationDeadline?: Date
  // Capacity and other fields
  maxCapacity?: number
  priceUSD?: number
  priceUYU?: number | null
  location?: string
  address?: string
  imageUrl?: string
  wsetLevel?: number
  // Tags
  tagIds?: string[]
}

// Status values that are considered "published" (visible to public)
const publicStatuses: CourseStatus[] = [
  'announced',
  'enrolling',
  'full',
  'in_progress',
  'available',
  'finished',
]

export async function getCourses(filters: CourseFilters = {}) {
  const where: Prisma.CourseWhereInput = {
    // Only show published courses to public
    status: { in: publicStatuses },
  }

  if (filters.modality) {
    where.modality = filters.modality as CourseModality
  }

  if (filters.type) {
    where.type = filters.type as CourseType
  }

  if (filters.tagIds?.length) {
    where.tags = {
      some: {
        id: { in: filters.tagIds }
      }
    }
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      educator: true,
      tags: true,
    },
    orderBy: {
      startDate: 'asc'
    }
  })

  const now = new Date()
  const upcomingCourses = courses.filter(course => 
    course.status === 'available' || 
    (course.startDate && course.startDate > now)
  )
  
  const pastCourses = courses.filter(course => 
    course.status === 'finished' || 
    (course.startDate && course.startDate <= now && course.status !== 'available')
  )

  return {
    upcomingCourses,
    pastCourses
  }
}

export async function getUpcomingCourses(filters: CourseFilters = {}) {
  const { upcomingCourses } = await getCourses(filters)
  return upcomingCourses
}

export async function getPastCourses(filters: CourseFilters = {}) {
  const { pastCourses } = await getCourses(filters)
  return pastCourses
}

export async function getCourseBySlug(slug: string, includeUnpublished = false) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      educator: true,
      tags: true,
    },
  })

  // If course is not found or should be hidden from public
  if (!course) return null
  if (!includeUnpublished && !publicStatuses.includes(course.status)) {
    return null
  }

  return course
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      educator: true,
      tags: true,
    },
  })
}

// ============================================
// EDUCATOR-SPECIFIC OPERATIONS
// ============================================

export async function getEducatorCourses(
  educatorId: string,
  filters: EducatorCourseFilters = {}
) {
  const where: Prisma.CourseWhereInput = {
    educatorId,
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.modality) {
    where.modality = filters.modality
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      educator: true,
      tags: true,
      orders: {
        where: { status: 'paid' },
        select: { finalAmount: true, currency: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  })

  // Calculate revenue by currency for each course
  return courses.map((course) => {
    let totalRevenueUSD = 0
    let totalRevenueUYU = 0

    course.orders.forEach((order) => {
      if (order.currency === 'USD') {
        totalRevenueUSD += order.finalAmount
      } else if (order.currency === 'UYU') {
        totalRevenueUYU += order.finalAmount
      }
    })

    return {
      ...course,
      totalRevenueUSD,
      totalRevenueUYU,
    }
  })
}

export async function createCourse(data: CreateCourseInput) {
  return prisma.course.create({
    data: {
      title: data.title,
      slug: data.slug,
      type: data.type,
      modality: 'presencial', // Only presencial for now
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
      // Class schedule fields
      classDates: data.classDates ?? [],
      startTime: data.startTime,
      classDuration: data.classDuration,
      examDate: data.examDate,
      registrationDeadline: data.registrationDeadline,
      // Other fields
      maxCapacity: data.maxCapacity,
      priceUSD: data.priceUSD,
      priceUYU: data.priceUYU,
      location: data.location,
      address: data.address,
      imageUrl: data.imageUrl,
      wsetLevel: data.wsetLevel,
      status: 'draft', // New courses start as draft
      educatorId: data.educatorId,
      // Connect tags if provided
      ...(data.tagIds &&
        data.tagIds.length > 0 && {
          tags: {
            connect: data.tagIds.map((id) => ({ id })),
          },
        }),
    },
    include: {
      educator: true,
      tags: true,
    },
  })
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
  return prisma.course.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.duration !== undefined && { duration: data.duration }),
      // Class schedule fields
      ...(data.classDates !== undefined && { classDates: data.classDates }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.classDuration !== undefined && { classDuration: data.classDuration }),
      ...(data.examDate !== undefined && { examDate: data.examDate }),
      ...(data.registrationDeadline !== undefined && { registrationDeadline: data.registrationDeadline }),
      // Other fields
      ...(data.maxCapacity !== undefined && { maxCapacity: data.maxCapacity }),
      ...(data.priceUSD !== undefined && { priceUSD: data.priceUSD }),
      ...(data.priceUYU !== undefined && { priceUYU: data.priceUYU }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.wsetLevel !== undefined && { wsetLevel: data.wsetLevel }),
      // Replace tags if provided (disconnect all, then connect new ones)
      ...(data.tagIds !== undefined && {
        tags: {
          set: data.tagIds.map((tagId) => ({ id: tagId })),
        },
      }),
    },
    include: {
      educator: true,
      tags: true,
    },
  })
}

export async function publishCourse(id: string) {
  return prisma.course.update({
    where: { id },
    data: {
      status: 'enrolling',
    },
  })
}

export async function unpublishCourse(id: string) {
  return prisma.course.update({
    where: { id },
    data: {
      status: 'draft',
    },
  })
}

export async function deleteCourse(id: string) {
  // Check if course has enrollments
  const enrollmentCount = await prisma.enrollment.count({
    where: { courseId: id },
  })

  if (enrollmentCount > 0) {
    throw new Error(
      `No se puede eliminar el curso porque tiene ${enrollmentCount} inscripción(es). Primero debe cancelar las inscripciones.`
    )
  }

  // Hard delete if no enrollments
  return prisma.course.delete({
    where: { id },
  })
}

/**
 * Checks if a slug is already in use by another course.
 * When editing, pass the courseId to allow the same slug for the same course.
 * @returns true if slug is in use by another course, false if available
 */
export async function checkSlug(slug: string, courseId?: string): Promise<boolean> {
  const existingCourse = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existingCourse) {
    return false // Slug is available
  }

  // If editing the same course, allow the same slug
  if (courseId && existingCourse.id === courseId) {
    return false // Slug belongs to this course, so it's available
  }

  return true // Slug is in use by another course
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

export interface AdminCourse {
  id: string
  slug: string
  title: string
  type: CourseType
  modality: CourseModality
  status: CourseStatus
  priceUSD: number
  startDate: Date | null
  endDate: Date | null
  maxCapacity: number | null
  wsetLevel: number | null
  imageUrl: string | null
  createdAt: Date
  educator: {
    id: string
    name: string
    imageUrl: string | null
  }
  tags: Array<{ id: string; name: string }>
  enrolledCount: number
  observersCount: number
  totalRevenue: number // deprecated: mantener por compatibilidad
  totalRevenueUSD: number
  totalRevenueUYU: number
  completionRate: number
  averageProgress: number
}

export interface CourseObserver {
  id: string
  email: string
  name: string | null
  createdAt: Date
}

export interface CourseEnrollmentWithDetails {
  id: string
  status: string
  enrolledAt: Date
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    user: {
      id: string
      email: string
      name: string | null
    }
  }
  progress: number // placeholder for future progress tracking
}

export interface CourseAnalytics {
  id: string
  title: string
  enrolledCount: number
  observersCount: number
  totalRevenue: number
  revenueByMonth: Array<{ month: string; value: number }>
  enrollmentsByMonth: Array<{ month: string; value: number }>
  completionRate: number
  averageProgress: number
  topReferrers: Array<{ source: string; count: number }> // placeholder for analytics
}

/**
 * Get all courses with admin metrics
 */
export async function getAllCoursesForAdmin(): Promise<AdminCourse[]> {
  const courses = await prisma.course.findMany({
    include: {
      educator: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      tags: {
        select: {
          id: true,
          name: true,
        },
      },
      orders: {
        where: { status: 'paid' },
        select: { finalAmount: true, currency: true },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return courses.map((course) => {
    // Calculate revenue by currency
    let totalRevenueUSD = 0
    let totalRevenueUYU = 0
    
    course.orders.forEach((order) => {
      if (order.currency === 'USD') {
        totalRevenueUSD += order.finalAmount
      } else if (order.currency === 'UYU') {
        totalRevenueUYU += order.finalAmount
      }
    })

    // Keep totalRevenue for backward compatibility (sum of both currencies)
    const totalRevenue = totalRevenueUSD + totalRevenueUYU

    // Placeholder for observers (users interested but not enrolled)
    // In a real implementation, this would come from a separate CourseObserver model
    const observersCount = 0

    // Calculate completion rate based on course status
    const completionRate = course.status === 'finished' ? 100 : 0
    const averageProgress = course.status === 'finished'
      ? 100
      : course.status === 'in_progress'
        ? 50
        : 0

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      type: course.type,
      modality: course.modality,
      status: course.status,
      priceUSD: course.priceUSD,
      startDate: course.startDate,
      endDate: course.endDate,
      maxCapacity: course.maxCapacity,
      wsetLevel: course.wsetLevel,
      imageUrl: course.imageUrl,
      createdAt: course.createdAt,
      educator: course.educator,
      tags: course.tags,
      enrolledCount: course._count.enrollments,
      observersCount,
      totalRevenue,
      totalRevenueUSD,
      totalRevenueUYU,
      completionRate,
      averageProgress,
    }
  })
}

/**
 * Get detailed analytics for a specific course
 */
export async function getCourseAnalytics(courseId: string): Promise<CourseAnalytics | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      orders: {
        where: { status: 'paid' },
        select: {
          finalAmount: true,
          paidAt: true,
        },
      },
      enrollments: {
        select: {
          status: true,
          enrolledAt: true,
        },
      },
    },
  })

  if (!course) return null

  const totalRevenue = course.orders.reduce((sum, order) => sum + order.finalAmount, 0)

  // Generate revenue by month for last 6 months
  const revenueByMonth: Array<{ month: string; value: number }> = []
  const enrollmentsByMonth: Array<{ month: string; value: number }> = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
    const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short' })

    const monthRevenue = course.orders
      .filter((o) => o.paidAt && o.paidAt >= monthStart && o.paidAt <= monthEnd)
      .reduce((sum, o) => sum + o.finalAmount, 0)

    const monthEnrollments = course.enrollments.filter(
      (e) => e.status === 'confirmed' && e.enrolledAt >= monthStart && e.enrolledAt <= monthEnd
    ).length

    revenueByMonth.push({ month: monthName, value: monthRevenue })
    enrollmentsByMonth.push({ month: monthName, value: monthEnrollments })
  }

  const completionRate = course.status === 'finished' ? 100 : 0
  const averageProgress = course.status === 'finished'
    ? 100
    : course.status === 'in_progress'
      ? 50
      : 0

  return {
    id: course.id,
    title: course.title,
    enrolledCount: course.enrolledCount,
    observersCount: 0, // placeholder
    totalRevenue,
    revenueByMonth,
    enrollmentsByMonth,
    completionRate,
    averageProgress,
    topReferrers: [], // placeholder for future analytics
  }
}

/**
 * Get observers for a course (users interested but not enrolled)
 * Placeholder - would need a CourseObserver model in the future
 */
export async function getCourseObservers(courseId: string): Promise<CourseObserver[]> {
  // Placeholder implementation
  // In a real implementation, this would query a CourseObserver model
  // For now, return empty array
  console.log(`Getting observers for course ${courseId}`)
  return []
}

/**
 * Get enrollments with full student details for admin
 */
export async function getCourseEnrollmentsWithDetails(
  courseId: string
): Promise<CourseEnrollmentWithDetails[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    include: {
      student: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    student: {
      id: enrollment.student.id,
      firstName: enrollment.student.firstName,
      lastName: enrollment.student.lastName,
      user: enrollment.student.user,
    },
    progress: enrollment.status === 'confirmed' ? 50 : 0, // placeholder
  }))
}