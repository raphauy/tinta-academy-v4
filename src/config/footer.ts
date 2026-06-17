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
    { label: "Catas", href: "/?type=cata#catalogo" },
    { label: "Experiencias", href: "/?type=experiencia#catalogo" }
  ],
  legal: [
    { label: "Política de Ajustes Razonables", href: "/politicas/ajuste-razonable" },
    { label: "Política de Conflicto de Intereses", href: "/politicas/conflicto-intereses" }
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/tinta.wine" },
    { label: "Facebook", href: "https://www.facebook.com/tintawineoficial" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/tintawine" },
    { label: "TikTok", href: "https://www.tiktok.com/@tinta.wine" }
  ]
}

export const contactInfo: ContactInfo = {
  email: "academy@tinta.wine",
  phone: "59892664933",
  address: "Montevideo, Uruguay"
}
