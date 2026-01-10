'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Order } from '@prisma/client'
import { AdminOrders } from '@/components/admin/admin-orders'
import { OrderDetailDialog } from '@/components/admin/order-detail-dialog'
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog'
import { confirmTransferPaymentAction } from './actions'

type OrderWithRelations = Order & {
  user: { id: string; email: string; name: string | null }
  course: { id: string; title: string }
  coupon?: { id: string; code: string; discountPercent: number } | null
}

interface AdminOrdersClientProps {
  orders: OrderWithRelations[]
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<OrderWithRelations | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleViewDetails = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setSelectedOrder(order)
      setIsDetailOpen(true)
    }
  }

  const handleMarkAsPaid = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setOrderToConfirm(order)
      setIsConfirmOpen(true)
    }
  }

  const handleMarkAsPaidFromDialog = async (orderId: string) => {
    const result = await confirmTransferPaymentAction(orderId)
    if (result.success) {
      toast.success('Pago confirmado correctamente')
      setIsDetailOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  const handleConfirmPayment = async () => {
    if (!orderToConfirm) return

    const result = await confirmTransferPaymentAction(orderToConfirm.id)
    if (result.success) {
      toast.success('Pago confirmado correctamente')
      setOrderToConfirm(null)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <AdminOrders
        orders={orders}
        onViewDetails={handleViewDetails}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <OrderDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        order={selectedOrder}
        onMarkAsPaid={handleMarkAsPaidFromDialog}
      />

      <ConfirmationDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Confirmar pago"
        description={
          orderToConfirm
            ? `¿Confirmar que se recibio el pago de la orden ${orderToConfirm.orderNumber}? Esto creara la inscripcion del estudiante al curso.`
            : ''
        }
        confirmLabel="Confirmar pago"
        onConfirm={handleConfirmPayment}
      />
    </>
  )
}
