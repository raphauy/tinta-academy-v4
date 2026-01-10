import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'
import { EmailHeader } from './email-header'

interface AdminPaymentNotificationEmailProps {
  buyerName?: string
  buyerEmail?: string
  courseName?: string
  amount?: string
  currency?: string
  paymentMethod?: string
  orderNumber?: string
  couponCode?: string | null
  couponDiscount?: number | null
  adminUrl?: string
}

export default function AdminPaymentNotificationEmail({
  buyerName = 'María García',
  buyerEmail = 'maria.garcia@example.com',
  courseName = 'WSET Level 2 Award in Wines',
  amount = '350.00',
  currency = 'USD',
  paymentMethod = 'MercadoPago',
  orderNumber = 'TA-20260110-0006',
  couponCode = null,
  couponDiscount = null,
  adminUrl = 'https://academy.tinta.wine/admin/orders',
}: AdminPaymentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Pago recibido - {buyerName} - {currency} {amount}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            {/* Success Badge */}
            <Section style={styles.successBadge}>
              <Text style={styles.checkmark}>$</Text>
            </Section>

            <Heading style={styles.title}>¡Pago recibido!</Heading>

            <Text style={styles.text}>
              <strong>{buyerName}</strong> (
              <Link href={`mailto:${buyerEmail}`} style={styles.link}>
                {buyerEmail}
              </Link>
              ) ha realizado un pago vía <strong>{paymentMethod}</strong>.
            </Text>

            {/* Amount Box */}
            <Section style={styles.amountBox}>
              <Text style={styles.amountLabel}>Monto recibido</Text>
              <Text style={styles.amount}>
                {currency} {amount}
              </Text>
            </Section>

            {/* Details Box */}
            <Section style={styles.detailsBox}>
              <Text style={styles.detailRow}>
                <strong>Orden:</strong> {orderNumber}
              </Text>
              <Hr style={styles.detailDivider} />
              <Text style={styles.detailRow}>
                <strong>Curso:</strong> {courseName}
              </Text>
              {couponCode && (
                <>
                  <Hr style={styles.detailDivider} />
                  <Text style={styles.detailRow}>
                    <strong>Cupón aplicado:</strong> {couponCode} (-
                    {couponDiscount}%)
                  </Text>
                </>
              )}
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={adminUrl}>
                Ver en Dashboard
              </Button>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Este es un email automático de Tinta Academy
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: emailTheme.colors.muted,
    fontFamily: emailTheme.fonts.sans,
    margin: 0,
    padding: '40px 0',
  },
  container: {
    backgroundColor: emailTheme.colors.background,
    borderRadius: emailTheme.borderRadius,
    margin: '0 auto',
    maxWidth: '480px',
    padding: 0,
  },
  content: {
    padding: '32px',
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: '50%',
    height: '56px',
    width: '56px',
    margin: '0 auto 16px auto',
  },
  checkmark: {
    color: '#16a34a',
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    textAlign: 'center' as const,
    lineHeight: '56px',
  },
  title: {
    color: emailTheme.colors.foreground,
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 20px 0',
    textAlign: 'center' as const,
  },
  text: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
  link: {
    color: emailTheme.colors.primary,
    textDecoration: 'underline',
  },
  amountBox: {
    backgroundColor: 'rgba(20, 63, 59, 0.75)', // primary con 75% opacidad
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '20px',
    textAlign: 'center' as const,
  },
  amountLabel: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '500',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    opacity: 0.85,
  },
  amount: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
  },
  detailsBox: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '16px',
  },
  detailRow: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    margin: '8px 0',
  },
  detailDivider: {
    borderColor: emailTheme.colors.border,
    margin: '12px 0',
  },
  buttonContainer: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  button: {
    backgroundColor: emailTheme.colors.primary,
    borderRadius: emailTheme.borderRadius,
    color: emailTheme.colors.primaryForeground,
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: '600',
    padding: '12px 24px',
    textDecoration: 'none',
  },
  footer: {
    borderTop: `1px solid ${emailTheme.colors.border}`,
    padding: '20px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '11px',
    margin: 0,
  },
}
