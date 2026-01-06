import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'

interface OtpEmailProps {
  otp: string
}

export default function OtpEmail({ otp }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu código de verificación: {otp}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.logo}>Tinta Academy</Heading>
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.title}>Código de verificación</Heading>
            <Text style={styles.text}>
              Usa el siguiente código para iniciar sesión en tu cuenta:
            </Text>

            <Section style={styles.codeContainer}>
              <Text style={styles.code}>{otp}</Text>
            </Section>

            <Text style={styles.text}>
              Este código expira en 10 minutos. Si no solicitaste este código,
              puedes ignorar este mensaje.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Tinta Academy - Centro de formación especializado en la educación sobre vinos
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
  header: {
    backgroundColor: emailTheme.colors.primary,
    borderRadius: `${emailTheme.borderRadius} ${emailTheme.borderRadius} 0 0`,
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  logo: {
    color: emailTheme.colors.primaryForeground,
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  content: {
    padding: '32px',
  },
  title: {
    color: emailTheme.colors.foreground,
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
  text: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
  codeContainer: {
    backgroundColor: emailTheme.colors.secondary,
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '24px',
    textAlign: 'center' as const,
  },
  code: {
    color: emailTheme.colors.primary,
    fontFamily: emailTheme.fonts.mono,
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '8px',
    margin: 0,
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
