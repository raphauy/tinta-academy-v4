import { prisma } from '@/lib/prisma'
import { CourseStatus } from '@prisma/client'
import { startOfDay } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { sendEducatorStatusReminderEmail } from './email-service'

const TIMEZONE = 'America/Montevideo'

export interface CourseNeedingAttention {
  id: string
  title: string
  slug: string
  currentStatus: CourseStatus
  suggestedStatus: CourseStatus
  reason: string
  educatorId: string
  educatorEmail: string
  educatorName: string
}

interface CourseStatusSuggestion {
  suggestedStatus: CourseStatus
  reason: string
}

/**
 * Analyzes a course and determines if it needs a status change
 */
function analyzeCourseStatus(course: {
  status: CourseStatus
  startDate: Date | null
  endDate: Date | null
  enrolledCount: number
  maxCapacity: number | null
}): CourseStatusSuggestion | null {
  const now = toZonedTime(new Date(), TIMEZONE)
  const today = startOfDay(now)

  // Check: Course is full (enrolling -> full)
  if (
    course.status === 'enrolling' &&
    course.maxCapacity !== null &&
    course.enrolledCount >= course.maxCapacity
  ) {
    return {
      suggestedStatus: 'full',
      reason: `Cupo lleno (${course.enrolledCount}/${course.maxCapacity} estudiantes)`,
    }
  }

  // Check: Course has started (enrolling/full -> in_progress)
  if (
    (course.status === 'enrolling' || course.status === 'full') &&
    course.startDate !== null
  ) {
    const startDate = startOfDay(toZonedTime(course.startDate, TIMEZONE))
    if (startDate <= today) {
      const formattedDate = course.startDate.toLocaleDateString('es-UY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: TIMEZONE,
      })
      return {
        suggestedStatus: 'in_progress',
        reason: `La fecha de inicio (${formattedDate}) ya pasó`,
      }
    }
  }

  // Check: Course has ended (in_progress -> finished)
  if (course.status === 'in_progress' && course.endDate !== null) {
    const endDate = startOfDay(toZonedTime(course.endDate, TIMEZONE))
    if (endDate < today) {
      const formattedDate = course.endDate.toLocaleDateString('es-UY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: TIMEZONE,
      })
      return {
        suggestedStatus: 'finished',
        reason: `La fecha de fin (${formattedDate}) ya pasó`,
      }
    }
  }

  return null
}

/**
 * Gets all courses that need a status change
 */
export async function getCoursesPendingStatusChange(): Promise<
  CourseNeedingAttention[]
> {
  // Get courses that might need attention
  // We only check courses in certain states:
  // - enrolling: might need to become full or in_progress
  // - full: might need to become in_progress
  // - in_progress: might need to become finished
  const courses = await prisma.course.findMany({
    where: {
      status: {
        in: ['enrolling', 'full', 'in_progress'],
      },
    },
    include: {
      educator: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  })

  const coursesNeedingAttention: CourseNeedingAttention[] = []

  for (const course of courses) {
    const suggestion = analyzeCourseStatus({
      status: course.status,
      startDate: course.startDate,
      endDate: course.endDate,
      enrolledCount: course.enrolledCount,
      maxCapacity: course.maxCapacity,
    })

    if (suggestion) {
      coursesNeedingAttention.push({
        id: course.id,
        title: course.title,
        slug: course.slug,
        currentStatus: course.status,
        suggestedStatus: suggestion.suggestedStatus,
        reason: suggestion.reason,
        educatorId: course.educatorId,
        educatorEmail: course.educator.user.email,
        educatorName: course.educator.name,
      })
    }
  }

  return coursesNeedingAttention
}

/**
 * Gets courses needing attention for a specific educator
 */
export async function getEducatorCoursesNeedingAttention(
  educatorId: string
): Promise<CourseNeedingAttention[]> {
  const allCourses = await getCoursesPendingStatusChange()
  return allCourses.filter((course) => course.educatorId === educatorId)
}

/**
 * Translates course status to Spanish
 */
export function getStatusLabel(status: CourseStatus): string {
  const labels: Record<CourseStatus, string> = {
    draft: 'Borrador',
    announced: 'Anunciado',
    enrolling: 'Inscribiendo',
    full: 'Completo',
    in_progress: 'En curso',
    finished: 'Finalizado',
    available: 'Disponible',
  }
  return labels[status]
}

/**
 * Main function: notifies all educators about their courses needing attention
 * Returns summary of notifications sent
 */
export async function notifyEducatorsAboutCourseStatus(): Promise<{
  educatorsNotified: number
  coursesReported: number
}> {
  const coursesNeedingAttention = await getCoursesPendingStatusChange()

  if (coursesNeedingAttention.length === 0) {
    return { educatorsNotified: 0, coursesReported: 0 }
  }

  // Group courses by educator
  const coursesByEducator = new Map<
    string,
    {
      educatorEmail: string
      educatorName: string
      courses: CourseNeedingAttention[]
    }
  >()

  for (const course of coursesNeedingAttention) {
    const existing = coursesByEducator.get(course.educatorId)
    if (existing) {
      existing.courses.push(course)
    } else {
      coursesByEducator.set(course.educatorId, {
        educatorEmail: course.educatorEmail,
        educatorName: course.educatorName,
        courses: [course],
      })
    }
  }

  // Send email to each educator
  let educatorsNotified = 0

  for (const [, educator] of coursesByEducator) {
    try {
      await sendEducatorStatusReminderEmail({
        to: educator.educatorEmail,
        educatorName: educator.educatorName,
        courses: educator.courses.map((c) => ({
          id: c.id,
          title: c.title,
          currentStatus: c.currentStatus,
          currentStatusLabel: getStatusLabel(c.currentStatus),
          suggestedStatus: c.suggestedStatus,
          suggestedStatusLabel: getStatusLabel(c.suggestedStatus),
          reason: c.reason,
        })),
      })
      educatorsNotified++
      console.log(
        `[CourseStatusNotification] Sent notification to ${educator.educatorEmail} for ${educator.courses.length} course(s)`
      )
    } catch (error) {
      console.error(
        `[CourseStatusNotification] Failed to send notification to ${educator.educatorEmail}:`,
        error
      )
    }
  }

  return {
    educatorsNotified,
    coursesReported: coursesNeedingAttention.length,
  }
}
