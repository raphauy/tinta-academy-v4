import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import crypto from 'crypto'

// ============================================
// CONFIG
// ============================================

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
const isSandbox = process.env.MERCADOPAGO_SANDBOX !== 'false'

function getMercadoPagoClient() {
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurado')
  }
  return new MercadoPagoConfig({ accessToken })
}

// ============================================
// TYPES
// ============================================

export interface CreatePreferenceInput {
  orderId: string
  courseId: string
  courseTitle: string
  amount: number // in UYU
  userEmail: string
  userName?: string
  successUrl: string
  failureUrl: string
  pendingUrl: string
  webhookUrl: string
}

export interface PreferenceResult {
  preferenceId: string
  initPoint: string
}

export interface PaymentInfo {
  id: number
  status: string
  statusDetail: string | null
  externalReference: string | null
  preferenceId: string | null
  transactionAmount: number | null
  orderId: string | null
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Create a MercadoPago preference for checkout
 * Returns the preferenceId and initPoint URL for redirect
 */
export async function createPreference(
  input: CreatePreferenceInput
): Promise<PreferenceResult> {
  const client = getMercadoPagoClient()
  const preference = new Preference(client)

  const preferenceResponse = await preference.create({
    body: {
      items: [
        {
          id: input.courseId,
          title: input.courseTitle,
          quantity: 1,
          unit_price: input.amount,
          currency_id: 'UYU',
        },
      ],
      external_reference: input.orderId,
      metadata: {
        order_id: input.orderId,
      },
      payer: {
        email: input.userEmail,
        name: input.userName,
      },
      back_urls: {
        success: input.successUrl,
        failure: input.failureUrl,
        pending: input.pendingUrl,
      },
      notification_url: input.webhookUrl,
      auto_return: 'approved',
    },
  })

  if (!preferenceResponse.id) {
    throw new Error('No se pudo crear la preferencia de MercadoPago')
  }

  // Use sandbox or production init_point based on environment
  const initPoint = isSandbox
    ? preferenceResponse.sandbox_init_point
    : preferenceResponse.init_point

  if (!initPoint) {
    throw new Error('No se obtuvo la URL de pago de MercadoPago')
  }

  return {
    preferenceId: preferenceResponse.id,
    initPoint,
  }
}

/**
 * Get payment details from MercadoPago by payment ID
 */
export async function getPayment(paymentId: string | number): Promise<PaymentInfo> {
  const client = getMercadoPagoClient()
  const payment = new Payment(client)

  const paymentResponse = await payment.get({ id: Number(paymentId) })

  return {
    id: paymentResponse.id || 0,
    status: paymentResponse.status || 'unknown',
    statusDetail: paymentResponse.status_detail || null,
    externalReference: paymentResponse.external_reference || null,
    preferenceId: null, // MP doesn't return preference_id in payment response
    transactionAmount: paymentResponse.transaction_amount || null,
    orderId: paymentResponse.metadata?.order_id || null,
  }
}

/**
 * Verify payment status and extract order information
 */
export async function verifyPaymentStatus(
  paymentId: string | number
): Promise<{
  status: string
  statusDetail: string | null
  orderId: string | null
  transactionAmount: number | null
}> {
  const paymentInfo = await getPayment(paymentId)

  return {
    status: paymentInfo.status,
    statusDetail: paymentInfo.statusDetail,
    orderId: paymentInfo.orderId || paymentInfo.externalReference,
    transactionAmount: paymentInfo.transactionAmount,
  }
}

// Maximum age for webhook timestamps (5 minutes)
const WEBHOOK_MAX_AGE_MS = 5 * 60 * 1000

/**
 * Validate MercadoPago webhook signature
 *
 * MercadoPago sends signatures in the format:
 * x-signature: ts=timestamp,v1=hash
 *
 * The hash is calculated as HMAC-SHA256 of:
 * id:{data.id};request-id:{x-request-id};ts:{timestamp};
 *
 * Security measures:
 * - Validates HMAC signature to ensure authenticity
 * - Checks timestamp to prevent replay attacks (max 5 min old)
 * - Uses timing-safe comparison to prevent timing attacks
 */
export function validateWebhookSignature(
  dataId: string,
  xSignature: string | null,
  xRequestId: string | null
): boolean {
  if (!webhookSecret) {
    console.warn('MERCADOPAGO_WEBHOOK_SECRET no está configurado, omitiendo validación')
    return true // Allow in development without secret
  }

  if (!xSignature || !xRequestId) {
    console.error('Missing signature headers')
    return false
  }

  // Parse x-signature header
  const signatureParts: Record<string, string> = {}
  xSignature.split(',').forEach((part) => {
    const [key, value] = part.split('=')
    if (key && value) {
      signatureParts[key.trim()] = value.trim()
    }
  })

  const timestamp = signatureParts['ts']
  const receivedHash = signatureParts['v1']

  if (!timestamp || !receivedHash) {
    console.error('Invalid signature format')
    return false
  }

  // Verify timestamp is recent (prevent replay attacks)
  const webhookTime = parseInt(timestamp, 10) * 1000 // MP sends seconds, convert to ms
  const now = Date.now()
  const age = now - webhookTime

  if (isNaN(webhookTime) || age > WEBHOOK_MAX_AGE_MS || age < -60000) {
    // Allow 1 minute clock skew in the future
    console.error(`Webhook timestamp too old or invalid: ${age}ms ago`)
    return false
  }

  // Build the manifest string
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${timestamp};`

  // Calculate expected hash
  const expectedHash = crypto
    .createHmac('sha256', webhookSecret)
    .update(manifest)
    .digest('hex')

  // Compare hashes using timing-safe comparison
  // CRITICAL: Check buffer lengths first to avoid timingSafeEqual crash
  const receivedBuffer = Buffer.from(receivedHash)
  const expectedBuffer = Buffer.from(expectedHash)

  if (receivedBuffer.length !== expectedBuffer.length) {
    console.error('Hash length mismatch - possible tampering')
    return false
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
}

/**
 * Check if the service is properly configured
 */
export function isMercadoPagoConfigured(): boolean {
  return !!accessToken
}

/**
 * Get current environment mode
 */
export function getMercadoPagoMode(): 'sandbox' | 'production' {
  return isSandbox ? 'sandbox' : 'production'
}
