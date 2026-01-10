import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'
import { EmailHeader } from './email-header'

interface WsetDataReminderEmailProps {
  customerName?: string
  courseName?: string
  courseLevel?: string
  profileUrl?: string
}

export default function WsetDataReminderEmail({
  customerName = 'María García',
  courseName = 'WSET Level 2 Award in Wines',
  courseLevel = '2',
  profileUrl = 'https://academy.tinta.wine/student/profile',
}: WsetDataReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Completa tus datos para tu curso WSET {courseLevel}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            <Section style={styles.wsetBadge}>
              <Text style={styles.wsetIcon}>WSET</Text>
            </Section>

            <Heading style={styles.title}>Completa tus datos</Heading>
            <Text style={styles.text}>Hola {customerName},</Text>
            <Text style={styles.text}>
              Te has inscrito en <strong>{courseName}</strong> que es un curso
              certificado por WSET (Wine & Spirit Education Trust).
            </Text>

            <Section style={styles.importantBox}>
              <Heading as="h3" style={styles.importantTitle}>
                ¿Por que es importante?
              </Heading>
              <Text style={styles.importantText}>
                Para poder registrarte en el examen oficial de WSET y obtener tu
                certificacion internacional, necesitamos algunos datos
                personales adicionales que deben coincidir exactamente con tu
                documento de identidad.
              </Text>
            </Section>

            <Section style={styles.dataList}>
              <Heading as="h3" style={styles.dataListTitle}>
                Datos requeridos:
              </Heading>
              <Text style={styles.dataItem}>• Nombre completo (tal como aparece en tu documento)</Text>
              <Text style={styles.dataItem}>• Fecha de nacimiento</Text>
              <Text style={styles.dataItem}>• Numero de documento de identidad</Text>
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={profileUrl}>
                Completar mis datos
              </Button>
            </Section>

            <Text style={styles.deadline}>
              <strong>Importante:</strong> Debes completar estos datos antes del
              inicio del curso para asegurar tu registro en WSET.
            </Text>

            <Text style={styles.smallText}>
              Si tienes alguna pregunta sobre los requisitos de WSET, no dudes
              en contactarnos respondiendo a este email.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Tinta Academy - Centro de formacion especializado en la educacion
              sobre vinos
            </Text>
            <Text style={styles.footerText}>
              Approved Programme Provider de WSET
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
  wsetBadge: {
    backgroundColor: '#7c2d12',
    borderRadius: emailTheme.borderRadius,
    margin: '0 auto 16px auto',
    padding: '8px 16px',
    width: 'fit-content',
  },
  wsetIcon: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '2px',
    margin: 0,
    textAlign: 'center' as const,
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
  importantBox: {
    backgroundColor: '#fef3c7',
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '20px',
  },
  importantTitle: {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  importantText: {
    color: '#92400e',
    fontSize: '13px',
    lineHeight: '22px',
    margin: 0,
  },
  dataList: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    margin: '24px 0',
    padding: '20px',
  },
  dataListTitle: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  dataItem: {
    color: emailTheme.colors.foreground,
    fontSize: '13px',
    lineHeight: '24px',
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
  deadline: {
    backgroundColor: '#fef2f2',
    borderRadius: emailTheme.borderRadius,
    color: '#991b1b',
    fontSize: '13px',
    lineHeight: '20px',
    margin: '24px 0',
    padding: '12px 16px',
    textAlign: 'center' as const,
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
    margin: '0 0 4px 0',
  },
}
