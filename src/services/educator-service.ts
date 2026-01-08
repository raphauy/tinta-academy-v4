import { prisma } from '@/lib/prisma'

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

export interface EducatorDashboardMetrics {
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
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

  // Get all courses for this educator
  const courses = await prisma.course.findMany({
    where: { educatorId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      startDate: true,
      enrolledCount: true,
      maxCapacity: true,
    },
  })

  // Calculate metrics
  const totalCourses = courses.length
  const publishedCourses = courses.filter((c) => c.status !== 'draft').length
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrolledCount, 0)

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

  return {
    totalCourses,
    publishedCourses,
    totalEnrollments,
    upcomingCourses,
  }
}
