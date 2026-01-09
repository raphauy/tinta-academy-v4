import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentMethod, Currency } from '@prisma/client'

// ============================================
// TYPES
// ============================================

export interface CreateOrderInput {
  userId: string
  courseId: string
  paymentMethod: PaymentMethod
  currency: Currency
  couponId?: string
  originalPriceUSD: number
  originalPriceUYU?: number
  discountPercent?: number
  discountAmount?: number
  finalAmount: number
}

export interface UpdateOrderStatusMetadata {
  mpPaymentId?: string
  mpStatus?: string
  mpStatusDetail?: string
  paidAt?: Date
  cancelledAt?: Date
  refundedAt?: Date
  studentId?: string
  bankAccountId?: string
  transferReference?: string
}

// Include all relations for full order details
const orderWithRelations = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
    },
  },
  course: {
    include: {
      educator: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
      tags: true,
    },
  },
  student: {
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  },
  coupon: true,
  bankAccount: true,
}

// ============================================
// HELPERS
// ============================================

/**
 * Generate order number in format TA-YYYYMMDD-XXXX
 * XXXX is a random 4-digit number for uniqueness
 */
export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `TA-${year}${month}${day}-${random}`
}

// ============================================
// QUERIES
// ============================================

export async function getOrderById(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: orderWithRelations,
  })
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: orderWithRelations,
  })
}

export async function getOrdersByUserId(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: orderWithRelations,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrdersByStatus(status: OrderStatus) {
  return prisma.order.findMany({
    where: { status },
    include: orderWithRelations,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderByMpPreferenceId(preferenceId: string) {
  return prisma.order.findFirst({
    where: { mpPreferenceId: preferenceId },
  })
}

export async function getOrderByMpPaymentId(paymentId: string) {
  return prisma.order.findFirst({
    where: { mpPaymentId: paymentId },
  })
}

/**
 * Get pending bank transfer orders for admin review
 */
export async function getPendingTransferOrders() {
  return prisma.order.findMany({
    where: {
      paymentMethod: 'bank_transfer',
      status: 'pending_payment',
    },
    include: orderWithRelations,
    orderBy: { createdAt: 'asc' }, // Oldest first for FIFO processing
  })
}

/**
 * Get all orders with optional filters for admin list
 */
export async function getOrders(filters?: {
  status?: OrderStatus
  paymentMethod?: PaymentMethod
  courseId?: string
  userId?: string
  limit?: number
  offset?: number
}) {
  const where = {
    ...(filters?.status && { status: filters.status }),
    ...(filters?.paymentMethod && { paymentMethod: filters.paymentMethod }),
    ...(filters?.courseId && { courseId: filters.courseId }),
    ...(filters?.userId && { userId: filters.userId }),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderWithRelations,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.order.count({ where }),
  ])

  return { orders, total }
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new order with generated order number
 */
export async function createOrder(input: CreateOrderInput) {
  // Generate unique order number
  let orderNumber = generateOrderNumber()
  let attempts = 0
  const maxAttempts = 5

  // Retry if order number collision (unlikely but possible)
  while (attempts < maxAttempts) {
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
    })
    if (!existing) break
    orderNumber = generateOrderNumber()
    attempts++
  }

  if (attempts >= maxAttempts) {
    throw new Error('No se pudo generar un número de orden único')
  }

  return prisma.order.create({
    data: {
      orderNumber,
      userId: input.userId,
      courseId: input.courseId,
      paymentMethod: input.paymentMethod,
      currency: input.currency,
      couponId: input.couponId,
      originalPriceUSD: input.originalPriceUSD,
      originalPriceUYU: input.originalPriceUYU,
      discountPercent: input.discountPercent || 0,
      discountAmount: input.discountAmount || 0,
      finalAmount: input.finalAmount,
      status: 'created',
    },
    include: orderWithRelations,
  })
}

/**
 * Update order status with optional metadata
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  metadata?: UpdateOrderStatusMetadata
) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(metadata?.mpPaymentId && { mpPaymentId: metadata.mpPaymentId }),
      ...(metadata?.mpStatus && { mpStatus: metadata.mpStatus }),
      ...(metadata?.mpStatusDetail && { mpStatusDetail: metadata.mpStatusDetail }),
      ...(metadata?.paidAt && { paidAt: metadata.paidAt }),
      ...(metadata?.cancelledAt && { cancelledAt: metadata.cancelledAt }),
      ...(metadata?.refundedAt && { refundedAt: metadata.refundedAt }),
      ...(metadata?.studentId && { studentId: metadata.studentId }),
      ...(metadata?.bankAccountId && { bankAccountId: metadata.bankAccountId }),
      ...(metadata?.transferReference && { transferReference: metadata.transferReference }),
    },
    include: orderWithRelations,
  })
}

/**
 * Set MercadoPago preference ID on order
 */
export async function setMercadoPagoPreference(orderId: string, preferenceId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { mpPreferenceId: preferenceId },
  })
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
    include: orderWithRelations,
  })
}

/**
 * Mark a bank transfer as sent by user
 */
export async function markTransferAsSent(
  orderId: string,
  reference?: string,
  proofUrl?: string
) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      ...(reference && { transferReference: reference }),
      ...(proofUrl && { transferProofUrl: proofUrl }),
    },
    include: orderWithRelations,
  })
}

/**
 * Link student to order after payment is confirmed
 */
export async function linkStudentToOrder(orderId: string, studentId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { studentId },
  })
}

/**
 * Mark order as paid with timestamp
 */
export async function markOrderAsPaid(orderId: string, studentId?: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'paid',
      paidAt: new Date(),
      ...(studentId && { studentId }),
    },
    include: orderWithRelations,
  })
}

/**
 * Mark order as refunded
 */
export async function refundOrder(orderId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'refunded',
      refundedAt: new Date(),
    },
    include: orderWithRelations,
  })
}

/**
 * Check if user has an existing order for a course
 */
export async function getUserOrderForCourse(userId: string, courseId: string) {
  return prisma.order.findFirst({
    where: {
      userId,
      courseId,
      status: {
        in: ['created', 'pending_payment', 'payment_processing', 'paid'],
      },
    },
    include: orderWithRelations,
  })
}
