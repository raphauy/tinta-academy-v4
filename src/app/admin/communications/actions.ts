'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import type { EmailCampaignStatus } from '@prisma/client'
import {
  getAllCampaignsForAdmin,
  getAdminCampaignStats,
  getCampaignByIdForAdmin,
  getEducatorsWithCampaigns,
} from '@/services/email-campaign-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export interface CampaignFilters {
  educatorId?: string
  status?: EmailCampaignStatus
  dateFrom?: string
  dateTo?: string
  search?: string
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const getCampaignsFiltersSchema = z.object({
  educatorId: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'partially_sent', 'cancelled']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

async function requireAdmin(): Promise<
  { error: string } | { userId: string }
> {
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

/**
 * Get all campaigns with optional filters for admin panel
 */
export async function getAdminCampaignsAction(
  filters?: CampaignFilters
): Promise<ActionResult<Awaited<ReturnType<typeof getAllCampaignsForAdmin>>>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const validated = getCampaignsFiltersSchema.safeParse(filters || {})

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message }
    }

    const { educatorId, status, dateFrom, dateTo, search } = validated.data

    const campaigns = await getAllCampaignsForAdmin({
      educatorId,
      status: status as EmailCampaignStatus | undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
    })

    return { success: true, data: campaigns }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las campañas',
    }
  }
}

/**
 * Get global campaign statistics for admin dashboard
 */
export async function getAdminCampaignStatsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getAdminCampaignStats>>>
> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const stats = await getAdminCampaignStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching campaign stats:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
    }
  }
}

/**
 * Get campaign detail by ID for admin
 */
export async function getAdminCampaignDetailAction(
  campaignId: string
): Promise<ActionResult<Awaited<ReturnType<typeof getCampaignByIdForAdmin>>>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!campaignId) {
    return { success: false, error: 'ID de campaña requerido' }
  }

  try {
    const campaign = await getCampaignByIdForAdmin(campaignId)

    if (!campaign) {
      return { success: false, error: 'Campaña no encontrada' }
    }

    return { success: true, data: campaign }
  } catch (error) {
    console.error('Error fetching campaign detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el detalle de la campaña',
    }
  }
}

/**
 * Get educators that have campaigns (for filter dropdown)
 */
export async function getEducatorsForFilterAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getEducatorsWithCampaigns>>>
> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const educators = await getEducatorsWithCampaigns()
    return { success: true, data: educators }
  } catch (error) {
    console.error('Error fetching educators:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener educadores',
    }
  }
}

/**
 * Refresh campaign data (for manual refresh button)
 */
export async function refreshCampaignsAction(): Promise<ActionResult> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  revalidatePath('/admin/communications')
  return { success: true }
}
