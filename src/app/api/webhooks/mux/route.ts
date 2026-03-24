import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  handleUploadAssetCreated,
  handleAssetReady,
  handleAssetErrored,
} from '@/services/mux-service'

// ============================================
// TYPES
// ============================================

interface MuxWebhookPayload {
  type: string
  data: Record<string, unknown>
  object: {
    type: string
    id: string
  }
}

// ============================================
// LOGGING HELPER
// ============================================

function logWebhook(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, unknown>
) {
  const timestamp = new Date().toISOString()
  const logData = {
    service: 'mux-webhook',
    timestamp,
    message,
    ...data,
  }

  if (level === 'error') {
    console.error(JSON.stringify(logData))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logData))
  } else {
    console.log(JSON.stringify(logData))
  }
}

// ============================================
// SIGNATURE VERIFICATION
// ============================================

function verifyMuxSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.MUX_WEBHOOK_SECRET
  if (!secret) {
    logWebhook('error', 'MUX_WEBHOOK_SECRET not configured')
    return false
  }

  if (!signatureHeader) {
    return false
  }

  // Mux sends: t=<timestamp>,v1=<signature>
  const elements = signatureHeader.split(',')
  const timestamp = elements
    .find((e) => e.startsWith('t='))
    ?.substring(2)
  const signature = elements
    .find((e) => e.startsWith('v1='))
    ?.substring(3)

  if (!timestamp || !signature) {
    return false
  }

  // Verify timestamp is within 5 minutes
  const timestampMs = parseInt(timestamp) * 1000
  const now = Date.now()
  if (Math.abs(now - timestampMs) > 5 * 60 * 1000) {
    logWebhook('warn', 'Webhook timestamp too old', {
      webhookTimestamp: timestamp,
      now: Math.floor(now / 1000).toString(),
    })
    return false
  }

  // Compute expected signature
  const payload = `${timestamp}.${rawBody}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// ============================================
// WEBHOOK HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const rawBody = await request.text()
    const signatureHeader = request.headers.get('mux-signature')

    // Verify signature
    if (!verifyMuxSignature(rawBody, signatureHeader)) {
      logWebhook('error', 'Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    let payload: MuxWebhookPayload
    try {
      payload = JSON.parse(rawBody) as MuxWebhookPayload
    } catch {
      logWebhook('error', 'Invalid JSON payload')
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    logWebhook('info', 'Webhook received', {
      type: payload.type,
      objectType: payload.object?.type,
      objectId: payload.object?.id,
    })

    // Route to handlers
    switch (payload.type) {
      case 'video.upload.asset_created': {
        const uploadId = payload.object?.id
        const assetId = payload.data?.asset_id as string | undefined
        if (uploadId && assetId) {
          await handleUploadAssetCreated({
            upload_id: uploadId,
            asset_id: assetId,
          })
          logWebhook('info', 'Upload asset created', { uploadId, assetId })
        }
        break
      }

      case 'video.asset.ready': {
        const assetId = payload.object?.id
        if (assetId) {
          await handleAssetReady({
            id: assetId,
            playback_ids: payload.data?.playback_ids as Array<{
              id: string
              policy: string
            }> | undefined,
            duration: payload.data?.duration as number | undefined,
          })
          logWebhook('info', 'Asset ready', { assetId })
        }
        break
      }

      case 'video.asset.errored': {
        const assetId = payload.object?.id
        if (assetId) {
          await handleAssetErrored({ id: assetId })
          logWebhook('error', 'Asset errored', { assetId })
        }
        break
      }

      default:
        logWebhook('info', 'Unhandled event type, ignoring', {
          type: payload.type,
        })
    }

    const duration = Date.now() - startTime
    logWebhook('info', 'Webhook processed', { duration: `${duration}ms` })

    return NextResponse.json({ received: true })
  } catch (error) {
    const duration = Date.now() - startTime
    logWebhook('error', 'Webhook handler error', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Return 200 to prevent Mux from retrying on internal errors
    return NextResponse.json({ received: true, error: 'Internal error' })
  }
}

// ============================================
// GET METHOD (health check)
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'mux-webhook',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
