import { Img, Section } from '@react-email/components'
import { emailTheme } from './email-theme'

export function EmailHeader() {
  return (
    <Section style={styles.header}>
      <Img
        src="https://academy.tinta.wine/TintaAcademy_Logo_Blanco.png"
        width="220"
        height="auto"
        alt="Tinta Academy"
        style={styles.logo}
      />
    </Section>
  )
}

const styles = {
  header: {
    backgroundColor: emailTheme.colors.primary,
    borderRadius: `${emailTheme.borderRadius} ${emailTheme.borderRadius} 0 0`,
    padding: '24px 32px',
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 auto',
  },
}
