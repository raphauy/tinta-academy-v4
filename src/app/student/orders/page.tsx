import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getOrdersByUserId } from '@/services/order-service'
import { StudentOrdersClient } from './student-orders-client'
import { StudentOrdersListSkeleton } from '@/components/student/skeletons'

export const metadata = {
  title: 'Mis Órdenes - Tinta Academy',
  description: 'Historial de órdenes y compras',
}

interface StudentOrdersPageProps {
  searchParams: Promise<{ viewAs?: string }>
}

async function OrdersContent({ viewAs }: { viewAs: string | undefined }) {
  const result = await resolveStudentForPage(viewAs)

  if (!result.authorized) {
    if (result.reason === 'no_student_selected') {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecciona un estudiante del selector de arriba para ver sus órdenes.
          </p>
        </div>
      )
    }
    redirect('/')
  }

  const { student } = result

  // Get orders for the student's user
  const orders = await getOrdersByUserId(student.userId)

  // Transform for client component
  const ordersData = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    finalAmount: order.finalAmount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    status: order.status,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    course: {
      id: order.course.id,
      title: order.course.title,
      type: order.course.type,
      imageUrl: order.course.imageUrl,
    },
    cancelledBy: order.cancelledBy,
  }))

  return <StudentOrdersClient orders={ordersData} viewAs={viewAs} />
}

export default async function StudentOrdersPage({
  searchParams,
}: StudentOrdersPageProps) {
  const params = await searchParams

  return (
    <div className="container max-w-4xl py-8 px-4">
      <Suspense fallback={<StudentOrdersListSkeleton />}>
        <OrdersContent viewAs={params.viewAs} />
      </Suspense>
    </div>
  )
}
