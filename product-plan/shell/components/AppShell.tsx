import { useState } from 'react'
import { MainNav, type NavItem } from './MainNav'
import { UserMenu, type User } from './UserMenu'
import { Menu, X } from 'lucide-react'

export type ShellVariant = 'public' | 'student' | 'educator' | 'admin'

export interface AppShellProps {
  children: React.ReactNode
  variant: ShellVariant
  navigationItems: NavItem[]
  user?: User
  logo?: React.ReactNode
  onNavigate?: (href: string) => void
  onLogout?: () => void
}

/**
 * AppShell - Main application shell wrapper
 * Supports different variants for public, student, educator, and admin views
 */
export function AppShell({
  children,
  variant,
  navigationItems,
  user,
  logo,
  onNavigate,
  onLogout,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const LogoComponent = () => (
    logo || (
      <span className="text-xl font-semibold text-[#143F3B]" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
        tinta Academy
      </span>
    )
  )

  // Public shell uses top navigation
  if (variant === 'public') {
    return (
      <div className="min-h-screen bg-[#EBEBEB]">
        {/* Public Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-[#DBDBDB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <LogoComponent />
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => onNavigate?.(item.href)}
                    className={`text-sm font-medium transition-colors ${
                      item.isActive
                        ? 'text-[#143F3B]'
                        : 'text-[#7F7F7F] hover:text-[#143F3B]'
                    }`}
                    style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => onNavigate?.('/login')}
                  className="px-4 py-2 text-sm font-medium text-[#143F3B] hover:text-[#37635E] transition-colors"
                  style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                >
                  Iniciar Sesión
                </button>
                <button
                  onClick={() => onNavigate?.('/register')}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#143F3B] hover:bg-[#37635E] rounded-lg transition-colors"
                  style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                >
                  Registrarse
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#2E2E2E]"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#DBDBDB] bg-white">
              <nav className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      onNavigate?.(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      item.isActive
                        ? 'bg-[#143F3B] text-white'
                        : 'text-[#2E2E2E] hover:bg-[#EBEBEB]'
                    }`}
                    style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-4 border-t border-[#DBDBDB] space-y-2">
                  <button
                    onClick={() => onNavigate?.('/login')}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-[#143F3B]"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => onNavigate?.('/register')}
                    className="block w-full text-center px-3 py-2 text-sm font-medium text-white bg-[#143F3B] rounded-lg"
                  >
                    Registrarse
                  </button>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main>{children}</main>
      </div>
    )
  }

  // Authenticated shells use sidebar navigation
  const sidebarWidth = variant === 'admin' ? 256 : 240 // 64*4=256, 60*4=240

  return (
    <div className="min-h-screen bg-[#EBEBEB]">
      {/* Mobile Header - hidden on lg screens */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#DBDBDB]">
        <div className="flex items-center justify-between h-14 px-4">
          <LogoComponent />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#2E2E2E]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - visible on lg screens */}
        <aside
          className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 bg-white border-r border-[#DBDBDB] z-30"
          style={{ width: sidebarWidth }}
        >
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-[#DBDBDB]">
            <LogoComponent />
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <MainNav
              items={navigationItems}
              onNavigate={onNavigate}
            />
          </div>

          {/* User Menu */}
          {user && (
            <div className="border-t border-[#DBDBDB] p-4">
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col">
              {/* Logo */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-[#DBDBDB]">
                <LogoComponent />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-[#2E2E2E]"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <MainNav
                  items={navigationItems}
                  onNavigate={(href) => {
                    onNavigate?.(href)
                    setMobileMenuOpen(false)
                  }}
                />
              </div>

              {/* User Menu */}
              {user && (
                <div className="border-t border-[#DBDBDB] p-4">
                  <UserMenu user={user} onLogout={onLogout} />
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main
          className="flex-1 min-h-screen"
          style={{
            marginLeft: 0,
            ['--sidebar-width' as string]: `${sidebarWidth}px`
          }}
        >
          <style>{`
            @media (min-width: 1024px) {
              main[style*="--sidebar-width"] {
                margin-left: var(--sidebar-width) !important;
              }
            }
          `}</style>
          {children}
        </main>
      </div>
    </div>
  )
}
