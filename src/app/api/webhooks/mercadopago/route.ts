import { NextRequest, NextResponse } from 'next/server'
import { OrderStatus } from '@prisma/client'

import { validateWebhookSignature, getPayment } from '@/services/mercadopago-service'
import { getOrderById, getOrderByMpPaymentId, getOrderByMpPreferenceId, updateOrderStatus } from '@/services/order-service'
import { completeCheckout } from '@/services/checkout-service'

// ============================================
// TYPES
// ============================================

interface MercadoPagoWebhookPayload {
  id: number
  live_mode: boolean
  type: string
  date_created: string
  user_id: number
  api_version: string
  action: string
  data: {
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
    service: 'mercadopago-webhook',
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
// WEBHOOK HANDLER
// ============================================

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get headers for signature validation
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    // Get raw body
    const rawBody = await request.text()
    let payload: MercadoPagoWebhookPayload

    try {
      payload = JSON.parse(rawBody) as MercadoPagoWebhookPayload
    } catch {
      logWebhook('error', 'Invalid JSON payload', { rawBody: rawBody.substring(0, 500) })
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }

    logWebhook('info', 'Webhook received', {
      type: payload.type,
      action: payload.action,
      dataId: payload.data?.id,
      requestId: xRequestId,
    })

    // Validate signature
    const dataId = payload.data?.id
    if (!dataId) {
      logWebhook('error', 'Missing data.id in payload')
      return NextResponse.json(
        { error: 'Missing data.id' },
        { status: 400 }
      )
    }

    const isValidSignature = validateWebhookSignature(dataId, xSignature, xRequestId)

    if (!isValidSignature) {
      logWebhook('error', 'Invalid webhook signature', {
        dataId,
        requestId: xRequestId,
        hasSignature: !!xSignature,
      })
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Only process payment notifications
    if (payload.type !== 'payment') {
      logWebhook('info', 'Non-payment webhook, ignoring', { type: payload.type })
      return NextResponse.json({ received: true, type: payload.type })
    }

    // Fetch payment details from MercadoPago
    let paymentInfo
    try {
      paymentInfo = await getPayment(dataId)
    } catch (error) {
      logWebhook('error', 'Failed to fetch payment from MercadoPago', {
        paymentId: dataId,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      // Return 200 to prevent MP retries on transient errors
      return NextResponse.json({
        received: true,
        error: 'Failed to fetch payment',
      })
    }

    logWebhook('info', 'Payment fetched', {
      paymentId: paymentInfo.id,
      status: paymentInfo.status,
      statusDetail: paymentInfo.statusDetail,
      externalReference: paymentInfo.externalReference,
      orderId: paymentInfo.orderId,
    })

    // Find order by various methods
    let order = null

    // Try orderId from metadata first
    if (paymentInfo.orderId) {
      order = await getOrderById(paymentInfo.orderId)
    }

    // Try external_reference (also orderId)
    if (!order && paymentInfo.externalReference) {
      order = await getOrderById(paymentInfo.externalReference)
    }

    // Try mpPaymentId
    if (!order) {
      order = await getOrderByMpPaymentId(String(paymentInfo.id))
    }

    // Try mpPreferenceId if available
    if (!order && paymentInfo.preferenceId) {
      order = await getOrderByMpPreferenceId(paymentInfo.preferenceId)
    }

    if (!order) {
      logWebhook('error', 'Order not found for payment', {
        paymentId: paymentInfo.id,
        externalReference: paymentInfo.externalReference,
        orderId: paymentInfo.orderId,
      })
      // Return 200 to prevent MP retries - order may have been deleted
      return NextResponse.json({
        received: true,
        error: 'Order not found',
      })
    }

    logWebhook('info', 'Order found', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      paymentStatus: paymentInfo.status,
    })

    // Check if order was already processed
    if (order.status === OrderStatus.paid) {
      logWebhook('info', 'Order already paid, skipping', { orderId: order.id })
      return NextResponse.json({
        received: true,
        orderId: order.id,
        status: 'already_processed',
      })
    }

    // Save MP payment info to order
    await updateOrderStatus(order.id, order.status, {
      mpPaymentId: String(paymentInfo.id),
      mpStatus: paymentInfo.status,
      mpStatusDetail: paymentInfo.statusDetail || undefined,
    })

    // Process based on payment status
    let result: {
      processed: boolean
      newStatus?: string
      enrolled?: boolean
      error?: string
    } = { processed: false }

    switch (paymentInfo.status) {
      case 'approved': {
        try {
          // Complete checkout - creates student, enrollment, etc.
          const checkoutResult = await completeCheckout(order.id)
          result = {
            processed: true,
            newStatus: 'paid',
            enrolled: true,
          }
          logWebhook('info', 'Checkout completed successfully', {
            orderId: order.id,
            isNewStudent: checkoutResult.isNewStudent,
            enrollmentId: checkoutResult.enrollment.id,
          })

          // TODO: Send confirmation email (6.22)
          // await sendOrderConfirmationEmail(checkoutResult.order)
        } catch (error) {
          logWebhook('error', 'Failed to complete checkout', {
            orderId: order.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          result = {
            processed: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        }
        break
      }

      case 'rejected': {
        await updateOrderStatus(order.id, OrderStatus.rejected)
        result = { processed: true, newStatus: 'rejected' }
        logWebhook('info', 'Payment rejected', {
          orderId: order.id,
          statusDetail: paymentInfo.statusDetail,
        })

        // TODO: Send rejection email (6.22)
        // await sendPaymentRejectedEmail(order, paymentInfo.statusDetail)
        break
      }

      case 'pending':
      case 'in_process': {
        await updateOrderStatus(order.id, OrderStatus.payment_processing)
        result = { processed: true, newStatus: 'payment_processing' }
        logWebhook('info', 'Payment pending/processing', {
          orderId: order.id,
          status: paymentInfo.status,
        })
        break
      }

      case 'cancelled': {
        await updateOrderStatus(order.id, OrderStatus.cancelled, {
          cancelledAt: new Date(),
        })
        result = { processed: true, newStatus: 'cancelled' }
        logWebhook('info', 'Payment cancelled', { orderId: order.id })
        break
      }

      case 'refunded': {
        await updateOrderStatus(order.id, OrderStatus.refunded, {
          refundedAt: new Date(),
        })
        result = { processed: true, newStatus: 'refunded' }
        logWebhook('info', 'Payment refunded', { orderId: order.id })
        break
      }

      default: {
        logWebhook('warn', 'Unknown payment status', {
          orderId: order.id,
          status: paymentInfo.status,
        })
        result = { processed: false, error: `Unknown status: ${paymentInfo.status}` }
      }
    }

    const duration = Date.now() - startTime
    logWebhook('info', 'Webhook processed', {
      orderId: order.id,
      duration: `${duration}ms`,
      result,
    })

    return NextResponse.json({
      received: true,
      orderId: order.id,
      ...result,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logWebhook('error', 'Webhook handler error', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Return 200 to prevent MP from retrying on internal errors
    // This prevents infinite retry loops on bugs
    return NextResponse.json({
      received: true,
      error: 'Internal server error',
    })
  }
}

// ============================================
// HEAD METHOD (for MP health checks)
// ============================================

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

// ============================================
// GET METHOD (for testing/debugging)
// ============================================

export async function GET() {
  return NextResponse.json({
    service: 'mercadopago-webhook',
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}
