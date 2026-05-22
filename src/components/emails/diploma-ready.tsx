import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'
import { EmailHeader } from './email-header'

interface DiplomaReadyEmailProps {
  studentName?: string
  courseName?: string
  pngUrl?: string
  courseUrl?: string
}

export default function DiplomaReadyEmail({
  studentName = 'Lorenzo Musetti',
  courseName = 'Uruguay en vinos',
  pngUrl = 'https://placehold.co/1200x800.png',
  courseUrl = 'https://academy.tinta.wine/student',
}: DiplomaReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Tu diploma de {courseName} está listo!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            <Heading style={styles.title}>¡Tu diploma está listo!</Heading>

            <Text style={styles.text}>
              Hola <strong>{studentName}</strong>,
            </Text>
            <Text style={styles.text}>
              ¡Felicitaciones por completar <strong>{courseName}</strong>! Nos
              alegra muchísimo haber compartido este camino con vos. Adjuntamos
              tu diploma de finalización.
            </Text>

            <Section style={styles.diplomaSection}>
              <Img
                src={pngUrl}
                width="560"
                height="auto"
                alt={`Diploma de ${studentName}`}
                style={styles.diplomaImage}
              />
            </Section>

            <Text style={styles.smallText}>
              Te lo adjuntamos en PDF y también podés verlo desde{' '}
              <Link href={courseUrl} style={styles.link}>
                tu panel de estudiante
              </Link>
              .
            </Text>

            <Hr style={styles.divider} />

            <Text style={styles.signOff}>
              Gabi Zimmer &amp; el equipo de Tinta Academy
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Tinta Academy - Centro de formación especializado en la educación
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
    maxWidth: '640px',
    padding: 0,
  },
  content: {
    padding: '32px',
  },
  title: {
    color: emailTheme.colors.primary,
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  },
  text: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 16px 0',
  },
  diplomaSection: {
    margin: '24px 0',
    textAlign: 'center' as const,
  },
  diplomaImage: {
    border: `1px solid ${emailTheme.colors.border}`,
    borderRadius: '6px',
    maxWidth: '100%',
    height: 'auto',
  },
  smallText: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '13px',
    lineHeight: '20px',
    margin: '0',
    textAlign: 'center' as const,
  },
  link: {
    color: emailTheme.colors.primary,
    textDecoration: 'underline',
  },
  divider: {
    borderColor: emailTheme.colors.border,
    margin: '24px 0',
  },
  signOff: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '24px',
    margin: '0',
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
