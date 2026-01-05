import {
  Shield,
  GraduationCap,
  BookOpen,
  User as UserIcon,
  Pencil,
  Trash2,
  MoreVertical,
  Calendar,
  Clock
} from 'lucide-react'
import type { User } from '@/../product/sections/admin/types'
import { useState } from 'react'

interface UserRowProps {
  user: User
  onEditRole?: () => void
  onDelete?: () => void
}

interface AvatarProps {
  src: string | null
  initials: string
  size?: 'sm' | 'md'
}

function Avatar({ src, initials, size = 'md' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-10 h-10 text-sm'

  if (!src || imgError) {
    return (
      <div className={`flex-shrink-0 ${sizeClass} rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white font-medium`}>
        {initials}
      </div>
    )
  }

  return (
    <div className={`flex-shrink-0 ${sizeClass} rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800`}>
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`
  return formatDate(dateString)
}

const roleConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-900'
  },
  educator: {
    label: 'Educador',
    icon: GraduationCap,
    className: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border-teal-200 dark:border-teal-900'
  },
  student: {
    label: 'Estudiante',
    icon: BookOpen,
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900'
  },
  user: {
    label: 'Usuario',
    icon: UserIcon,
    className: 'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700'
  }
}

export function UserRow({ user, onEditRole, onDelete }: UserRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const role = roleConfig[user.role] || roleConfig.user
  const RoleIcon = role.icon
  const isAdmin = user.role === 'admin'

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            <Avatar
              src={user.avatarUrl}
              initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
            />

            {/* Info */}
            <div className="min-w-0">
              <p className="font-medium text-stone-900 dark:text-stone-100 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Role Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${role.className}`}>
            <RoleIcon className="w-3 h-3" />
            {role.label}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(user.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatRelativeDate(user.lastLoginAt)}
            </span>
          </div>

          {/* Actions */}
          {!isAdmin && (
            <div className="flex items-center gap-1">
              <button
                onClick={onEditRole}
                className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors"
                title="Editar rol"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        {/* User Info - 4 cols */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <Avatar
            src={user.avatarUrl}
            initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
            size="sm"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm text-stone-900 dark:text-stone-100 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Role - 2 cols */}
        <div className="col-span-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${role.className}`}>
            <RoleIcon className="w-3 h-3" />
            {role.label}
          </span>
        </div>

        {/* Created At - 2 cols */}
        <div className="col-span-2 text-sm text-stone-500 dark:text-stone-400">
          {formatDate(user.createdAt)}
        </div>

        {/* Last Login - 2 cols */}
        <div className="col-span-2 text-sm text-stone-500 dark:text-stone-400">
          {formatRelativeDate(user.lastLoginAt)}
        </div>

        {/* Actions - 2 cols */}
        <div className="col-span-2 flex items-center justify-end gap-1">
          {isAdmin ? (
            <span className="text-xs text-stone-400 dark:text-stone-500 italic">
              Protegido
            </span>
          ) : (
            <>
              <button
                onClick={onEditRole}
                className="p-1.5 text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Editar rol"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
