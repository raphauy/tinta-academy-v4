'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { signOut } from 'next-auth/react'
import { LogOut, User, Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface HeaderUser {
  name: string | null
  email?: string | null
  image?: string | null
  role?: string | null
}

interface HeaderProps {
  user?: HeaderUser | null
}

/**
 * Header - Public navigation header with user avatar
 */
export function Header({ user }: HeaderProps) {
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
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-baseline">
            <span style={{ fontFamily: 'Georgia, Times, serif' }} className="text-2xl font-semibold text-white">tinta</span>
            <span style={{ fontFamily: 'Geist, system-ui, sans-serif' }} className="text-lg font-light text-white ml-1">Academy</span>
          </Link>

          {/* User Avatar */}
          {user && (
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
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white/30 hover:ring-white/60 transition-all"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30 hover:ring-white/60 transition-all">
                    <span className="text-xs font-medium text-white">
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
          )}
        </div>
      </div>
    </header>
  )
}
