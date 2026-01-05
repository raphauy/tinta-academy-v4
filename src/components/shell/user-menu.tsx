'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ChevronUp, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface UserMenuUser {
  name: string | null
  email?: string
  image?: string | null
  role?: string
}

export interface UserMenuProps {
  user: UserMenuUser
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  const displayName = user.name || user.email || 'Usuario'
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
  const roleLabel = roleLabels[user.role ?? ''] || 'Usuario'

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="flex h-auto w-full items-center gap-3 p-2"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover"
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
        <div className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-lg border border-border bg-background py-1 shadow-lg">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4"
            asChild
          >
            <Link href="/profile" onClick={() => setOpen(false)}>
              <User size={16} className="text-muted-foreground" />
              Mi Perfil
            </Link>
          </Button>
          <div className="my-1 border-t border-border" />
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 text-red-600 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </div>
  )
}
