import { prisma } from '@/lib/prisma'
import { updateCampaignStats } from './email-campaign-service'

// =============================================================================
// Resend Webhook Event Types
// =============================================================================

export type ResendWebhookEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.complained'
  | 'email.bounced'
  | 'email.opened'
  | 'email.clicked'

export interface ResendWebhookEvent {
  type: ResendWebhookEventType
  created_at: string
  data: {
    email_id: string
    from: string
    to: string[]
    subject: string
    // Additional fields depending on event type
    click?: {
      link: string
    }
  }
}

// =============================================================================
// Webhook Event Processing
// =============================================================================

/**
 * Process a Resend webhook event and update the corresponding
 * EmailRecipient or WorkflowExecution record
 */
export async function processResendWebhookEvent(
  event: ResendWebhookEvent
): Promise<{ processed: boolean; target?: 'recipient' | 'workflow' }> {
  const resendId = event.data.email_id

  // Try to find the email in EmailRecipient first
  const recipient = await prisma.emailRecipient.findFirst({
    where: { resendId }
  })

  if (recipient) {
    await updateRecipientFromEvent(recipient.id, event)
    await updateCampaignStats(recipient.campaignId)
    return { processed: true, target: 'recipient' }
  }

  // If not found in recipients, check WorkflowExecution
  const workflowExecution = await prisma.workflowExecution.findFirst({
    where: { resendId }
  })

  if (workflowExecution) {
    await updateWorkflowExecutionFromEvent(workflowExecution.id, event)
    return { processed: true, target: 'workflow' }
  }

  // Email not found in our system
  return { processed: false }
}

/**
 * Update an EmailRecipient based on the webhook event
 */
async function updateRecipientFromEvent(
  recipientId: string,
  event: ResendWebhookEvent
): Promise<void> {
  const updateData = getUpdateDataFromEvent(event)

  if (Object.keys(updateData).length > 0) {
    await prisma.emailRecipient.update({
      where: { id: recipientId },
      data: updateData
    })
  }
}

/**
 * Update a WorkflowExecution based on the webhook event
 */
async function updateWorkflowExecutionFromEvent(
  executionId: string,
  event: ResendWebhookEvent
): Promise<void> {
  const updateData = getUpdateDataFromEvent(event)

  if (Object.keys(updateData).length > 0) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: updateData
    })
  }
}

/**
 * Get the database update data based on event type
 */
function getUpdateDataFromEvent(event: ResendWebhookEvent): Record<string, unknown> {
  const timestamp = new Date(event.created_at)

  switch (event.type) {
    case 'email.delivered':
      return {
        status: 'delivered',
        deliveredAt: timestamp
      }

    case 'email.opened':
      return {
        status: 'opened',
        openedAt: timestamp
      }

    case 'email.clicked':
      return {
        status: 'clicked',
        clickedAt: timestamp
      }

    case 'email.bounced':
      return {
        status: 'bounced'
      }

    case 'email.complained':
      return {
        status: 'bounced',
        errorMessage: 'Recipient marked email as spam'
      }

    case 'email.delivery_delayed':
      // Don't change status, just log
      return {}

    case 'email.sent':
      // Already handled at send time
      return {}

    default:
      return {}
  }
}
