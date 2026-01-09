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
  educatorName: string
  enrolledAt: Date
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

  // Get all confirmed enrollments with course and educator data
  const enrollments = await prisma.enrollment.findMany({
    where: {
      studentId,
      status: 'confirmed',
    },
    include: {
      course: {
        include: {
          educator: true,
        },
      },
    },
    orderBy: {
      enrolledAt: 'desc',
    },
  })

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

  // Upcoming courses: startDate > now
  const upcomingEnrollments = enrollments.filter(
    (e) => e.course.startDate && e.course.startDate > now
  )

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
    educatorName: enrollment.course.educator.name,
    enrolledAt: enrollment.enrolledAt,
  })

  // Upcoming courses sorted by startDate
  const upcomingCourses = upcomingEnrollments
    .sort((a, b) => {
      if (!a.course.startDate || !b.course.startDate) return 0
      return a.course.startDate.getTime() - b.course.startDate.getTime()
    })
    .slice(0, 3)
    .map(mapToQuickAccess)

  // Recent courses: last 3 enrolled (already sorted by enrolledAt desc)
  const recentCourses = enrollments.slice(0, 3).map(mapToQuickAccess)

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
