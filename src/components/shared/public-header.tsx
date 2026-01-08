'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import {
  Search,
  Menu,
  X,
  ChevronUp,
  User,
  LayoutDashboard,
  Shield,
  GraduationCap,
  LogOut,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'
import { UserDropdown, type UserDropdownUser } from './user-dropdown'

interface PublicHeaderProps {
  user?: UserDropdownUser | null
  onScrollToCatalog?: () => void
}

const roleLabels: Record<string, string> = {
  superadmin: 'Administrador',
  educator: 'Educador',
  student: 'Alumno',
}

/**
 * LandingUserMenu - User menu for landing page mobile sidebar
 * Similar to UserMenu but without "Ir a la Landing" (since we're already there)
 */
function LandingUserMenu({ user }: { user: UserDropdownUser }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  // Using suppressHydrationWarning on theme buttons instead of mounted state
  // to avoid lint error about setState in useEffect

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName = user.name || user.email || 'Usuario'
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const roleLabel = roleLabels[user.role ?? ''] || 'Usuario'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="flex h-auto w-full items-center gap-3 p-2"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-medium text-primary-foreground">
              {initials}
            </span>
          </div>
        )}

        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">{roleLabel}</p>
        </div>

        <ChevronUp
          size={16}
          className={`text-muted-foreground transition-transform ${
            open ? '' : 'rotate-180'
          }`}
        />
      </Button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {/* User Info */}
          <div className="px-3 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                  unoptimized
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary flex-shrink-0">
                  <span className="text-xs font-medium text-primary-foreground">
                    {initials}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                {user.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 px-3 text-sm"
              asChild
            >
              <Link href="/profile" onClick={() => setOpen(false)}>
                <User size={14} className="text-muted-foreground" />
                Mi Perfil
              </Link>
            </Button>

            {/* Panel Links by Role */}
            {user.role === 'superadmin' && (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3 text-sm"
                  asChild
                >
                  <Link href="/admin" onClick={() => setOpen(false)}>
                    <Shield size={14} className="text-muted-foreground" />
                    Panel Admin
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3 text-sm"
                  asChild
                >
                  <Link href="/educator" onClick={() => setOpen(false)}>
                    <LayoutDashboard size={14} className="text-muted-foreground" />
                    Panel Educador
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-3 text-sm"
                  asChild
                >
                  <Link href="/student" onClick={() => setOpen(false)}>
                    <GraduationCap size={14} className="text-muted-foreground" />
                    Panel Alumno
                  </Link>
                </Button>
              </>
            )}

            {user.role === 'educator' && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-3 text-sm"
                asChild
              >
                <Link href="/educator" onClick={() => setOpen(false)}>
                  <LayoutDashboard size={14} className="text-muted-foreground" />
                  Mi Panel
                </Link>
              </Button>
            )}

            {user.role === 'student' && (
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-3 text-sm"
                asChild
              >
                <Link href="/student" onClick={() => setOpen(false)}>
                  <GraduationCap size={14} className="text-muted-foreground" />
                  Mi Panel
                </Link>
              </Button>
            )}
          </div>

          {/* Theme Section */}
          <div className="border-t border-border">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm text-foreground">Tema</span>
              <div className="flex items-center gap-0.5" suppressHydrationWarning>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme('system')}
                  className={`h-7 w-7 ${theme === 'system' ? 'text-foreground' : 'text-muted-foreground'}`}
                  suppressHydrationWarning
                >
                  <Monitor size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme('light')}
                  className={`h-7 w-7 ${theme === 'light' ? 'text-foreground' : 'text-muted-foreground'}`}
                  suppressHydrationWarning
                >
                  <Sun size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme('dark')}
                  className={`h-7 w-7 ${theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'}`}
                  suppressHydrationWarning
                >
                  <Moon size={14} />
                </Button>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-border py-1">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 px-3 text-sm"
            >
              <LogOut size={14} className="text-muted-foreground" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * PublicHeader - Unified header for all public pages
 * Used by landing page and public app shell
 * Mobile menu matches AppShell style (left sidebar with overlay)
 */
export function PublicHeader({ user, onScrollToCatalog }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleCursosClick = () => {
    if (onScrollToCatalog) {
      onScrollToCatalog()
    }
    setMobileMenuOpen(false)
  }

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Left */}
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo />
            </Link>

            {/* Center Navigation - Desktop */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-foreground hover:bg-muted text-base font-medium"
              >
                <Link href="/wset">WSET</Link>
              </Button>
              {onScrollToCatalog ? (
                <Button
                  variant="ghost"
                  onClick={handleCursosClick}
                  className="text-foreground hover:bg-muted text-base font-medium"
                >
                  Cursos
                </Button>
              ) : (
                <Button
                  asChild
                  variant="ghost"
                  className="text-foreground hover:bg-muted text-base font-medium"
                >
                  <Link href="/#catalog">Cursos</Link>
                </Button>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search - Desktop */}
              <div className="hidden md:block">
                {onScrollToCatalog ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCursosClick}
                    className="text-foreground hover:bg-muted"
                    title="Buscar cursos"
                  >
                    <Search size={18} />
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:bg-muted"
                    title="Buscar cursos"
                  >
                    <Link href="/#catalog">
                      <Search size={18} />
                    </Link>
                  </Button>
                )}
              </div>

              {/* User dropdown - Desktop */}
              <div className="hidden md:block">
                {user ? (
                  <UserDropdown user={user} />
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    className="text-foreground hover:bg-muted text-base font-medium"
                  >
                    <Link href="/login">Iniciar sesión</Link>
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button - Right side (matches AppShell) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-foreground hover:bg-muted"
                aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay - matches AppShell style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-background shadow-xl">
            {/* Sidebar Header */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <Link href="/" className="hover:opacity-80 transition-opacity" onClick={handleLinkClick}>
                <Logo />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-4">
              <div className="flex flex-col gap-1">
                <Link
                  href="/wset"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
                >
                  WSET
                </Link>
                {onScrollToCatalog ? (
                  <button
                    onClick={handleCursosClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors text-left"
                  >
                    Cursos
                  </button>
                ) : (
                  <Link
                    href="/#catalog"
                    onClick={handleLinkClick}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
                  >
                    Cursos
                  </Link>
                )}
              </div>
            </nav>

            {/* User Section - uses LandingUserMenu (same items as desktop dropdown) */}
            <div className="border-t border-border p-4">
              {user ? (
                <LandingUserMenu user={user} />
              ) : (
                <Link
                  href="/login"
                  onClick={handleLinkClick}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
