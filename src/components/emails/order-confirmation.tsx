import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import { emailTheme } from './email-theme'
import { EmailHeader } from './email-header'

interface OrderConfirmationEmailProps {
  customerName?: string
  orderNumber?: string
  courseName?: string
  courseType?: string
  educatorName?: string
  startDate?: string
  location?: string
  paymentMethod?: string
  amount?: string
  currency?: string
  courseUrl?: string
}

export default function OrderConfirmationEmail({
  customerName = 'María García',
  orderNumber = 'TA-20260110-0001',
  courseName = 'WSET Level 2 Award in Wines',
  courseType = 'WSET Nivel 2',
  educatorName = 'Sommelier Juan Pérez',
  startDate = '15 de marzo de 2026',
  location = 'Montevideo, Uruguay',
  // paymentMethod is kept for potential future use
  paymentMethod: _paymentMethod = 'MercadoPago',
  amount = '350.00',
  currency = 'USD',
  courseUrl = 'https://academy.tinta.wine/student/courses/wset-level-2',
}: OrderConfirmationEmailProps) {
  void _paymentMethod // Suppress unused variable warning
  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido/a a Tinta Academy!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <EmailHeader />

          <Section style={styles.content}>
            {/* Main Title */}
            <Heading style={styles.title}>
              ¡Bienvenido/a a Tinta Academy!
            </Heading>

            {/* Welcome Text */}
            <Text style={styles.text}>
              Hola <strong>{customerName}</strong>,
            </Text>
            <Text style={styles.text}>
              ¡Qué alegría tenerte con nosotros en Tinta Academy!
            </Text>
            <Text style={styles.text}>
              Ya sos parte de una experiencia de formación pensada para explorar
              la cultura del vino con una mirada profesional, curiosa y
              conectada con el mundo.
            </Text>
            <Text style={styles.text}>
              En Tinta Academy creemos en el valor del conocimiento. Por eso
              ofrecemos programas de formación con estándares internacionales y
              una perspectiva global, orientados a acompañar los procesos de
              aprendizaje y profundización en la cultura del vino.
            </Text>
            <Text style={styles.text}>
              Conoce a quien estará a cargo de acompañarte en esta experiencia:
            </Text>

            {/* Team Section */}
            <Section style={styles.teamSection}>
              <Row style={styles.teamRow}>
                <Column style={styles.avatarColumn}>
                  <Img
                    src="https://academy.tinta.wine/gabi.jpeg"
                    width="50"
                    height="50"
                    alt="Gabi Zimmer"
                    style={styles.avatar}
                  />
                </Column>
                <Column style={styles.teamTextColumn}>
                  <Text style={styles.teamText}>
                    <strong>Gabi Zimmer</strong>, sommelière, autora, catadora
                    profesional y comunicadora especializada en el mundo del
                    vino, diplomada en WSET y fundadora de Tinta. Es quien
                    lidera la academia y dicta los cursos de formación.
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={styles.text}>
              Estamos aquí para acompañarte en cada etapa. Si tienes consultas,
              puedes contactarnos a través de:
            </Text>

            {/* Contact Info */}
            <Section style={styles.contactBox}>
              <Text style={styles.contactItem}>
                <strong>▪️ WhatsApp:</strong>{' '}
                <Link href="https://wa.me/59892794526" style={styles.link}>
                  +598 92794526
                </Link>
              </Text>
              <Text style={styles.contactItem}>
                <strong>▪️ Correo electrónico:</strong>{' '}
                <Link href="mailto:academy@tinta.wine" style={styles.link}>
                  academy@tinta.wine
                </Link>
              </Text>
              <Text style={styles.contactItem}>
                <strong>▪️ Instagram:</strong>{' '}
                <Link
                  href="https://www.instagram.com/tinta.wine"
                  style={styles.link}
                >
                  @tinta.wine
                </Link>
              </Text>
            </Section>

            <Text style={styles.text}>
              Estamos muy contentos de comenzar este camino juntos.
            </Text>
            <Text style={styles.text}>¡Nos vemos pronto!</Text>
            <Text style={styles.signOff}>
              Gabi Zimmer &amp; el equipo de Tinta Academy
            </Text>

            <Hr style={styles.divider} />

            {/* Order Details Section */}
            <Section style={styles.orderBox}>
              <Text style={styles.orderNumber}>ORDEN #{orderNumber}</Text>
              <Hr style={styles.orderDivider} />
              <Text style={styles.courseTitle}>{courseName}</Text>
              <Text style={styles.courseDetail}>
                {courseType} • {educatorName}
              </Text>
              <Hr style={styles.orderDivider} />
              <Text style={styles.detailRow}>
                Fecha de inicio: <strong>{startDate}</strong>
              </Text>
              <Text style={styles.detailRow}>
                Ubicación: <strong>{location}</strong>
              </Text>
              <Hr style={styles.orderDivider} />
              <Text style={styles.totalRow}>
                Pagado: {currency} {amount}
              </Text>
            </Section>

            <Text style={styles.text}>
              Ya puedes acceder a tu curso desde tu panel de estudiante.
            </Text>

            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={courseUrl}>
                Ir a mi curso
              </Button>
            </Section>

            <Text style={styles.smallText}>
              Si tienes alguna pregunta, no dudes en contactarnos respondiendo a
              este email.
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
    maxWidth: '600px',
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
  teamSection: {
    margin: '24px 0',
  },
  teamRow: {
    marginBottom: '16px',
  },
  avatarColumn: {
    width: '60px',
    verticalAlign: 'top' as const,
  },
  avatar: {
    borderRadius: '50%',
    border: `2px solid ${emailTheme.colors.border}`,
  },
  teamTextColumn: {
    paddingLeft: '12px',
    verticalAlign: 'top' as const,
  },
  teamText: {
    color: emailTheme.colors.foreground,
    fontSize: '13px',
    lineHeight: '22px',
    margin: 0,
  },
  contactBox: {
    backgroundColor: emailTheme.colors.muted,
    borderRadius: emailTheme.borderRadius,
    padding: '16px 20px',
    margin: '16px 0',
  },
  contactItem: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    lineHeight: '28px',
    margin: 0,
  },
  link: {
    color: emailTheme.colors.primary,
    textDecoration: 'underline',
  },
  signOff: {
    color: emailTheme.colors.foreground,
    fontSize: '14px',
    fontWeight: '700',
    lineHeight: '24px',
    margin: '0 0 24px 0',
  },
  divider: {
    borderColor: emailTheme.colors.border,
    margin: '24px 0',
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
  orderDivider: {
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
  totalRow: {
    color: '#16a34a',
    fontSize: '18px',
    fontWeight: '600',
    margin: '0',
    textAlign: 'right' as const,
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
