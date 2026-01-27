'use server'

import { auth } from '@/lib/auth'
import {
  getAllPendingExecutionsForAdmin,
  getExecutionHistoryForAdmin,
} from '@/services/workflow-execution-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

interface WorkflowExecutionsData {
  pending: Awaited<ReturnType<typeof getAllPendingExecutionsForAdmin>>
  history: Awaited<ReturnType<typeof getExecutionHistoryForAdmin>>
  stats: {
    pending: number
    sent: number
    failed: number
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// ============================================
// SERVER ACTIONS
// ============================================

export async function getWorkflowExecutionsAction(
  workflowId: string
): Promise<ActionResult<WorkflowExecutionsData>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const [pending, history] = await Promise.all([
      getAllPendingExecutionsForAdmin({ workflowId }),
      getExecutionHistoryForAdmin({ workflowId }),
    ])

    // Calculate stats
    const sentStatuses = ['sent', 'delivered', 'opened', 'clicked']
    const failedStatuses = ['failed', 'bounced']

    const stats = {
      pending: pending.length,
      sent: history.filter((e) => sentStatuses.includes(e.status)).length,
      failed: history.filter((e) => failedStatuses.includes(e.status)).length,
    }

    return {
      success: true,
      data: { pending, history, stats },
    }
  } catch (error) {
    console.error('[getWorkflowExecutionsAction] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener ejecuciones',
    }
  }
}
