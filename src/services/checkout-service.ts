import { prisma } from '@/lib/prisma'
import { PaymentMethod, Currency, OrderStatus, EnrollmentStatus, Course, Coupon, BankAccount } from '@prisma/client'
import { createOrder, getOrderById, updateOrderStatus, setMercadoPagoPreference } from './order-service'
import { validateCoupon, ValidateCouponResult } from './coupon-service'
import { getActiveBankAccounts } from './bank-account-service'
import { createPreference } from './mercadopago-service'
import { createEnrollment } from './enrollment-service'
import {
  sendOrderConfirmationEmail,
  sendTransferInstructionsEmail,
  sendWsetDataReminderEmail,
  sendAdminPaymentNotificationEmail,
} from './email-service'

// ============================================
// TYPES
// ============================================

export type EnrollmentBlockReason =
  | 'already_enrolled'
  | 'course_full'
  | 'course_closed'
  | 'deadline_passed'

export interface Pricing {
  originalPriceUSD: number
  originalPriceUYU: number
  discountPercent: number
  discountAmountUSD: number
  discountAmountUYU: number
  finalPriceUSD: number
  finalPriceUYU: number
  isFree: boolean
}

export interface CheckoutContext {
  user: {
    id: string
    email: string
    name: string | null
  }
  course: Course & {
    educator: {
      id: string
      name: string
      imageUrl: string | null
    }
  }
  coupon: Coupon | null
  couponValidation: ValidateCouponResult | null
  bankAccounts: BankAccount[]
  pricing: Pricing
  canEnroll: boolean
  enrollmentBlockReason: EnrollmentBlockReason | null
}

// Default USD to UYU exchange rate (can be overridden by course.priceUYU)
const DEFAULT_USD_TO_UYU_RATE = 42

// Course type labels for emails
const courseTypeLabels: Record<string, string> = {
  wset: 'Curso WSET',
  taller: 'Taller',
  cata: 'Cata',
  curso: 'Curso',
}

// Payment method labels for emails
const paymentMethodLabels: Record<string, string> = {
  mercadopago: 'MercadoPago',
  bank_transfer: 'Transferencia Bancaria',
  free: 'Gratuito',
}

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date | null): string {
  if (!date) return 'Por confirmar'
  return date.toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getCourseLocation(course: Course): string {
  if (course.modality === 'online') return 'Online'
  return course.address || 'Por confirmar'
}

function calculatePricing(
  priceUSD: number,
  priceUYU: number | null,
  discountPercent: number
): Pricing {
  const originalPriceUSD = priceUSD
  const originalPriceUYU = priceUYU ?? Math.round(priceUSD * DEFAULT_USD_TO_UYU_RATE)

  const discountAmountUSD = Math.round((originalPriceUSD * discountPercent / 100) * 100) / 100
  const discountAmountUYU = Math.round(originalPriceUYU * discountPercent / 100)

  const finalPriceUSD = Math.round((originalPriceUSD - discountAmountUSD) * 100) / 100
  const finalPriceUYU = Math.round(originalPriceUYU - discountAmountUYU)

  return {
    originalPriceUSD,
    originalPriceUYU,
    discountPercent,
    discountAmountUSD,
    discountAmountUYU,
    finalPriceUSD,
    finalPriceUYU,
    isFree: finalPriceUSD === 0,
  }
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Get checkout context for a user and course
 * Includes all information needed to render checkout page
 */
export async function getCheckoutContext(
  userId: string,
  courseId: string,
  couponCode?: string
): Promise<CheckoutContext> {
  // Fetch user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Fetch course with educator
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      educator: {
        select: { id: true, name: true, imageUrl: true },
      },
    },
  })

  if (!course) {
    throw new Error('Curso no encontrado')
  }

  // Check enrollment eligibility
  let canEnroll = true
  let enrollmentBlockReason: EnrollmentBlockReason | null = null

  // Check if already enrolled
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (student) {
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId,
        },
      },
    })

    if (existingEnrollment && existingEnrollment.status !== EnrollmentStatus.cancelled) {
      canEnroll = false
      enrollmentBlockReason = 'already_enrolled'
    }
  }

  // Check course capacity
  if (canEnroll && course.maxCapacity && course.enrolledCount >= course.maxCapacity) {
    canEnroll = false
    enrollmentBlockReason = 'course_full'
  }

  // Check if course is enrollable (status)
  if (canEnroll && !['announced', 'enrolling', 'available'].includes(course.status)) {
    canEnroll = false
    enrollmentBlockReason = 'course_closed'
  }

  // Check registration deadline
  if (canEnroll && course.registrationDeadline && new Date() > course.registrationDeadline) {
    canEnroll = false
    enrollmentBlockReason = 'deadline_passed'
  }

  // Validate coupon if provided
  let coupon: Coupon | null = null
  let couponValidation: ValidateCouponResult | null = null

  if (couponCode) {
    couponValidation = await validateCoupon(
      couponCode,
      user.email,
      courseId,
      course.priceUSD
    )
    if (couponValidation.valid && couponValidation.coupon) {
      coupon = couponValidation.coupon
    }
  }

  // Get bank accounts
  const bankAccounts = await getActiveBankAccounts()

  // Calculate pricing
  const discountPercent = coupon ? couponValidation!.discountPercent! : 0
  const pricing = calculatePricing(course.priceUSD, course.priceUYU, discountPercent)

  return {
    user,
    course,
    coupon,
    couponValidation,
    bankAccounts,
    pricing,
    canEnroll,
    enrollmentBlockReason,
  }
}

/**
 * Initiate checkout by creating an order
 */
export async function initiateCheckout(
  userId: string,
  courseId: string,
  paymentMethod: PaymentMethod,
  currency: Currency,
  couponCode?: string
): Promise<{ order: Awaited<ReturnType<typeof getOrderById>>; context: CheckoutContext }> {
  // Get checkout context (validates eligibility)
  const context = await getCheckoutContext(userId, courseId, couponCode)

  if (!context.canEnroll) {
    throw new Error(`No puedes inscribirte: ${context.enrollmentBlockReason}`)
  }

  // Determine final amount based on currency
  const finalAmount = currency === Currency.UYU
    ? context.pricing.finalPriceUYU
    : context.pricing.finalPriceUSD

  // Create the order
  const order = await createOrder({
    userId,
    courseId,
    paymentMethod,
    currency,
    couponId: context.coupon?.id,
    originalPriceUSD: context.pricing.originalPriceUSD,
    originalPriceUYU: context.pricing.originalPriceUYU,
    discountPercent: context.pricing.discountPercent,
    discountAmount: currency === Currency.UYU
      ? context.pricing.discountAmountUYU
      : context.pricing.discountAmountUSD,
    finalAmount,
  })

  return { order, context }
}

/**
 * Process checkout with MercadoPago
 * Creates MP preference and returns redirect URL
 */
export async function processCheckoutMercadoPago(
  orderId: string
): Promise<{ order: Awaited<ReturnType<typeof getOrderById>>; redirectUrl: string }> {
  const order = await getOrderById(orderId)

  if (!order) {
    throw new Error('Orden no encontrada')
  }

  if (order.paymentMethod !== PaymentMethod.mercadopago) {
    throw new Error('Esta orden no es de MercadoPago')
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Create MercadoPago preference
  const { preferenceId, initPoint } = await createPreference({
    orderId: order.id,
    courseId: order.courseId,
    courseTitle: order.course.title,
    amount: order.finalAmount, // Already in UYU
    userEmail: order.user.email,
    userName: order.user.name || undefined,
    successUrl: `${appUrl}/checkout/success/${order.id}`,
    failureUrl: `${appUrl}/checkout/${order.courseId}?error=payment_failed`,
    pendingUrl: `${appUrl}/checkout/success/${order.id}?pending=true`,
    webhookUrl: `${appUrl}/api/webhooks/mercadopago`,
  })

  // Save preference ID to order
  await setMercadoPagoPreference(orderId, preferenceId)

  // Update status to pending_payment
  await updateOrderStatus(orderId, OrderStatus.pending_payment)

  const updatedOrder = await getOrderById(orderId)

  return {
    order: updatedOrder,
    redirectUrl: initPoint,
  }
}

/**
 * Process checkout with bank transfer
 * Sets order to pending_payment status
 */
export async function processCheckoutBankTransfer(
  orderId: string,
  bankAccountId: string
): Promise<Awaited<ReturnType<typeof getOrderById>>> {
  const order = await getOrderById(orderId)

  if (!order) {
    throw new Error('Orden no encontrada')
  }

  if (order.paymentMethod !== PaymentMethod.bank_transfer) {
    throw new Error('Esta orden no es de transferencia bancaria')
  }

  // Update order with bank account and pending status
  await updateOrderStatus(orderId, OrderStatus.pending_payment, {
    bankAccountId,
  })

  // Get bank accounts for email
  const bankAccounts = await getActiveBankAccounts()
  const usdBankAccounts = bankAccounts.filter((ba) => ba.currency === 'USD')

  // Send transfer instructions email (async, don't wait)
  sendTransferInstructionsEmail({
    to: order.user.email,
    customerName: order.user.name || 'Estudiante',
    orderNumber: order.orderNumber,
    courseName: order.course.title,
    amount: order.finalAmount.toFixed(2),
    bankAccounts: usdBankAccounts.map((ba) => ({
      bankName: ba.bankName,
      accountHolder: ba.accountHolder,
      accountType: ba.accountType,
      accountNumber: ba.accountNumber,
      currency: ba.currency,
      swiftCode: ba.swiftCode,
    })),
  }).catch((error) => {
    console.error('Error sending transfer instructions email:', error)
  })

  return getOrderById(orderId)
}

/**
 * Process free enrollment (price=0 or 100% coupon)
 * Creates order and enrollment immediately
 */
export async function processFreeEnrollment(
  userId: string,
  courseId: string,
  couponCode?: string
): Promise<{
  order: Awaited<ReturnType<typeof getOrderById>>
  enrollment: Awaited<ReturnType<typeof createEnrollment>>
  isNewStudent: boolean
}> {
  const { order, context } = await initiateCheckout(
    userId,
    courseId,
    PaymentMethod.free,
    Currency.USD,
    couponCode
  )

  if (!context.pricing.isFree) {
    throw new Error('Este curso no es gratuito')
  }

  // Complete the checkout
  const result = await completeCheckout(order!.id)

  return result
}

/**
 * Complete checkout after payment confirmation
 * Creates student if needed, enrollment, assigns role, increments coupon
 */
export async function completeCheckout(orderId: string): Promise<{
  order: Awaited<ReturnType<typeof getOrderById>>
  enrollment: Awaited<ReturnType<typeof createEnrollment>>
  isNewStudent: boolean
}> {
  const order = await getOrderById(orderId)

  if (!order) {
    throw new Error('Orden no encontrada')
  }

  // Check if order is already paid
  if (order.status === OrderStatus.paid) {
    throw new Error('Esta orden ya fue procesada')
  }

  // Run everything in a transaction
  const result = await prisma.$transaction(async (tx) => {
    let isNewStudent = false
    let studentId: string

    // Check if user already has a student record
    const existingStudent = await tx.student.findUnique({
      where: { userId: order.userId },
    })

    if (existingStudent) {
      studentId = existingStudent.id
    } else {
      // Create student record
      const user = await tx.user.findUnique({
        where: { id: order.userId },
      })

      const newStudent = await tx.student.create({
        data: {
          userId: order.userId,
          firstName: user?.name?.split(' ')[0] || null,
          lastName: user?.name?.split(' ').slice(1).join(' ') || null,
        },
      })
      studentId = newStudent.id
      isNewStudent = true

      // Update user role to student if not already set
      if (!user?.role || user.role === 'student') {
        await tx.user.update({
          where: { id: order.userId },
          data: { role: 'student' },
        })
      }
    }

    // Update order status to paid
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.paid,
        paidAt: new Date(),
        studentId,
      },
    })

    // Create enrollment (confirmed status)
    const enrollment = await tx.enrollment.create({
      data: {
        studentId,
        courseId: order.courseId,
        status: EnrollmentStatus.confirmed,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
          },
        },
        course: {
          include: {
            educator: true,
            tags: true,
          },
        },
      },
    })

    // Update course enrolled count
    await tx.course.update({
      where: { id: order.courseId },
      data: {
        enrolledCount: { increment: 1 },
      },
    })

    // Increment coupon usage if used
    if (order.couponId) {
      await tx.coupon.update({
        where: { id: order.couponId },
        data: {
          currentUses: { increment: 1 },
        },
      })
    }

    return { enrollment, isNewStudent }
  })

  // Increment coupon usage outside transaction (we already did it inside)
  // This is handled above

  const updatedOrder = await getOrderById(orderId)

  // Send confirmation email (async, don't wait)
  if (updatedOrder) {
    const course = updatedOrder.course
    const courseType = courseTypeLabels[course.type] || 'Curso'
    const wsetLevel = course.wsetLevel ? `WSET Nivel ${course.wsetLevel}` : ''

    sendOrderConfirmationEmail({
      to: updatedOrder.user.email,
      customerName: updatedOrder.user.name || 'Estudiante',
      orderNumber: updatedOrder.orderNumber,
      courseName: course.title,
      courseType: wsetLevel || courseType,
      educatorName: course.educator.name,
      startDate: formatDate(course.startDate),
      location: getCourseLocation(course),
      paymentMethod: paymentMethodLabels[updatedOrder.paymentMethod] || updatedOrder.paymentMethod,
      amount: updatedOrder.finalAmount.toFixed(2),
      currency: updatedOrder.currency,
      courseId: course.id,
    }).catch((error) => {
      console.error('Error sending order confirmation email:', error)
    })

    // Send WSET data reminder if course is WSET and profile is incomplete
    if (course.type === 'wset' && result.enrollment.student) {
      const student = result.enrollment.student
      const profileIncomplete =
        !student.firstName ||
        !student.lastName ||
        !student.dateOfBirth ||
        !student.identityDocument

      if (profileIncomplete) {
        sendWsetDataReminderEmail({
          to: updatedOrder.user.email,
          customerName: updatedOrder.user.name || 'Estudiante',
          courseName: course.title,
          courseLevel: course.wsetLevel?.toString() || '1',
        }).catch((error) => {
          console.error('Error sending WSET data reminder email:', error)
        })
      }
    }

    // Send payment notification to admins
    const admins = await prisma.user.findMany({
      where: { role: 'superadmin' },
      select: { email: true },
    })
    const adminEmails = admins.map((a) => a.email)

    if (adminEmails.length > 0) {
      sendAdminPaymentNotificationEmail({
        adminEmails,
        buyerName: updatedOrder.user.name || 'Sin nombre',
        buyerEmail: updatedOrder.user.email,
        courseName: course.title,
        amount: updatedOrder.finalAmount.toFixed(2),
        currency: updatedOrder.currency,
        paymentMethod: paymentMethodLabels[updatedOrder.paymentMethod] || updatedOrder.paymentMethod,
        orderNumber: updatedOrder.orderNumber,
        couponCode: updatedOrder.coupon?.code || null,
        couponDiscount: updatedOrder.coupon?.discountPercent || null,
      }).catch((error) => {
        console.error('Error sending admin payment notification:', error)
      })
    }
  }

  return {
    order: updatedOrder,
    enrollment: result.enrollment,
    isNewStudent: result.isNewStudent,
  }
}

/**
 * Check if user has existing enrollment for a course
 */
export async function hasExistingEnrollment(
  userId: string,
  courseId: string
): Promise<boolean> {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  })

  if (!student) return false

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId,
      },
    },
  })

  return enrollment !== null && enrollment.status !== EnrollmentStatus.cancelled
}

/**
 * Check if user has pending order for a course
 */
export async function getPendingOrderForCourse(
  userId: string,
  courseId: string
): Promise<Awaited<ReturnType<typeof getOrderById>> | null> {
  const order = await prisma.order.findFirst({
    where: {
      userId,
      courseId,
      status: {
        in: [OrderStatus.created, OrderStatus.pending_payment, OrderStatus.payment_processing],
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!order) return null

  return getOrderById(order.id)
}
