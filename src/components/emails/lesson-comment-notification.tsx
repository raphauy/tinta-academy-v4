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

interface LessonCommentNotificationEmailProps {
  educatorName?: string
  studentName?: string
  courseName?: string
  lessonName?: string
  commentBody?: string
  lessonUrl?: string
}

export default function LessonCommentNotificationEmail({
  educatorName = 'Gabi',
  studentName = 'María García',
  courseName = 'Introducción al Mundo del Vino',
  lessonName = 'Historia vitivinícola de Chile',
  commentBody = 'Excelente lección, me encantó la parte sobre los orígenes de la viticultura.',
  lessonUrl = 'https://academy.tinta.wine/learn/curso/leccion',
}: LessonCommentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Nuevo comentario de {studentName} en &quot;{lessonName}&quot;
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            <Heading style={styles.heading}>Nuevo comentario en tu curso</Heading>

            <Text style={styles.text}>
              Hola {educatorName},
            </Text>

            <Text style={styles.text}>
              <strong>{studentName}</strong> dejó un comentario en la lección{' '}
              <strong>&quot;{lessonName}&quot;</strong> del curso{' '}
              <strong>&quot;{courseName}&quot;</strong>.
            </Text>

            <Section style={styles.commentBox}>
              <Text style={styles.commentText}>
                &quot;{commentBody}&quot;
              </Text>
            </Section>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={lessonUrl}>
                Ver comentario
              </Button>
            </Section>
          </Section>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Tinta Academy — Formación especializada en vinos
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const styles = {
  body: {
    backgroundColor: emailTheme.colors.muted,
    fontFamily: emailTheme.fonts.sans,
    margin: '0',
    padding: '0',
  },
  container: {
    backgroundColor: emailTheme.colors.background,
    margin: '0 auto',
    maxWidth: '600px',
    borderRadius: emailTheme.borderRadius,
    overflow: 'hidden' as const,
  },
  content: {
    padding: '32px 40px',
  },
  heading: {
    color: emailTheme.colors.foreground,
    fontSize: '22px',
    fontWeight: '600' as const,
    margin: '0 0 24px',
    lineHeight: '1.3',
  },
  text: {
    color: emailTheme.colors.foreground,
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  commentBox: {
    backgroundColor: emailTheme.colors.muted,
    borderLeft: `3px solid ${emailTheme.colors.primary}`,
    borderRadius: '4px',
    padding: '16px 20px',
    margin: '16px 0 24px',
  },
  commentText: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '0',
    fontStyle: 'italic' as const,
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
    fontWeight: '600' as const,
    padding: '12px 32px',
    textDecoration: 'none',
  },
  hr: {
    borderColor: emailTheme.colors.border,
    margin: '0',
  },
  footer: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '12px',
    lineHeight: '1.5',
    padding: '24px 40px',
    textAlign: 'center' as const,
  },
}
