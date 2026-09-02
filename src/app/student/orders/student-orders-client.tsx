'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { StudentOrders } from '@/components/student/student-orders'
import { ConfirmationDialog } from '@/components/admin/confirmation-dialog'
import { cancelMyOrderAction } from './actions'
import { formatAmountWithCurrency } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  finalAmount: number
  currency: string
  paymentMethod: string
  status: string
  createdAt: Date
  paidAt: Date | null
  course: {
    id: string
    title: string
    type: string
    imageUrl: string | null
  }
  cancelledBy?: { id: string; name: string | null; email: string } | null
}

interface StudentOrdersClientProps {
  orders: Order[]
  viewAs?: string
}

export function StudentOrdersClient({ orders, viewAs }: StudentOrdersClientProps) {
  const router = useRouter()
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)

  const handleCancelOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      setOrderToCancel(order)
      setIsCancelOpen(true)
    }
  }

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return

    const result = await cancelMyOrderAction(orderToCancel.id)
    if (result.success) {
      toast.success('Orden cancelada correctamente')
      setOrderToCancel(null)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <StudentOrders
        orders={orders}
        viewAs={viewAs}
        onCancelOrder={handleCancelOrder}
      />

      <ConfirmationDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        type="cancel"
        title="Cancelar orden"
        description={
          orderToCancel
            ? `¿Estás seguro de cancelar esta orden?\n\n• Orden: ${orderToCancel.orderNumber}\n• Curso: ${orderToCancel.course.title}\n• Monto: ${formatAmountWithCurrency(orderToCancel.finalAmount, orderToCancel.currency)}\n\nEsta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Cancelar orden"
        onConfirm={handleConfirmCancel}
      />
    </>
  )
}
