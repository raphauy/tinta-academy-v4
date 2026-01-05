import { useState } from 'react'
import { ChevronUp, LogOut, User, Settings } from 'lucide-react'

export interface User {
  name: string
  email?: string
  avatarUrl?: string
  role?: 'student' | 'educator' | 'admin'
}

export interface UserMenuProps {
  user: User
  onLogout?: () => void
  onNavigate?: (href: string) => void
}

/**
 * UserMenu - User profile dropdown in sidebar
 * Shows avatar, name, and quick actions
 */
export function UserMenu({ user, onLogout, onNavigate }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleLabel = {
    student: 'Alumno',
    educator: 'Educador',
    admin: 'Administrador',
  }[user.role ?? 'student']

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#EBEBEB] transition-colors"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#143F3B] flex items-center justify-center">
            <span className="text-sm font-medium text-white" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
              {initials}
            </span>
          </div>
        )}

        {/* Name & Role */}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-[#2E2E2E]" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
            {user.name}
          </p>
          <p className="text-xs text-[#7F7F7F]" style={{ fontFamily: 'Geist, system-ui, sans-serif' }}>
            {roleLabel}
          </p>
        </div>

        {/* Chevron */}
        <ChevronUp
          size={16}
          className={`text-[#7F7F7F] transition-transform ${open ? '' : 'rotate-180'}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-[#DBDBDB] py-1 z-50">
          <button
            onClick={() => {
              onNavigate?.('/profile')
              setOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#2E2E2E] hover:bg-[#EBEBEB] transition-colors"
            style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
          >
            <User size={16} className="text-[#7F7F7F]" />
            Mi Perfil
          </button>
          <button
            onClick={() => {
              onNavigate?.('/settings')
              setOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#2E2E2E] hover:bg-[#EBEBEB] transition-colors"
            style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
          >
            <Settings size={16} className="text-[#7F7F7F]" />
            Configuración
          </button>
          <div className="border-t border-[#DBDBDB] my-1" />
          <button
            onClick={() => {
              onLogout?.()
              setOpen(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
