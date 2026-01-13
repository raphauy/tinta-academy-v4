import type { FooterLinks, ContactInfo } from '@/types/landing'

export const footerLinks: FooterLinks = {
  about: [
    { label: "Sobre nosotros", href: "#" },
    { label: "Nuestro equipo", href: "#" },
    { label: "Blog", href: "#" }
  ],
  courses: [
    { label: "Certificaciones WSET", href: "/?type=wset#catalogo" },
    { label: "Talleres", href: "/?type=taller#catalogo" },
    { label: "Catas", href: "/?type=cata#catalogo" }
  ],
  legal: [
    { label: "Política de Ajustes Razonables", href: "/politicas/ajuste-razonable" },
    { label: "Política de Conflicto de Intereses", href: "/politicas/conflicto-intereses" }
  ],
  social: [
    { label: "Instagram", href: "#" },
    { label: "LinkedIn", href: "#" },
    { label: "YouTube", href: "#" }
  ]
}

export const contactInfo: ContactInfo = {
  email: "academy@tinta.wine",
  phone: "59892043904",
  address: "Montevideo, Uruguay"
}
