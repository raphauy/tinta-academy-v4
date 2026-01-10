import {
  Body,
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

interface BankAccountInfo {
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: string
  swiftCode?: string | null
}

interface TransferInstructionsEmailProps {
  customerName?: string
  orderNumber?: string
  courseName?: string
  amount?: string
  bankAccounts?: BankAccountInfo[]
}

const defaultBankAccounts: BankAccountInfo[] = [
  {
    bankName: 'Banco Santander',
    accountHolder: 'Tinta Wine Education S.A.',
    accountType: 'Cuenta Corriente',
    accountNumber: '001-123456-001',
    currency: 'USD',
    swiftCode: 'BABORUYK',
  },
  {
    bankName: 'Banco BBVA',
    accountHolder: 'Tinta Wine Education S.A.',
    accountType: 'Caja de Ahorro',
    accountNumber: '002-789012-002',
    currency: 'USD',
    swiftCode: null,
  },
]

export default function TransferInstructionsEmail({
  customerName = 'María García',
  orderNumber = 'TA-20260110-0002',
  courseName = 'WSET Level 2 Award in Wines',
  amount = '350.00',
  bankAccounts = defaultBankAccounts,
}: TransferInstructionsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Instrucciones de pago - Orden #{orderNumber}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            <Heading style={styles.title}>Instrucciones de pago</Heading>
            <Text style={styles.text}>Hola {customerName},</Text>
            <Text style={styles.text}>
              Gracias por tu inscripcion en <strong>{courseName}</strong>. Para
              completar tu compra, realiza una transferencia bancaria siguiendo
              las instrucciones a continuacion.
            </Text>

            <Section style={styles.amountBox}>
              <Text style={styles.amountLabel}>Monto a transferir</Text>
              <Text style={styles.amount}>USD {amount}</Text>
              <Text style={styles.orderRef}>Referencia: {orderNumber}</Text>
            </Section>

            <Heading as="h3" style={styles.subtitle}>
              Datos bancarios
            </Heading>

            {bankAccounts.map((account, index) => (
              <Section key={index} style={styles.bankBox}>
                <Text style={styles.bankName}>{account.bankName}</Text>
                <Hr style={styles.divider} />
                <Text style={styles.bankDetail}>
                  <span style={styles.bankLabel}>Titular:</span>{' '}
                  {account.accountHolder}
                </Text>
                <Text style={styles.bankDetail}>
                  <span style={styles.bankLabel}>Tipo de cuenta:</span>{' '}
                  {account.accountType}
                </Text>
                <Text style={styles.bankDetail}>
                  <span style={styles.bankLabel}>Numero de cuenta:</span>{' '}
                  {account.accountNumber}
                </Text>
                <Text style={styles.bankDetail}>
                  <span style={styles.bankLabel}>Moneda:</span>{' '}
                  {account.currency}
                </Text>
                {account.swiftCode && (
                  <Text style={styles.bankDetail}>
                    <span style={styles.bankLabel}>Codigo SWIFT:</span>{' '}
                    {account.swiftCode}
                  </Text>
                )}
              </Section>
            ))}

            <Section style={styles.instructionsBox}>
              <Heading as="h3" style={styles.instructionsTitle}>
                Pasos a seguir
              </Heading>
              <Text style={styles.instructionStep}>
                1. Realiza la transferencia a una de las cuentas indicadas
              </Text>
              <Text style={styles.instructionStep}>
                2. Incluye el numero de orden ({orderNumber}) como referencia
              </Text>
              <Text style={styles.instructionStep}>
                3. Responde a este email con el comprobante de transferencia
              </Text>
              <Text style={styles.instructionStep}>
                4. Verificaremos el pago en un plazo de 24-48 horas habiles
              </Text>
            </Section>

            <Section style={styles.warningBox}>
              <Text style={styles.warningText}>
                <strong>Importante:</strong> Tu lugar en el curso esta reservado
                por 72 horas. Si no recibimos el pago en ese plazo, la reserva
                podria ser cancelada.
              </Text>
            </Section>

            <Text style={styles.smallText}>
              Si tienes alguna pregunta, no dudes en contactarnos respondiendo a
              este email.
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
  amountBox: {
    backgroundColor: emailTheme.colors.primary,
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '24px',
    textAlign: 'center' as const,
  },
  amountLabel: {
    color: emailTheme.colors.primaryForeground,
    fontSize: '12px',
    fontWeight: '500',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    opacity: 0.8,
  },
  amount: {
    color: emailTheme.colors.primaryForeground,
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  orderRef: {
    color: emailTheme.colors.primaryForeground,
    fontSize: '12px',
    margin: 0,
    opacity: 0.8,
  },
  subtitle: {
    color: emailTheme.colors.foreground,
    fontSize: '16px',
    fontWeight: '600',
    margin: '24px 0 16px 0',
  },
  bankBox: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    margin: '0 0 16px 0',
    padding: '16px',
  },
  bankName: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  divider: {
    borderColor: emailTheme.colors.border,
    margin: '8px 0',
  },
  bankDetail: {
    color: emailTheme.colors.foreground,
    fontSize: '13px',
    margin: '6px 0',
  },
  bankLabel: {
    color: emailTheme.colors.mutedForeground,
  },
  instructionsBox: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '20px',
  },
  instructionsTitle: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  instructionStep: {
    color: emailTheme.colors.foreground,
    fontSize: '13px',
    lineHeight: '22px',
    margin: '8px 0',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '16px',
  },
  warningText: {
    color: '#92400e',
    fontSize: '13px',
    lineHeight: '20px',
    margin: 0,
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
