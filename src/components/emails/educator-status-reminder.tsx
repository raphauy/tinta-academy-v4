import {
  Body,
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

interface CourseForEmail {
  id: string
  title: string
  currentStatusLabel: string
  suggestedStatusLabel: string
  reason: string
}

interface EducatorStatusReminderEmailProps {
  educatorName?: string
  courses?: CourseForEmail[]
  baseUrl?: string
}

export default function EducatorStatusReminderEmail({
  educatorName = 'Educador',
  courses = [
    {
      id: 'clx123',
      title: 'Curso de Cata Avanzada',
      currentStatusLabel: 'Inscribiendo',
      suggestedStatusLabel: 'En curso',
      reason: 'La fecha de inicio (15 ene 2026) ya pasó',
    },
    {
      id: 'clx456',
      title: 'WSET Nivel 2',
      currentStatusLabel: 'Inscribiendo',
      suggestedStatusLabel: 'Completo',
      reason: 'Cupo lleno (20/20 estudiantes)',
    },
  ],
  baseUrl = 'https://academy.tinta.wine',
}: EducatorStatusReminderEmailProps) {
  const courseCount = courses.length
  const previewText = `Tienes ${courseCount} curso${courseCount !== 1 ? 's' : ''} que ${courseCount !== 1 ? 'requieren' : 'requiere'} tu atención`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            <Heading style={styles.title}>Cursos que requieren tu atención</Heading>

            <Text style={styles.greeting}>Hola {educatorName},</Text>

            <Text style={styles.text}>
              Tienes <strong>{courseCount}</strong> curso
              {courseCount !== 1 ? 's' : ''} que{' '}
              {courseCount !== 1 ? 'podrían necesitar' : 'podría necesitar'} un
              cambio de estado:
            </Text>

            {courses.map((course, index) => (
              <Section key={course.id} style={styles.courseCard}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Hr style={styles.cardDivider} />
                <Text style={styles.courseDetail}>
                  <strong>Estado actual:</strong> {course.currentStatusLabel}
                </Text>
                <Text style={styles.courseDetail}>
                  <strong>Sugerencia:</strong> Cambiar a &quot;{course.suggestedStatusLabel}&quot;
                </Text>
                <Text style={styles.courseReason}>
                  <strong>Motivo:</strong> {course.reason}
                </Text>
                <Link
                  href={`${baseUrl}/educator/courses/${course.id}/edit`}
                  style={styles.courseLink}
                >
                  Editar curso
                </Link>
                {index < courses.length - 1 && <div style={{ height: '16px' }} />}
              </Section>
            ))}

            <Text style={styles.disclaimer}>
              Estos cambios de estado son sugerencias. Puedes revisar cada curso y
              decidir si es apropiado realizar el cambio según tu criterio.
            </Text>
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
    maxWidth: '520px',
    padding: 0,
  },
  content: {
    padding: '32px',
  },
  title: {
    color: emailTheme.colors.foreground,
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
  },
  greeting: {
    color: emailTheme.colors.foreground,
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0 0 8px 0',
  },
  text: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '24px',
    margin: '0 0 24px 0',
  },
  courseCard: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    border: `1px solid ${emailTheme.colors.border}`,
    padding: '16px',
    marginBottom: '12px',
  },
  courseTitle: {
    color: emailTheme.colors.primary,
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 12px 0',
  },
  cardDivider: {
    borderColor: emailTheme.colors.border,
    margin: '12px 0',
  },
  courseDetail: {
    color: emailTheme.colors.foreground,
    fontSize: '13px',
    lineHeight: '20px',
    margin: '4px 0',
  },
  courseReason: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '13px',
    fontStyle: 'italic' as const,
    lineHeight: '20px',
    margin: '8px 0 12px 0',
  },
  courseLink: {
    backgroundColor: emailTheme.colors.primary,
    borderRadius: '6px',
    color: emailTheme.colors.primaryForeground,
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: '500',
    padding: '8px 16px',
    textDecoration: 'none',
  },
  disclaimer: {
    color: emailTheme.colors.mutedForeground,
    fontSize: '12px',
    lineHeight: '20px',
    margin: '24px 0 0 0',
    textAlign: 'center' as const,
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
