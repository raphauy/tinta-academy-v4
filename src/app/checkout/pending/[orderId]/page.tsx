import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getOrderById } from '@/services/order-service'
import { getActiveBankAccounts } from '@/services/bank-account-service'
import { PendingTransferPage } from '@/components/checkout/pending-transfer-page'

interface PageProps {
  params: Promise<{ orderId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { orderId } = await params
  const order = await getOrderById(orderId)

  return {
    title: order
      ? `Pendiente de Pago - ${order.course.title}`
      : 'Pendiente de Pago',
    description: 'Completa tu transferencia bancaria para confirmar tu inscripcion',
  }
}

export default async function CheckoutPendingPage({ params }: PageProps) {
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

  // Redirect if order is not pending payment
  if (order.status === 'paid') {
    redirect(`/checkout/success/${orderId}`)
  }

  // If not bank transfer or not pending, redirect to student dashboard
  if (order.paymentMethod !== 'bank_transfer' || order.status === 'cancelled') {
    redirect('/student')
  }

  // Fetch active bank accounts
  const bankAccounts = await getActiveBankAccounts()

  // Transform order data for component
  const orderData = {
    id: order.id,
    orderNumber: order.orderNumber,
    finalAmount: order.finalAmount,
    currency: order.currency,
    transferReference: order.transferReference,
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

  // Transform bank accounts for component
  const bankAccountsData = bankAccounts.map((account) => ({
    id: account.id,
    bankName: account.bankName,
    accountHolder: account.accountHolder,
    accountType: account.accountType,
    accountNumber: account.accountNumber,
    currency: account.currency,
  }))

  return (
    <PendingTransferPage order={orderData} bankAccounts={bankAccountsData} />
  )
}
