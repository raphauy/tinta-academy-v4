import type { FooterLinks, ContactInfo } from '@/types/landing'

export const footerLinks: FooterLinks = {
  about: [
    { label: "Sobre nosotros", href: "/about" },
    { label: "Nuestro equipo", href: "/team" },
    { label: "Blog", href: "/blog" }
  ],
  courses: [
    { label: "Certificaciones WSET", href: "/cursos?type=wset" },
    { label: "Talleres", href: "/cursos?type=taller" },
    { label: "Catas", href: "/cursos?type=cata" }
  ],
  legal: [
    { label: "Política de Ajustes Razonables", href: "/politicas/ajuste-razonable" },
    { label: "Política de Conflicto de Intereses", href: "/politicas/conflicto-intereses" }
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com/tintaacademy" },
    { label: "LinkedIn", href: "https://linkedin.com/company/tintaacademy" },
    { label: "YouTube", href: "https://youtube.com/tintaacademy" }
  ]
}

export const contactInfo: ContactInfo = {
  email: "academy@tinta.wine",
  phone: "59892043904",
  address: "Montevideo, Uruguay"
}
