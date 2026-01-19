import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'
import { EmailHeader } from './email-header'

export interface DynamicEmailProps {
  subject: string
  body: string // HTML content
  previewText?: string
  profileUrl?: string
}

export default function DynamicEmail({
  subject = 'Email de Tinta Academy',
  body = '<p>Contenido del email</p>',
  previewText,
  profileUrl = 'https://academy.tinta.wine/student/profile',
}: DynamicEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText || subject}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            {/* Render HTML body content */}
            <div
              style={styles.bodyContent}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Tinta Academy - Centro de formación especializado en la educación
              sobre vinos
            </Text>
            <Text style={styles.unsubscribeText}>
              Puedes modificar tus preferencias de comunicación en{' '}
              <a href={profileUrl} style={styles.unsubscribeLink}>
                tu perfil
              </a>
              .
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
    maxWidth: '600px',
    padding: 0,
  },
  content: {
    padding: '32px',
  },
  bodyContent: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '24px',
  },
  footer: {
    borderTop: `1px solid ${emailTheme.colors.border}`,
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '12px',
    margin: '0 0 8px 0',
  },
  unsubscribeText: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '11px',
    margin: 0,
  },
  unsubscribeLink: {
    color: emailTheme.colors.primary,
    textDecoration: 'underline',
  },
}
