import { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface HeaderProps {
  onNavigate?: (href: string) => void
  onLogin?: () => void
  onRegister?: () => void
}

/**
 * Header - Public navigation header
 */
export function Header({ onNavigate, onLogin, onRegister }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'Cursos', href: '/cursos' },
    { label: 'Sobre WSET', href: '/wset' },
    { label: 'Contacto', href: '/contacto' },
  ]

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate?.('/')}
            className="flex items-baseline"
          >
            <span style={{ fontFamily: 'Georgia, Times, serif' }} className="text-2xl font-semibold text-white">tinta</span>
            <span style={{ fontFamily: 'Geist, system-ui, sans-serif' }} className="text-lg font-light text-white ml-1">Academy</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => onNavigate?.(link.href)}
                className="text-white/80 hover:text-white font-medium transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onLogin}
              className="px-5 py-2.5 text-white font-medium hover:text-white/80 transition-colors"
            >
              Iniciar Sesión
            </button>
            <button
              onClick={onRegister}
              className="px-5 py-2.5 bg-white text-[#143F3B] font-medium rounded-full hover:bg-[#DDBBC0] transition-colors"
            >
              Registrarse
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#143F3B] border-t border-white/10">
          <nav className="px-6 py-4 space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  onNavigate?.(link.href)
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left py-3 text-white/80 hover:text-white font-medium"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={onLogin}
                className="block w-full text-left py-3 text-white font-medium"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={onRegister}
                className="block w-full text-center py-3 bg-white text-[#143F3B] font-medium rounded-xl"
              >
                Registrarse
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
