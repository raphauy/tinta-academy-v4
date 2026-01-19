'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getTemplateById } from '@/services/email-template-service'
import {
  createCampaign,
  addRecipientsToCampaign,
  processCampaignSend,
  scheduleCampaign,
  cancelScheduledCampaign,
} from '@/services/email-campaign-service'
import { getStudentsByCourse } from '@/services/student-selection-service'
import { prisma } from '@/lib/prisma'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const sendCampaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  templateId: z.string().min(1, 'La plantilla es requerida'),
  recipientMode: z.enum(['course', 'custom']),
  courseId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(), // ISO date string for scheduled sends
  timezone: z.string().default('America/Montevideo'),
})

const cancelCampaignSchema = z.object({
  campaignId: z.string().min(1, 'El ID de campaña es requerido'),
})

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

type SendCampaignResult = {
  campaignId: string
  sent: number
  failed: number
  scheduled?: boolean
  scheduledAt?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

type EducatorWithUser = NonNullable<
  Awaited<ReturnType<typeof getEducatorByUserId>>
>

async function getAuthenticatedEducator(): Promise<
  { error: string } | { educator: EducatorWithUser }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    return { error: 'No autorizado - solo educadores' }
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    return { error: 'Educador no encontrado' }
  }

  return { educator }
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Send an email campaign immediately to selected recipients
 */
export async function sendCampaignAction(
  data: z.infer<typeof sendCampaignSchema>
): Promise<ActionResult<SendCampaignResult>> {
  // Validate input
  const validated = sendCampaignSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const { name, templateId, recipientMode, courseId, studentIds, scheduledAt, timezone } =
    validated.data

  // Get authenticated educator
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    // Verify template belongs to educator
    const template = await getTemplateById(templateId, educator.id)

    if (!template) {
      return {
        success: false,
        error: 'Plantilla no encontrada o sin acceso',
      }
    }

    // Get recipients based on mode
    let recipients: Array<{ studentId: string; email: string }> = []

    if (recipientMode === 'course') {
      if (!courseId) {
        return {
          success: false,
          error: 'Se requiere un curso para el modo de curso',
        }
      }

      const students = await getStudentsByCourse(courseId, educator.id)

      if (students.length === 0) {
        return {
          success: false,
          error: 'No hay estudiantes inscritos en el curso seleccionado',
        }
      }

      recipients = students.map((s) => ({
        studentId: s.id,
        email: s.email,
      }))
    } else {
      // Custom mode
      if (!studentIds || studentIds.length === 0) {
        return {
          success: false,
          error: 'Se requiere al menos un estudiante para el envío',
        }
      }

      // Get students with their emails
      const students = await prisma.student.findMany({
        where: {
          id: { in: studentIds },
        },
        include: {
          user: {
            select: { email: true },
          },
        },
      })

      recipients = students.map((s) => ({
        studentId: s.id,
        email: s.user.email,
      }))
    }

    // Determine if this is a scheduled send
    // scheduledAt comes from client as ISO string (already UTC)
    const isScheduled = !!scheduledAt
    const scheduledAtDate = scheduledAt ? new Date(scheduledAt) : undefined

    // Create campaign
    const campaign = await createCampaign({
      name,
      templateId,
      educatorId: educator.id,
      courseId: recipientMode === 'course' ? courseId : undefined,
      scheduledAt: scheduledAtDate,
      timezone,
    })

    // Add recipients to campaign
    await addRecipientsToCampaign(campaign.id, recipients)

    // Either schedule for later or send immediately
    if (isScheduled && scheduledAtDate) {
      // Schedule the campaign
      await scheduleCampaign(campaign.id, scheduledAtDate, timezone)

      // Revalidate communications path
      revalidatePath('/educator/communications')

      return {
        success: true,
        data: {
          campaignId: campaign.id,
          sent: 0,
          failed: 0,
          scheduled: true,
          scheduledAt: scheduledAtDate.toISOString(),
        },
      }
    }

    // Process and send immediately
    const sendResult = await processCampaignSend(campaign.id)

    // Revalidate communications path
    revalidatePath('/educator/communications')

    return {
      success: true,
      data: {
        campaignId: campaign.id,
        sent: sendResult.sent,
        failed: sendResult.failed,
      },
    }
  } catch (error) {
    console.error('Error sending campaign:', error)
    const message =
      error instanceof Error ? error.message : 'Error al enviar la campaña'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Cancel a scheduled email campaign
 */
export async function cancelCampaignAction(
  data: z.infer<typeof cancelCampaignSchema>
): Promise<ActionResult> {
  // Validate input
  const validated = cancelCampaignSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const { campaignId } = validated.data

  // Get authenticated educator
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    // Cancel the scheduled campaign (service validates ownership and status)
    await cancelScheduledCampaign(campaignId, educator.id)

    // Revalidate communications path
    revalidatePath('/educator/communications')

    return { success: true }
  } catch (error) {
    console.error('Error cancelling campaign:', error)
    const message =
      error instanceof Error ? error.message : 'Error al cancelar la campaña'
    return {
      success: false,
      error: message,
    }
  }
}
