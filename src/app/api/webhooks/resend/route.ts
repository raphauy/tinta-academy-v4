import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import {
  processResendWebhookEvent,
  type ResendWebhookEvent
} from '@/services/email-tracking-service'

const webhookSecret = process.env.RESEND_WEBHOOK_SECRET

/**
 * POST /api/webhooks/resend
 *
 * Receives webhook events from Resend for email tracking:
 * - email.delivered
 * - email.opened
 * - email.clicked
 * - email.bounced
 * - email.complained
 */
export async function POST(request: NextRequest) {
  // Verify webhook secret is configured
  if (!webhookSecret) {
    console.error('[Resend Webhook] RESEND_WEBHOOK_SECRET is not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  try {
    // Get the raw body and headers for signature verification
    const body = await request.text()
    const svixId = request.headers.get('svix-id')
    const svixTimestamp = request.headers.get('svix-timestamp')
    const svixSignature = request.headers.get('svix-signature')

    // Verify all required headers are present
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('[Resend Webhook] Missing svix headers')
      return NextResponse.json(
        { error: 'Missing webhook signature headers' },
        { status: 400 }
      )
    }

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret)
    let event: ResendWebhookEvent

    try {
      event = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature
      }) as ResendWebhookEvent
    } catch (verifyError) {
      console.error('[Resend Webhook] Signature verification failed:', verifyError)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // Log the received event for debugging
    console.log(`[Resend Webhook] Received event: ${event.type}`, {
      emailId: event.data.email_id,
      to: event.data.to
    })

    // Process the webhook event
    const result = await processResendWebhookEvent(event)

    if (result.processed) {
      console.log(`[Resend Webhook] Processed ${event.type} for ${result.target}`)
    } else {
      console.log(`[Resend Webhook] Email ${event.data.email_id} not found in our records`)
    }

    return NextResponse.json({ received: true, processed: result.processed })
  } catch (error) {
    console.error('[Resend Webhook] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
