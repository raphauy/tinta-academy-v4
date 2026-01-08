'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './logo'
import { UserDropdown, type UserDropdownUser } from './user-dropdown'

interface PublicHeaderProps {
  user?: UserDropdownUser | null
  onScrollToCatalog?: () => void
}

/**
 * PublicHeader - Unified header for all public pages
 * Used by landing page and public app shell
 */
export function PublicHeader({ user, onScrollToCatalog }: PublicHeaderProps) {
  const handleCursosClick = () => {
    if (onScrollToCatalog) {
      onScrollToCatalog()
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>

          {/* Center Navigation */}
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
        </div>
      </div>
    </header>
  )
}
