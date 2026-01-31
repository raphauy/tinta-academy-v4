'use server'

import { auth } from '@/lib/auth'
import { getCourseWorkflowExecutionsForAdmin } from '@/services/workflow-execution-service'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

async function requireAdmin(): Promise<{ error: string } | { userId: string }> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'superadmin') {
    return { error: 'Acceso denegado. Solo administradores.' }
  }

  return { userId: session.user.id }
}

export async function getCourseWorkflowExecutionsAction(
  courseWorkflowId: string
): Promise<ActionResult<Awaited<ReturnType<typeof getCourseWorkflowExecutionsForAdmin>>>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const data = await getCourseWorkflowExecutionsForAdmin(courseWorkflowId)
    return { success: true, data }
  } catch (error) {
    console.error('[getCourseWorkflowExecutionsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener ejecuciones',
    }
  }
}
