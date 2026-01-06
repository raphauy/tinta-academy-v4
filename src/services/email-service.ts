import { Resend } from 'resend'
import OtpEmail from '@/components/emails/otp-email'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  const fromEmail = process.env.EMAIL_FROM || 'academy@tinta.wine'

  await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Tu código de verificación de Tinta Academy',
    react: OtpEmail({ otp }),
  })
}
