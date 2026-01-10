'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { OrderStatus, PaymentMethod, EnrollmentStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  getOrders,
  getOrderById,
  cancelOrder as cancelOrderService,
} from '@/services/order-service'
import { completeCheckout } from '@/services/checkout-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

export interface OrderFilters {
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  courseId?: string
  search?: string
  limit?: number
  offset?: number
}

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
 * Get paginated list of orders with optional filters
 */
export async function getOrdersAction(
  filters?: OrderFilters
): Promise<ActionResult<{ orders: Awaited<ReturnType<typeof getOrders>>['orders']; total: number }>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const result = await getOrders({
      status: filters?.status,
      paymentMethod: filters?.paymentMethod,
      courseId: filters?.courseId,
      limit: filters?.limit || 50,
      offset: filters?.offset || 0,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener las órdenes',
    }
  }
}

/**
 * Get full order details by ID
 */
export async function getOrderDetailAction(
  orderId: string
): Promise<ActionResult<Awaited<ReturnType<typeof getOrderById>>>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!orderId) {
    return { success: false, error: 'ID de orden requerido' }
  }

  try {
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error('Error fetching order detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el detalle de la orden',
    }
  }
}

/**
 * Confirm bank transfer payment and complete checkout
 * Creates student if needed, creates enrollment, updates order to paid
 */
export async function confirmTransferPaymentAction(
  orderId: string
): Promise<ActionResult<{ orderId: string; enrollmentId: string }>> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!orderId) {
    return { success: false, error: 'ID de orden requerido' }
  }

  try {
    // Get order to validate
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.paymentMethod !== 'bank_transfer') {
      return { success: false, error: 'Esta orden no es de transferencia bancaria' }
    }

    if (order.status === 'paid') {
      return { success: false, error: 'Esta orden ya fue pagada' }
    }

    if (order.status === 'cancelled' || order.status === 'refunded') {
      return { success: false, error: 'Esta orden está cancelada o reembolsada' }
    }

    // Complete checkout (creates student, enrollment, updates order)
    // Note: completeCheckout sends the order confirmation email automatically
    const result = await completeCheckout(orderId)

    revalidatePath('/admin/orders')
    revalidatePath('/admin')

    return {
      success: true,
      data: {
        orderId: result.order!.id,
        enrollmentId: result.enrollment.id,
      },
    }
  } catch (error) {
    console.error('Error confirming transfer payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al confirmar el pago',
    }
  }
}

/**
 * Cancel an order
 * Only works for orders that are not already paid/refunded
 */
export async function cancelOrderAction(
  orderId: string
): Promise<ActionResult> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!orderId) {
    return { success: false, error: 'ID de orden requerido' }
  }

  try {
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.status === 'paid') {
      return { success: false, error: 'No se puede cancelar una orden pagada. Usa reembolso.' }
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'Esta orden ya está cancelada' }
    }

    if (order.status === 'refunded') {
      return { success: false, error: 'Esta orden ya fue reembolsada' }
    }

    await cancelOrderService(orderId)

    revalidatePath('/admin/orders')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar la orden',
    }
  }
}

/**
 * Refund an order
 * Only works for paid orders
 * Cancels enrollment and decrements course enrolled count
 */
export async function refundOrderAction(
  orderId: string
): Promise<ActionResult> {
  const authResult = await requireAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!orderId) {
    return { success: false, error: 'ID de orden requerido' }
  }

  try {
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (order.status !== 'paid') {
      return { success: false, error: 'Solo se pueden reembolsar órdenes pagadas' }
    }

    // Run refund in transaction
    await prisma.$transaction(async (tx) => {
      // Mark order as refunded
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'refunded',
          refundedAt: new Date(),
        },
      })

      // Cancel enrollment if exists
      if (order.studentId) {
        const enrollment = await tx.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: order.studentId,
              courseId: order.courseId,
            },
          },
        })

        if (enrollment && enrollment.status === EnrollmentStatus.confirmed) {
          // Cancel enrollment
          await tx.enrollment.update({
            where: { id: enrollment.id },
            data: { status: EnrollmentStatus.cancelled },
          })

          // Decrement course enrolled count
          await tx.course.update({
            where: { id: order.courseId },
            data: {
              enrolledCount: { decrement: 1 },
            },
          })
        }
      }
    })

    revalidatePath('/admin/orders')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Error refunding order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reembolsar la orden',
    }
  }
}
