import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOrderById } from '@/services/order-service'
import { getStudentByUserId } from '@/services/student-service'
import { SuccessPage } from '@/components/checkout/success-page'

interface PageProps {
  params: Promise<{ orderId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { orderId } = await params
  const order = await getOrderById(orderId)

  return {
    title: order
      ? `Compra Confirmada - ${order.course.title}`
      : 'Compra Confirmada',
    description: 'Tu inscripcion ha sido procesada exitosamente',
  }
}

/**
 * Check if student profile is incomplete for WSET courses
 * WSET requires: firstName, lastName, dateOfBirth, identityDocument
 */
function isWsetProfileIncomplete(student: {
  firstName: string | null
  lastName: string | null
  dateOfBirth: Date | null
  identityDocument: string | null
} | null): boolean {
  if (!student) return true

  return (
    !student.firstName ||
    !student.lastName ||
    !student.dateOfBirth ||
    !student.identityDocument
  )
}

export default async function CheckoutSuccessPage({ params }: PageProps) {
  const { orderId } = await params
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch order
  const order = await getOrderById(orderId)

  // Return 404 if order not found
  if (!order) {
    notFound()
  }

  // Verify user owns this order
  if (order.userId !== session.user.id) {
    redirect('/student')
  }

  // Redirect if order is not paid
  if (order.status !== 'paid') {
    // If pending payment, redirect to pending page
    if (order.status === 'pending_payment') {
      redirect(`/checkout/pending/${orderId}`)
    }
    // Otherwise redirect to student dashboard
    redirect('/student')
  }

  // Check if WSET course and profile incomplete
  const isWsetCourse = order.course.type === 'wset'
  let showDataBanner = false

  if (isWsetCourse) {
    const student = await getStudentByUserId(session.user.id)
    showDataBanner = isWsetProfileIncomplete(student)
  }

  // Transform order data for component
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    finalAmount: order.finalAmount,
    currency: order.currency,
    paymentMethod: order.paymentMethod,
    paidAt: order.paidAt,
    course: {
      id: order.course.id,
      title: order.course.title,
      type: order.course.type,
      wsetLevel: order.course.wsetLevel,
      imageUrl: order.course.imageUrl,
      startDate: order.course.startDate,
      duration: order.course.duration,
      location: order.course.location,
      modality: order.course.modality,
      educator: {
        name: order.course.educator?.name ?? null,
      },
    },
  }

  return <SuccessPage order={orderData} showDataBanner={showDataBanner} />
}
