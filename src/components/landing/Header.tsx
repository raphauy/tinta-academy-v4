'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserDropdown, type UserDropdownUser } from '@/components/shared/user-dropdown'

export interface HeaderUser extends UserDropdownUser {}

interface HeaderProps {
  user?: HeaderUser | null
  onScrollToCatalog?: () => void
}

/**
 * Header - Public navigation header with user avatar
 */
export function Header({ user, onScrollToCatalog }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image
              src="/TintaAcademy_Logo_Negro.png"
              alt="Tinta Academy"
              width={160}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="text-foreground hover:bg-muted text-sm font-medium"
            >
              <Link href="/wset">WSET</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={onScrollToCatalog}
              className="text-foreground hover:bg-muted text-sm font-medium"
            >
              Cursos
            </Button>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onScrollToCatalog}
              className="text-foreground hover:bg-muted"
              title="Buscar cursos"
            >
              <Search size={18} />
            </Button>

            {user ? (
              <UserDropdown user={user} variant="dark" />
            ) : (
              <Button
                asChild
                variant="ghost"
                className="text-foreground hover:bg-muted text-sm font-medium"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
