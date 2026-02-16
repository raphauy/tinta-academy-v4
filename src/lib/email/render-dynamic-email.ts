import { Resend } from 'resend'
import { render } from '@react-email/render'
import DynamicEmail, {
  type DynamicEmailProps,
} from '@/components/emails/dynamic-email'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.EMAIL_FROM || 'Tinta Academy <academy@tinta.wine>'

/**
 * Renders a dynamic email template to HTML string
 * Uses react-email render() to produce the final HTML
 */
export async function renderDynamicEmail(
  props: DynamicEmailProps
): Promise<string> {
  const html = await render(DynamicEmail(props))
  return html
}

/**
 * Sends a dynamic email using Resend
 * The body should already have variables replaced (use renderTemplate first)
 * Note: Emails are sent in all environments (including development) for testing
 */
export async function sendDynamicEmail(
  to: string,
  subject: string,
  body: string,
  previewText?: string
): Promise<{ success: boolean; error?: string }> {
  // Log in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log('\n========================================')
    console.log('  DYNAMIC EMAIL (sending)')
    console.log(`  To: ${to}`)
    console.log(`  Subject: ${subject}`)
    console.log(`  Preview: ${previewText || subject}`)
    console.log('========================================\n')
  }

  // Check for API key
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send')
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const html = await renderDynamicEmail({ subject, body, previewText })

    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    })

    return { success: true }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to send dynamic email:', errorMessage)
    return { success: false, error: errorMessage }
  }
}
