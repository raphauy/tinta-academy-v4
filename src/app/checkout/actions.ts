'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import { PaymentMethod, Currency } from '@prisma/client'
import {
  getCheckoutContext,
  initiateCheckout,
  processCheckoutMercadoPago,
  processCheckoutBankTransfer,
  processFreeEnrollment,
  type CheckoutContext,
} from '@/services/checkout-service'
import { validateCoupon, type ValidateCouponResult } from '@/services/coupon-service'
import { getOrderById, markTransferAsSent } from '@/services/order-service'
import { getCourseById } from '@/services/course-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getAuthenticatedUser(): Promise<
  { error: string } | { user: { id: string; email: string } }
> {
  const session = await auth()

  if (!session?.user?.id || !session?.user?.email) {
    return { error: 'Debes iniciar sesión para continuar' }
  }

  return { user: { id: session.user.id, email: session.user.email } }
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const initiateCheckoutSchema = z.object({
  courseId: z.string().min(1, 'ID de curso requerido'),
  paymentMethod: z.enum(['mercadopago', 'bank_transfer', 'free']),
  currency: z.enum(['USD', 'UYU']),
  couponCode: z.string().optional(),
  bankAccountId: z.string().optional(),
})

const markTransferSentSchema = z.object({
  orderId: z.string().min(1, 'ID de orden requerido'),
  reference: z.string().optional(),
})

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get checkout context for a course
 * Returns all information needed to render checkout page
 */
export async function getCheckoutContextAction(
  courseId: string,
  couponCode?: string
): Promise<ActionResult<CheckoutContext>> {
  const authResult = await getAuthenticatedUser()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const context = await getCheckoutContext(
      authResult.user.id,
      courseId,
      couponCode
    )

    return { success: true, data: context }
  } catch (error) {
    console.error('Error getting checkout context:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cargar el checkout',
    }
  }
}

/**
 * Apply a coupon code and validate it
 */
export async function applyCouponAction(
  courseId: string,
  couponCode: string
): Promise<ActionResult<ValidateCouponResult>> {
  const authResult = await getAuthenticatedUser()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!couponCode.trim()) {
    return { success: false, error: 'Ingresa un código de cupón' }
  }

  try {
    // Get course price for validation
    const course = await getCourseById(courseId)

    if (!course) {
      return { success: false, error: 'Curso no encontrado' }
    }

    const result = await validateCoupon(
      couponCode.trim().toUpperCase(),
      authResult.user.email,
      courseId,
      course.priceUSD
    )

    // Return success even if coupon is invalid (so UI can show specific error)
    return { success: true, data: result }
  } catch (error) {
    console.error('Error validating coupon:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al validar el cupón',
    }
  }
}

/**
 * Initiate checkout process
 * Creates order and returns redirect URL or order ID depending on payment method
 */
export async function initiateCheckoutAction(
  courseId: string,
  paymentMethod: 'mercadopago' | 'bank_transfer' | 'free',
  currency: 'USD' | 'UYU',
  couponCode?: string,
  bankAccountId?: string
): Promise<ActionResult<{ orderId: string; redirectUrl?: string }>> {
  const authResult = await getAuthenticatedUser()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  // Validate input
  const validated = initiateCheckoutSchema.safeParse({
    courseId,
    paymentMethod,
    currency,
    couponCode,
    bankAccountId,
  })

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    const method = validated.data.paymentMethod as PaymentMethod
    const curr = validated.data.currency as Currency

    // Handle free enrollment
    if (method === PaymentMethod.free) {
      const result = await processFreeEnrollment(
        authResult.user.id,
        courseId,
        couponCode
      )

      return {
        success: true,
        data: { orderId: result.order!.id },
      }
    }

    // Create order
    const { order } = await initiateCheckout(
      authResult.user.id,
      courseId,
      method,
      curr,
      couponCode
    )

    if (!order) {
      return { success: false, error: 'Error al crear la orden' }
    }

    // Process based on payment method
    if (method === PaymentMethod.mercadopago) {
      const mpResult = await processCheckoutMercadoPago(order.id)
      return {
        success: true,
        data: {
          orderId: mpResult.order!.id,
          redirectUrl: mpResult.redirectUrl,
        },
      }
    }

    if (method === PaymentMethod.bank_transfer) {
      if (!bankAccountId) {
        return { success: false, error: 'Selecciona una cuenta bancaria' }
      }

      await processCheckoutBankTransfer(order.id, bankAccountId)
      return {
        success: true,
        data: { orderId: order.id },
      }
    }

    return { success: false, error: 'Método de pago no válido' }
  } catch (error) {
    console.error('Error initiating checkout:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar el checkout',
    }
  }
}

/**
 * Mark a bank transfer as sent
 * User calls this after making the transfer to notify admin
 */
export async function markTransferSentAction(
  orderId: string,
  reference?: string
): Promise<ActionResult> {
  const authResult = await getAuthenticatedUser()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  // Validate input
  const validated = markTransferSentSchema.safeParse({ orderId, reference })

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    // Verify order belongs to user
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.userId !== authResult.user.id) {
      return { success: false, error: 'No tienes acceso a esta orden' }
    }

    if (order.paymentMethod !== 'bank_transfer') {
      return { success: false, error: 'Esta orden no es de transferencia bancaria' }
    }

    if (order.status !== 'pending_payment') {
      return { success: false, error: 'Esta orden no está pendiente de pago' }
    }

    await markTransferAsSent(orderId, reference)

    return { success: true }
  } catch (error) {
    console.error('Error marking transfer as sent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al marcar la transferencia',
    }
  }
}

/**
 * Get order status and details
 * Used to display order status on success/pending pages
 */
export async function getOrderStatusAction(
  orderId: string
): Promise<ActionResult<{
  status: string
  orderNumber: string
  courseName: string
  amount: number
  currency: string
  paymentMethod: string
  paidAt: Date | null
}>> {
  const authResult = await getAuthenticatedUser()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    // Only allow owner or admin to view order
    if (order.userId !== authResult.user.id) {
      return { success: false, error: 'No tienes acceso a esta orden' }
    }

    return {
      success: true,
      data: {
        status: order.status,
        orderNumber: order.orderNumber,
        courseName: order.course.title,
        amount: order.finalAmount,
        currency: order.currency,
        paymentMethod: order.paymentMethod,
        paidAt: order.paidAt,
      },
    }
  } catch (error) {
    console.error('Error getting order status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el estado de la orden',
    }
  }
}
