import { Resend } from 'resend'
import OtpEmail from '@/components/emails/otp-email'
import OrderConfirmationEmail from '@/components/emails/order-confirmation'
import TransferInstructionsEmail from '@/components/emails/transfer-instructions'
import PaymentRejectedEmail from '@/components/emails/payment-rejected'
import WsetDataReminderEmail from '@/components/emails/wset-data-reminder'
import AdminTransferNotificationEmail from '@/components/emails/admin-transfer-notification'
import AdminPaymentNotificationEmail from '@/components/emails/admin-payment-notification'
import DynamicEmail from '@/components/emails/dynamic-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.EMAIL_FROM || 'academy@tinta.wine'
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://academy.tinta.wine'

// Helper to check if we should actually send emails
function shouldSendEmail(): boolean {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return false
  }
  return true
}

// =============================================================================
// OTP Email
// =============================================================================

interface SendOtpEmailInput {
  to: string
  otp: string
}

export async function sendOtpEmail(input: SendOtpEmailInput): Promise<void> {
  const { to, otp } = input

  // In development, only log the OTP to console (don't send email)
  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log(`  OTP Code for ${to}: ${otp}`)
    console.log('========================================\n')
    return
  }

  // In production, send email
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return
  }

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Tu código de verificación de Tinta Academy',
    react: OtpEmail({ otp }),
  })
}

// =============================================================================
// Order Confirmation Email (for MercadoPago or Free enrollments)
// =============================================================================

interface SendOrderConfirmationEmailInput {
  to: string
  customerName: string
  orderNumber: string
  courseName: string
  courseType: string
  educatorName: string
  startDate: string
  location: string
  paymentMethod: string
  amount: string
  currency: string
  courseId: string
}

export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput
): Promise<void> {
  const {
    to,
    customerName,
    orderNumber,
    courseName,
    courseType,
    educatorName,
    startDate,
    location,
    paymentMethod,
    amount,
    currency,
    courseId,
  } = input

  const courseUrl = `${baseUrl}/student/courses/${courseId}`

  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  ORDER CONFIRMATION EMAIL')
    console.log(`  To: ${to}`)
    console.log(`  Order: ${orderNumber}`)
    console.log(`  Course: ${courseName}`)
    console.log(`  Amount: ${currency} ${amount}`)
    console.log(`  Course URL: ${courseUrl}`)
    console.log('========================================\n')
    return
  }

  if (!shouldSendEmail()) return

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Confirmación de inscripción - ${courseName}`,
    react: OrderConfirmationEmail({
      customerName,
      orderNumber,
      courseName,
      courseType,
      educatorName,
      startDate,
      location,
      paymentMethod,
      amount,
      currency,
      courseUrl,
    }),
  })
}

// =============================================================================
// Transfer Instructions Email (for bank transfer orders)
// =============================================================================

interface BankAccountForEmail {
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: string
  swiftCode?: string | null
}

interface SendTransferInstructionsEmailInput {
  to: string
  customerName: string
  orderNumber: string
  courseName: string
  amount: string
  bankAccounts: BankAccountForEmail[]
}

export async function sendTransferInstructionsEmail(
  input: SendTransferInstructionsEmailInput
): Promise<void> {
  const { to, customerName, orderNumber, courseName, amount, bankAccounts } =
    input

  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  TRANSFER INSTRUCTIONS EMAIL')
    console.log(`  To: ${to}`)
    console.log(`  Order: ${orderNumber}`)
    console.log(`  Course: ${courseName}`)
    console.log(`  Amount: USD ${amount}`)
    console.log(`  Bank accounts: ${bankAccounts.length}`)
    console.log('========================================\n')
    return
  }

  if (!shouldSendEmail()) return

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Instrucciones de pago - Orden #${orderNumber}`,
    react: TransferInstructionsEmail({
      customerName,
      orderNumber,
      courseName,
      amount,
      bankAccounts,
    }),
  })
}

// =============================================================================
// Payment Rejected Email (MercadoPago rejection)
// =============================================================================

interface SendPaymentRejectedEmailInput {
  to: string
  customerName: string
  orderNumber: string
  courseName: string
  courseType: string
  amount: string
  currency: string
  reason: string
  courseId: string
}

export async function sendPaymentRejectedEmail(
  input: SendPaymentRejectedEmailInput
): Promise<void> {
  const {
    to,
    customerName,
    orderNumber,
    courseName,
    courseType,
    amount,
    currency,
    reason,
    courseId,
  } = input

  const checkoutUrl = `${baseUrl}/checkout/${courseId}`

  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  PAYMENT REJECTED EMAIL')
    console.log(`  To: ${to}`)
    console.log(`  Order: ${orderNumber}`)
    console.log(`  Course: ${courseName}`)
    console.log(`  Reason: ${reason}`)
    console.log(`  Checkout URL: ${checkoutUrl}`)
    console.log('========================================\n')
    return
  }

  if (!shouldSendEmail()) return

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Pago rechazado - Orden #${orderNumber}`,
    react: PaymentRejectedEmail({
      customerName,
      orderNumber,
      courseName,
      courseType,
      amount,
      currency,
      reason,
      checkoutUrl,
    }),
  })
}

// =============================================================================
// WSET Data Reminder Email
// =============================================================================

interface SendWsetDataReminderEmailInput {
  to: string
  customerName: string
  courseName: string
  courseLevel: string
}

export async function sendWsetDataReminderEmail(
  input: SendWsetDataReminderEmailInput
): Promise<void> {
  const { to, customerName, courseName, courseLevel } = input

  const profileUrl = `${baseUrl}/student/profile`

  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  WSET DATA REMINDER EMAIL')
    console.log(`  To: ${to}`)
    console.log(`  Customer: ${customerName}`)
    console.log(`  Course: ${courseName}`)
    console.log(`  Level: ${courseLevel}`)
    console.log(`  Profile URL: ${profileUrl}`)
    console.log('========================================\n')
    return
  }

  if (!shouldSendEmail()) return

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: `Completa tus datos para tu curso WSET ${courseLevel}`,
    react: WsetDataReminderEmail({
      customerName,
      courseName,
      courseLevel,
      profileUrl,
    }),
  })
}

// =============================================================================
// Admin Transfer Notification Email
// =============================================================================

interface SendAdminTransferNotificationEmailInput {
  adminEmails: string[]
  buyerName: string
  buyerEmail: string
  courseName: string
  amount: string
  currency: string
  orderNumber: string
  transferReference?: string | null
  transferProofUrl?: string | null
  couponCode?: string | null
  couponDiscount?: number | null
}

export async function sendAdminTransferNotificationEmail(
  input: SendAdminTransferNotificationEmailInput
): Promise<void> {
  const {
    adminEmails,
    buyerName,
    buyerEmail,
    courseName,
    amount,
    currency,
    orderNumber,
    transferReference,
    transferProofUrl,
    couponCode,
    couponDiscount,
  } = input

  const adminUrl = `${baseUrl}/admin/orders`

  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  ADMIN TRANSFER NOTIFICATION EMAIL')
    console.log(`  To: ${adminEmails.join(', ')}`)
    console.log(`  Buyer: ${buyerName} (${buyerEmail})`)
    console.log(`  Course: ${courseName}`)
    console.log(`  Amount: ${currency} ${amount}`)
    console.log(`  Order: ${orderNumber}`)
    console.log(`  Reference: ${transferReference || 'N/A'}`)
    console.log(`  Proof URL: ${transferProofUrl || 'N/A'}`)
    console.log(`  Admin URL: ${adminUrl}`)
    console.log('========================================\n')
    return
  }

  if (!shouldSendEmail()) return

  // Send to all admin emails
  for (const adminEmail of adminEmails) {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Transferencia enviada - ${buyerName} - ${orderNumber}`,
      react: AdminTransferNotificationEmail({
        buyerName,
        buyerEmail,
        courseName,
        amount,
        currency,
        orderNumber,
        transferReference: transferReference || undefined,
        transferProofUrl: transferProofUrl || undefined,
        couponCode,
        couponDiscount,
        adminUrl,
      }),
    })
  }
}

// =============================================================================
// Admin Payment Notification Email
// =============================================================================

interface SendAdminPaymentNotificationEmailInput {
  adminEmails: string[]
  buyerName: string
  buyerEmail: string
  courseName: string
  amount: string
  currency: string
  paymentMethod: string
  orderNumber: string
  couponCode?: string | null
  couponDiscount?: number | null
}

export async function sendAdminPaymentNotificationEmail(
  input: SendAdminPaymentNotificationEmailInput
): Promise<void> {
  const {
    adminEmails,
    buyerName,
    buyerEmail,
    courseName,
    amount,
    currency,
    paymentMethod,
    orderNumber,
    couponCode,
    couponDiscount,
  } = input

  const adminUrl = `${baseUrl}/admin/orders`

  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  ADMIN PAYMENT NOTIFICATION EMAIL')
    console.log(`  To: ${adminEmails.join(', ')}`)
    console.log(`  Buyer: ${buyerName} (${buyerEmail})`)
    console.log(`  Course: ${courseName}`)
    console.log(`  Amount: ${currency} ${amount}`)
    console.log(`  Payment Method: ${paymentMethod}`)
    console.log(`  Order: ${orderNumber}`)
    console.log(`  Admin URL: ${adminUrl}`)
    console.log('========================================\n')
    return
  }

  if (!shouldSendEmail()) return

  // Send to all admin emails
  for (const adminEmail of adminEmails) {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Pago recibido - ${buyerName} - ${currency} ${amount}`,
      react: AdminPaymentNotificationEmail({
        buyerName,
        buyerEmail,
        courseName,
        amount,
        currency,
        paymentMethod,
        orderNumber,
        couponCode,
        couponDiscount,
        adminUrl,
      }),
    })
  }
}

// =============================================================================
// MP Status Detail to Spanish reason mapping
// =============================================================================

export function getMercadoPagoRejectionReason(statusDetail: string): string {
  const reasons: Record<string, string> = {
    cc_rejected_bad_filled_card_number: 'Numero de tarjeta incorrecto',
    cc_rejected_bad_filled_date: 'Fecha de vencimiento incorrecta',
    cc_rejected_bad_filled_other: 'Datos de la tarjeta incorrectos',
    cc_rejected_bad_filled_security_code: 'Codigo de seguridad incorrecto',
    cc_rejected_blacklist: 'Tarjeta no permitida',
    cc_rejected_call_for_authorize:
      'Debes autorizar el pago con tu banco',
    cc_rejected_card_disabled: 'Tarjeta deshabilitada',
    cc_rejected_card_error: 'Error en la tarjeta',
    cc_rejected_duplicated_payment: 'Pago duplicado',
    cc_rejected_high_risk: 'Pago rechazado por seguridad',
    cc_rejected_insufficient_amount: 'Fondos insuficientes',
    cc_rejected_invalid_installments: 'Cuotas no disponibles',
    cc_rejected_max_attempts: 'Demasiados intentos',
    cc_rejected_other_reason: 'Error en el procesamiento del pago',
    pending_contingency: 'Pago pendiente de revision',
    pending_review_manual: 'Pago pendiente de revision manual',
  }

  return reasons[statusDetail] || 'Error en el procesamiento del pago'
}

// =============================================================================
// Dynamic Email (for campaigns and workflows)
// =============================================================================

interface SendDynamicEmailInput {
  to: string
  subject: string
  body: string // HTML content with variables already replaced
}

export interface SendDynamicEmailResult {
  success: boolean
  resendId?: string
  error?: string
}

/**
 * Send a dynamic email using the DynamicEmail template
 * Returns the Resend message ID for tracking
 */
export async function sendDynamicEmail(
  input: SendDynamicEmailInput
): Promise<SendDynamicEmailResult> {
  const { to, subject, body } = input

  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  DYNAMIC EMAIL (Campaign/Workflow)')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Body preview: ${body.substring(0, 100)}...`)
    console.log('========================================\n')
  }

  if (!shouldSendEmail()) {
    return { success: false, error: 'Email sending is disabled' }
  }

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      react: DynamicEmail({ subject, body, profileUrl: `${baseUrl}/student/profile` }),
    })

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    return { success: true, resendId: result.data?.id }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return { success: false, error: errorMessage }
  }
}
