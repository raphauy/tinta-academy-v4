import { Img, Section, Text } from '@react-email/components'
import { emailTheme } from './email-theme'

interface EmailHeaderProps {
  showTitle?: boolean
}

export function EmailHeader({ showTitle = true }: EmailHeaderProps) {
  return (
    <Section style={styles.header}>
      <Img
        src="https://res.cloudinary.com/dcy8vuzjb/image/upload/v1713885570/demo-store/248451668_2739383413037833_764397266421891032_n.jpg_i6wwz2.jpg"
        width="50"
        height="50"
        alt="Tinta Academy"
        style={styles.logo}
      />
      {showTitle && <Text style={styles.headerTitle}>Tinta Academy</Text>}
    </Section>
  )
}

const styles = {
  header: {
    backgroundColor: emailTheme.colors.primary,
    borderRadius: `${emailTheme.borderRadius} ${emailTheme.borderRadius} 0 0`,
    padding: '20px 32px',
    textAlign: 'center' as const,
  },
  logo: {
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    margin: '0 auto',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '700',
    margin: '12px 0 0 0',
    textAlign: 'center' as const,
  },
}
