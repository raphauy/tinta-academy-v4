'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { getOrderById, cancelOrder } from '@/services/order-service'

type ActionResult = { success: true } | { success: false; error: string }

/**
 * Cancel an order (student can only cancel their own orders)
 * Only works for orders that are not already paid/refunded/cancelled
 */
export async function cancelMyOrderAction(orderId: string): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'No autenticado' }
  }

  if (!orderId) {
    return { success: false, error: 'ID de orden requerido' }
  }

  try {
    const order = await getOrderById(orderId)

    if (!order) {
      return { success: false, error: 'Orden no encontrada' }
    }

    // Verify the order belongs to the current user
    if (order.userId !== session.user.id) {
      return { success: false, error: 'No tienes permiso para cancelar esta orden' }
    }

    if (order.status === 'paid') {
      return { success: false, error: 'No se puede cancelar una orden ya pagada' }
    }

    if (order.status === 'cancelled') {
      return { success: false, error: 'Esta orden ya está cancelada' }
    }

    if (order.status === 'refunded') {
      return { success: false, error: 'Esta orden ya fue reembolsada' }
    }

    await cancelOrder(orderId, session.user.id)

    revalidatePath('/student/orders')

    return { success: true }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cancelar la orden',
    }
  }
}
