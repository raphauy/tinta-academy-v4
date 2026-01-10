'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import {
  getAllCoursesForAdmin,
  getCourseObservers,
  getCourseEnrollmentsWithDetails,
  deleteCourse,
  type AdminCourse,
  type CourseObserver,
  type CourseEnrollmentWithDetails,
} from '@/services/course-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================
// HELPER FUNCTIONS
// ============================================

async function requireSuperAdmin(): Promise<
  { error: string } | { userId: string }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'superadmin') {
    return { error: 'Acceso denegado. Solo superadministradores.' }
  }

  return { userId: session.user.id }
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all courses with admin metrics
 */
export async function getCoursesForAdminAction(): Promise<ActionResult<AdminCourse[]>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const courses = await getAllCoursesForAdmin()
    return { success: true, data: courses }
  } catch (error) {
    console.error('Error fetching courses for admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los cursos',
    }
  }
}

/**
 * Get observers for a specific course
 */
export async function getCourseObserversAction(
  courseId: string
): Promise<ActionResult<CourseObserver[]>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!courseId) {
    return { success: false, error: 'ID de curso requerido' }
  }

  try {
    const observers = await getCourseObservers(courseId)
    return { success: true, data: observers }
  } catch (error) {
    console.error('Error fetching course observers:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los observadores del curso',
    }
  }
}

/**
 * Get enrollments with details for a specific course
 */
export async function getCourseEnrollmentsAction(
  courseId: string
): Promise<ActionResult<CourseEnrollmentWithDetails[]>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!courseId) {
    return { success: false, error: 'ID de curso requerido' }
  }

  try {
    const enrollments = await getCourseEnrollmentsWithDetails(courseId)
    return { success: true, data: enrollments }
  } catch (error) {
    console.error('Error fetching course enrollments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las inscripciones del curso',
    }
  }
}

/**
 * Delete a course (admin only, no enrollments)
 */
export async function deleteCourseAsAdminAction(
  courseId: string
): Promise<ActionResult<void>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!courseId) {
    return { success: false, error: 'ID de curso requerido' }
  }

  try {
    await deleteCourse(courseId)

    revalidatePath('/admin/courses')
    revalidatePath('/cursos')
    revalidatePath('/')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting course:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el curso',
    }
  }
}
