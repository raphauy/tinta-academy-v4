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
  getCampaignsWithStats,
} from '@/services/email-campaign-service'
import { renderTemplate, formatDateSpanish, type TemplateVariables } from '@/lib/email/template-variables'
import { sendDynamicEmail } from '@/services/email-service'

const TEST_EMAIL_VARIABLES: TemplateVariables = {
  studentName: 'María García',
  studentFirstName: 'María',
  studentEmail: 'maria@example.com',
  courseName: 'WSET Nivel 1 en Vinos',
  courseStartDate: '15 de marzo de 2025',
  courseEndDate: '20 de marzo de 2025',
  examDate: '20 de marzo de 2025',
  educatorName: 'Gabriela Zimmer',
  courseUrl: 'https://academy.tinta.wine/student/courses/abc123',
}
import { getStudentsByCourse } from '@/services/student-selection-service'
import { getStudentIdsByFilter } from '@/services/audience-filter-service'
import { prisma } from '@/lib/prisma'
import type { EmailCampaignStatus } from '@prisma/client'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const sendCampaignSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  templateId: z.string().min(1, 'La plantilla es requerida'),
  recipientMode: z.enum(['course', 'custom', 'filter']),
  courseId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
  filterId: z.string().optional(),
  scheduledAt: z.string().optional(), // ISO date string for scheduled sends
  timezone: z.string().default('America/Montevideo'),
})

const cancelCampaignSchema = z.object({
  campaignId: z.string().min(1, 'El ID de campaña es requerido'),
})

const sendTestEmailSchema = z.object({
  templateId: z.string().min(1, 'La plantilla es requerida'),
  email: z.string().email('Email inválido'),
  courseId: z.string().optional(),
})

const getCampaignsFiltersSchema = z.object({
  courseId: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'sending', 'sent', 'partially_sent', 'cancelled']).optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(), // ISO date string
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

type GetCampaignsResult = Awaited<ReturnType<typeof getCampaignsWithStats>>

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

  const { name, templateId, recipientMode, courseId, studentIds, filterId, scheduledAt, timezone } =
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
    let audienceFilterId: string | undefined

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
    } else if (recipientMode === 'filter') {
      // Filter mode
      if (!filterId) {
        return {
          success: false,
          error: 'Se requiere un filtro para el modo de filtro',
        }
      }

      audienceFilterId = filterId

      // Get student IDs from filter evaluation
      const filterStudentIds = await getStudentIdsByFilter(filterId)

      if (filterStudentIds.length === 0) {
        return {
          success: false,
          error: 'No hay estudiantes que coincidan con el filtro seleccionado',
        }
      }

      // Get students with their emails
      const students = await prisma.student.findMany({
        where: {
          id: { in: filterStudentIds },
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
      audienceFilterId,
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

/**
 * Get campaigns with filters for client-side filtering with revalidation
 */
export async function getCampaignsAction(
  data: z.infer<typeof getCampaignsFiltersSchema>
): Promise<ActionResult<GetCampaignsResult>> {
  // Validate input
  const validated = getCampaignsFiltersSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  // Get authenticated educator
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    // Parse filters
    const filters: {
      courseId?: string
      status?: EmailCampaignStatus
      dateFrom?: Date
      dateTo?: Date
    } = {}

    if (validated.data.courseId) {
      filters.courseId = validated.data.courseId
    }

    if (validated.data.status) {
      filters.status = validated.data.status as EmailCampaignStatus
    }

    if (validated.data.dateFrom) {
      filters.dateFrom = new Date(validated.data.dateFrom)
    }

    if (validated.data.dateTo) {
      filters.dateTo = new Date(validated.data.dateTo)
    }

    // Get campaigns with stats
    const campaigns = await getCampaignsWithStats(educator.id, filters)

    // Revalidate communications path
    revalidatePath('/educator/communications')
    revalidatePath('/educator/communications/history')

    return {
      success: true,
      data: campaigns,
    }
  } catch (error) {
    console.error('Error getting campaigns:', error)
    const message =
      error instanceof Error ? error.message : 'Error al obtener las campañas'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Send a test email with sample data to verify how a template looks
 */
export async function sendTestEmailAction(
  data: z.infer<typeof sendTestEmailSchema>
): Promise<ActionResult> {
  const validated = sendTestEmailSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const { templateId, email, courseId } = validated.data

  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    const template = await getTemplateById(templateId, educator.id)

    if (!template) {
      return {
        success: false,
        error: 'Plantilla no encontrada o sin acceso',
      }
    }

    // Build variables with real educator data and course data if available
    const variables: TemplateVariables = {
      ...TEST_EMAIL_VARIABLES,
      educatorName: educator.name,
    }

    if (courseId) {
      const course = await prisma.course.findFirst({
        where: { id: courseId, educatorId: educator.id },
        select: { id: true, title: true, startDate: true, endDate: true, examDate: true },
      })

      if (course) {
        variables.courseName = course.title
        variables.courseStartDate = formatDateSpanish(course.startDate)
        variables.courseEndDate = formatDateSpanish(course.endDate)
        variables.examDate = formatDateSpanish(course.examDate)
        variables.courseUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://academy.tinta.wine'}/student/courses/${course.id}`
      }
    }

    const renderedSubject = renderTemplate(template.subject, variables)
    const renderedBody = renderTemplate(template.body, variables)

    const result = await sendDynamicEmail({
      to: email,
      subject: `[PRUEBA] ${renderedSubject}`,
      body: renderedBody,
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Error al enviar el email de prueba',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending test email:', error)
    const message =
      error instanceof Error ? error.message : 'Error al enviar el email de prueba'
    return {
      success: false,
      error: message,
    }
  }
}
