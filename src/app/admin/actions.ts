'use server'

import { auth } from '@/lib/auth'
import { getDashboardMetrics, type DashboardMetrics } from '@/services/admin-service'

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
 * Get dashboard metrics for admin panel
 */
export async function getDashboardMetricsAction(): Promise<ActionResult<DashboardMetrics>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const metrics = await getDashboardMetrics()
    return { success: true, data: metrics }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las métricas del dashboard',
    }
  }
}
