'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import {
  removeStudentFromCourse,
  type RemoveStudentFromCourseResult,
} from '@/services/enrollment-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================
// HELPERS
// ============================================

async function authorizeCourse(
  courseId: string
): Promise<{ error: string } | { userId: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  const role = session.user.role
  if (role !== 'educator' && role !== 'superadmin') {
    return { error: 'No autorizado' }
  }

  const course = await getCourseById(courseId)
  if (!course) {
    return { error: 'Curso no encontrado' }
  }

  if (role === 'educator') {
    const educator = await getEducatorByUserId(session.user.id)
    if (!educator || course.educatorId !== educator.id) {
      return { error: 'No tenés permiso para gestionar este curso' }
    }
  }

  return { userId: session.user.id }
}

// ============================================
// ACTIONS
// ============================================

/**
 * Quita a un alumno de un curso que aún no inició: cancela la inscripción,
 * frena los emails automáticos pendientes y anula las órdenes asociadas.
 */
export async function removeStudentFromCourseAction(
  courseId: string,
  enrollmentId: string
): Promise<ActionResult<RemoveStudentFromCourseResult>> {
  const authResult = await authorizeCourse(courseId)
  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!enrollmentId) {
    return { success: false, error: 'Inscripción requerida' }
  }

  try {
    const data = await removeStudentFromCourse({
      courseId,
      enrollmentId,
      cancelledById: authResult.userId,
    })

    revalidatePath(`/educator/courses/${courseId}/students`)
    revalidatePath('/educator/students')

    return { success: true, data }
  } catch (error) {
    console.error('[students] removeStudentFromCourseAction error:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al quitar al alumno',
    }
  }
}
