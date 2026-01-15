'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Receipt, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderCard } from './order-card'

type OrderFilter = 'all' | 'pending' | 'paid' | 'cancelled'

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

interface StudentOrdersProps {
  orders: Order[]
  viewAs?: string
  onCancelOrder?: (orderId: string) => void
}

const filterTabs: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export function StudentOrders({ orders, viewAs, onCancelOrder }: StudentOrdersProps) {
  const [filter, setFilter] = useState<OrderFilter>('all')

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true
    if (filter === 'pending') {
      return ['created', 'pending_payment', 'payment_processing'].includes(
        order.status
      )
    }
    if (filter === 'paid') {
      return order.status === 'paid'
    }
    if (filter === 'cancelled') {
      return order.status === 'cancelled'
    }
    return true
  })

  const pendingCount = orders.filter((o) =>
    ['created', 'pending_payment', 'payment_processing'].includes(o.status)
  ).length
  const paidCount = orders.filter((o) => o.status === 'paid').length
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-verde-uva-100">
            <Receipt className="w-6 h-6 text-verde-uva-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mis Órdenes</h1>
            <p className="text-sm text-muted-foreground">
              {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'} en total
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      {orders.length > 0 && (
        <div className="flex gap-2">
          {filterTabs.map((tab) => {
            const count =
              tab.value === 'all'
                ? orders.length
                : tab.value === 'pending'
                  ? pendingCount
                  : tab.value === 'paid'
                    ? paidCount
                    : cancelledCount

            return (
              <Button
                key={tab.value}
                variant={filter === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(tab.value)}
                className={filter === tab.value ? 'bg-verde-uva-600 hover:bg-verde-uva-700' : ''}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                      filter === tab.value
                        ? 'bg-white/20'
                        : 'bg-muted'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              viewAs={viewAs}
              onCancel={onCancelOrder}
            />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No hay órdenes en este filtro</h3>
          <p className="text-sm text-muted-foreground">
            Prueba seleccionando otro filtro
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-1">No tienes órdenes todavía</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Explora nuestros cursos y realiza tu primera compra
          </p>
          <Button asChild>
            <Link href="/">Ver cursos disponibles</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
