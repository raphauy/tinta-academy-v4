'use client'

import Link from 'next/link'
import { UserDropdown, type UserDropdownUser } from '@/components/shared/user-dropdown'

export interface HeaderUser extends UserDropdownUser {}

interface HeaderProps {
  user?: HeaderUser | null
}

/**
 * Header - Public navigation header with user avatar
 */
export function Header({ user }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-baseline">
            <span style={{ fontFamily: 'Georgia, Times, serif' }} className="text-2xl font-semibold text-white">tinta</span>
            <span style={{ fontFamily: 'Geist, system-ui, sans-serif' }} className="text-lg font-light text-white ml-1">Academy</span>
          </Link>

          {/* User Avatar */}
          {user && <UserDropdown user={user} variant="light" />}
        </div>
      </div>
    </header>
  )
}
