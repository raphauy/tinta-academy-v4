import { useState } from 'react'
import type { FooterLinks, ContactInfo } from '@/../product/sections/landing-and-cat-logo/types'
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin, Send, Wine } from 'lucide-react'

interface FooterProps {
  links: FooterLinks
  contactInfo: ContactInfo
  onNavigate?: (href: string) => void
  onSubscribe?: (email: string) => void
}

/**
 * Footer - Full institutional footer with newsletter
 * Design: Elegant dark footer with wine-inspired accents
 */
export function Footer({ links, contactInfo, onNavigate, onSubscribe }: FooterProps) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      onSubscribe?.(email)
      setSubscribed(true)
      setEmail('')
    }
  }

  const getSocialIcon = (icon?: string) => {
    switch (icon) {
      case 'instagram':
        return <Instagram size={20} />
      case 'facebook':
        return <Facebook size={20} />
      case 'linkedin':
        return <Linkedin size={20} />
      default:
        return null
    }
  }

  return (
    <footer className="bg-[#143F3B] text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <Wine size={28} className="text-[#DDBBC0]" />
              <span
                className="text-2xl font-semibold"
                style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
              >
                tinta Academy
              </span>
            </div>
            <p
              className="text-white/70 leading-relaxed mb-8 max-w-sm"
              style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
            >
              Formación especializada en vinos con certificación internacional WSET.
              Cursos presenciales en Montevideo y online para toda Latinoamérica.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-white/70 hover:text-[#DDBBC0] transition-colors"
                style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
              >
                <Mail size={18} />
                {contactInfo.email}
              </a>
              <a
                href={`tel:${contactInfo.phone}`}
                className="flex items-center gap-3 text-white/70 hover:text-[#DDBBC0] transition-colors"
                style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
              >
                <Phone size={18} />
                {contactInfo.phone}
              </a>
              <p
                className="flex items-start gap-3 text-white/70"
                style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
              >
                <MapPin size={18} className="flex-shrink-0 mt-0.5" />
                {contactInfo.address}
              </p>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider text-[#DDBBC0] mb-4"
              style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
            >
              Sobre Nosotros
            </h3>
            <ul className="space-y-3">
              {links.about.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => onNavigate?.(link.href)}
                    className="text-white/70 hover:text-white transition-colors"
                    style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses Links */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider text-[#DDBBC0] mb-4"
              style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
            >
              Cursos
            </h3>
            <ul className="space-y-3">
              {links.courses.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => onNavigate?.(link.href)}
                    className="text-white/70 hover:text-white transition-colors"
                    style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wider text-[#DDBBC0] mb-4"
              style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
            >
              Newsletter
            </h3>
            <p
              className="text-white/70 text-sm mb-4"
              style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
            >
              Recibí novedades sobre cursos, eventos y promociones exclusivas.
            </p>

            {subscribed ? (
              <div
                className="text-[#E2E369] text-sm"
                style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
              >
                ¡Gracias por suscribirte!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-[#DDBBC0] transition-colors"
                  style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#DDBBC0] text-[#143F3B] rounded-lg hover:bg-[#E2E369] transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            )}

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {links.social.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-[#DDBBC0] hover:text-[#143F3B] transition-all"
                >
                  {getSocialIcon(link.icon)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="text-white/50 text-sm"
              style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
            >
              © {new Date().getFullYear()} Tinta Academy. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              {links.legal.map((link) => (
                <button
                  key={link.href}
                  onClick={() => onNavigate?.(link.href)}
                  className="text-white/50 text-sm hover:text-white transition-colors"
                  style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
