'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MainNav } from './main-nav'
import { UserMenu, type UserMenuUser } from './user-menu'
import { Logo } from '@/components/shared/logo'
import { UserDropdown } from '@/components/shared/user-dropdown'
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

  // Public shell uses simplified top navigation
  if (variant === 'public') {
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
                <UserDropdown user={user} />
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-background lg:flex"
          style={{ width: sidebarWidth }}
        >
          <div className="flex h-16 items-center border-b border-border px-6">
            <Logo />
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
