import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getOrders } from '@/services/order-service'
import { AdminOrdersClient } from './admin-orders-client'
import { AdminOrdersSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Ordenes - Admin',
}

async function OrdersContent() {
  const { orders } = await getOrders({ limit: 100 })

  return <AdminOrdersClient orders={orders} />
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<AdminOrdersSkeleton />}>
      <OrdersContent />
    </Suspense>
  )
}
