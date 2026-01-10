import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'
import { EmailHeader } from './email-header'

interface PaymentRejectedEmailProps {
  customerName?: string
  orderNumber?: string
  courseName?: string
  courseType?: string
  amount?: string
  currency?: string
  reason?: string
  checkoutUrl?: string
}

export default function PaymentRejectedEmail({
  customerName = 'María García',
  orderNumber = 'TA-20260110-0004',
  courseName = 'WSET Level 2 Award in Wines',
  courseType = 'WSET Nivel 2',
  amount = '14700',
  currency = 'UYU',
  reason = 'Fondos insuficientes',
  checkoutUrl = 'https://academy.tinta.wine/checkout/wset-level-2',
}: PaymentRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Pago rechazado - Orden #{orderNumber}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            <Section style={styles.errorBadge}>
              <Text style={styles.errorIcon}>✕</Text>
            </Section>

            <Heading style={styles.title}>Pago rechazado</Heading>
            <Text style={styles.text}>Hola {customerName},</Text>
            <Text style={styles.text}>
              Lamentablemente tu pago no pudo ser procesado. No te preocupes, tu
              lugar en el curso sigue reservado y puedes intentar nuevamente.
            </Text>

            <Section style={styles.orderBox}>
              <Text style={styles.orderNumber}>Orden #{orderNumber}</Text>
              <Hr style={styles.divider} />
              <Text style={styles.courseTitle}>{courseName}</Text>
              <Text style={styles.courseDetail}>{courseType}</Text>
              <Hr style={styles.divider} />
              <Text style={styles.detailRow}>
                <span style={styles.detailLabel}>Monto:</span> {currency}{' '}
                {amount}
              </Text>
              <Text style={styles.detailRow}>
                <span style={styles.detailLabel}>Motivo del rechazo:</span>{' '}
                {reason}
              </Text>
            </Section>

            <Section style={styles.tipsBox}>
              <Heading as="h3" style={styles.tipsTitle}>
                Sugerencias para resolver el problema
              </Heading>
              <Text style={styles.tip}>
                • Verifica que los datos de tu tarjeta esten correctos
              </Text>
              <Text style={styles.tip}>
                • Asegurate de tener fondos suficientes
              </Text>
              <Text style={styles.tip}>
                • Contacta a tu banco si el problema persiste
              </Text>
              <Text style={styles.tip}>
                • Prueba con otro metodo de pago (transferencia bancaria)
              </Text>
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={checkoutUrl}>
                Intentar nuevamente
              </Button>
            </Section>

            <Text style={styles.smallText}>
              Si continuas teniendo problemas, contactanos respondiendo a este
              email y te ayudaremos a completar tu inscripcion.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Tinta Academy - Centro de formacion especializado en la educacion
              sobre vinos
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
    maxWidth: '520px',
    padding: 0,
  },
  content: {
    padding: '32px',
  },
  errorBadge: {
    backgroundColor: '#fef2f2',
    borderRadius: '50%',
    height: '64px',
    margin: '0 auto 16px auto',
    width: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIcon: {
    color: '#dc2626',
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    textAlign: 'center' as const,
    lineHeight: '64px',
  },
  title: {
    color: emailTheme.colors.foreground,
    fontSize: '24px',
    fontWeight: '600',
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  },
  text: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  orderBox: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '20px',
  },
  orderNumber: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '12px',
    fontWeight: '500',
    margin: '0 0 12px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  divider: {
    borderColor: emailTheme.colors.border,
    margin: '12px 0',
  },
  courseTitle: {
    color: emailTheme.colors.foreground,
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  courseDetail: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '14px',
    margin: 0,
  },
  detailRow: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    margin: '8px 0',
  },
  detailLabel: {
    color: emailTheme.colors.mutedForeground,
  },
  tipsBox: {
    backgroundColor: '#fef3c7',
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '20px',
  },
  tipsTitle: {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  tip: {
    color: '#92400e',
    fontSize: '13px',
    lineHeight: '22px',
    margin: '4px 0',
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
  smallText: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '12px',
    lineHeight: '20px',
    margin: '16px 0 0 0',
    textAlign: 'center' as const,
  },
  footer: {
    borderTop: `1px solid ${emailTheme.colors.border}`,
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '12px',
    margin: 0,
  },
}
