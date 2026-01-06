'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { Menu, X, LogOut, User, Moon, Sun, Monitor } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { MainNav } from './main-nav'
import { UserMenu, type UserMenuUser } from './user-menu'
import { Logo } from '@/components/shared/logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import {
  adminNavItems,
  educatorNavItems,
  studentNavItems,
  publicNavItems,
} from './navigation-config'

export type ShellVariant = 'public' | 'student' | 'educator' | 'admin'

const navItemsByVariant = {
  admin: adminNavItems,
  educator: educatorNavItems,
  student: studentNavItems,
  public: publicNavItems,
}

export interface AppShellProps {
  children: React.ReactNode
  variant: ShellVariant
  user?: UserMenuUser
}

export function AppShell({ children, variant, user }: AppShellProps) {
  const navigationItems = navItemsByVariant[variant]
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect -- Standard hydration pattern
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Public shell uses simplified top navigation
  if (variant === 'public') {
    const displayName = user?.name || user?.email || 'Usuario'
    const initials = displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)

    const roleLabels: Record<string, string> = {
      superadmin: 'Administrador',
      educator: 'Educador',
      student: 'Alumno',
    }
    const roleLabel = roleLabels[user?.role ?? ''] || 'Usuario'

    const handleLogout = async () => {
      await signOut({ callbackUrl: '/' })
    }

    return (
      <div className="min-h-screen bg-secondary">
        <header className="sticky top-0 z-50 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0">
                <Logo />
              </div>

              {/* User Avatar with Dropdown */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="rounded-full p-0 h-8 w-8"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={displayName}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                        <span className="text-xs font-medium text-primary-foreground">
                          {initials}
                        </span>
                      </div>
                    )}
                  </Button>

                  {/* Dropdown - Vercel style */}
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
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
                            <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                            {user.email && (
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
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
                          <Link href="/profile" onClick={() => setDropdownOpen(false)}>
                            <User size={14} className="text-muted-foreground" />
                            Mi Perfil
                          </Link>
                        </Button>
                      </div>

                      {/* Theme Section - Vercel style */}
                      <div className="border-t border-border">
                        <div className="flex items-center justify-between px-3 py-2">
                          <span className="text-sm text-foreground">Tema</span>
                          <div className="flex items-center gap-0.5">
                            {mounted && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setTheme('system')}
                                  className={`h-7 w-7 ${theme === 'system' ? 'text-foreground' : 'text-muted-foreground'}`}
                                >
                                  <Monitor size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setTheme('light')}
                                  className={`h-7 w-7 ${theme === 'light' ? 'text-foreground' : 'text-muted-foreground'}`}
                                >
                                  <Sun size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setTheme('dark')}
                                  className={`h-7 w-7 ${theme === 'dark' ? 'text-foreground' : 'text-muted-foreground'}`}
                                >
                                  <Moon size={14} />
                                </Button>
                              </>
                            )}
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
              ) : (
                <Button variant="ghost" asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    )
  }

  // Authenticated shells use sidebar navigation
  const sidebarWidth = variant === 'admin' ? 256 : 240

  return (
    <div className="min-h-screen bg-secondary">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo />
          <div className="flex items-center gap-2">
            {variant !== 'admin' && <ThemeToggle />}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-background lg:flex"
          style={{ width: sidebarWidth }}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Logo />
            {variant !== 'admin' && <ThemeToggle />}
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <MainNav items={navigationItems} />
          </div>

          {user && (
            <div className="border-t border-border p-4">
              <UserMenu user={user} />
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 flex w-64 flex-col bg-background shadow-xl">
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <Logo />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <MainNav items={navigationItems} />
              </div>

              {user && (
                <div className="border-t border-border p-4">
                  <UserMenu user={user} />
                </div>
              )}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main
          className="min-h-screen flex-1 lg:ml-[var(--sidebar-width)]"
          style={
            { '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties
          }
        >
          {children}
        </main>
      </div>
    </div>
  )
}
