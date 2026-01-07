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
 * Header - Floating navigation bar with centered logo
 * Inspired by enocultura.com.br design
 */
export function Header({ user, onScrollToCatalog }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 pt-4">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center justify-between bg-[#FAF7F2] rounded-full px-6 py-3 shadow-sm">
          {/* Left Navigation */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="text-[#143F3B] hover:text-[#143F3B]/70 hover:bg-transparent text-sm font-medium"
            >
              <Link href="/wset">WSET</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={onScrollToCatalog}
              className="text-[#143F3B] hover:text-[#143F3B]/70 hover:bg-transparent text-sm font-medium"
            >
              Cursos
            </Button>
          </div>

          {/* Center Logo */}
          <Button asChild variant="ghost" className="absolute left-1/2 -translate-x-1/2 hover:bg-transparent p-0">
            <Link href="/">
              <div className="relative h-10 w-40">
                <Image
                  src="/TintaAcademy_Logo_Negro.png"
                  alt="Tinta Academy"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </Button>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onScrollToCatalog}
              className="text-[#143F3B] hover:text-[#143F3B]/70 hover:bg-transparent"
              title="Buscar cursos"
            >
              <Search size={18} />
            </Button>

            {/* User Avatar or Login Button */}
            {user ? (
              <UserDropdown user={user} variant="dark" />
            ) : (
              <Button
                asChild
                variant="outline"
                className="text-[#143F3B] border-[#143F3B] hover:bg-[#143F3B] hover:text-white text-sm font-medium rounded-full px-6"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
