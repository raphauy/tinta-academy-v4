import { useState } from 'react'
import { Mail, Eye } from 'lucide-react'
import type { EnrolledStudent } from '@/../product/sections/educator-panel/types'

interface StudentRowProps {
  student: EnrolledStudent
  onView?: () => void
  onEmail?: () => void
}

export function StudentRow({ student, onView, onEmail }: StudentRowProps) {
  const [imgError, setImgError] = useState(false)

  // Format date helper
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate time since last access
  const getLastAccessLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`
    return formatDate(dateStr)
  }

  // Get progress color
  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-emerald-500'
    if (progress >= 75) return 'bg-[#143F3B]'
    if (progress >= 50) return 'bg-amber-500'
    if (progress >= 25) return 'bg-orange-500'
    return 'bg-stone-400'
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const showFallbackAvatar = !student.image || imgError

  const Avatar = ({ className = '' }: { className?: string }) => (
    showFallbackAvatar ? (
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-[#143F3B] to-[#1a524d] flex items-center justify-center text-white text-xs font-medium flex-shrink-0 ${className}`}>
        {getInitials(student.name)}
      </div>
    ) : (
      <img
        src={student.image!}
        alt={student.name}
        onError={() => setImgError(true)}
        className={`w-9 h-9 rounded-full object-cover border border-stone-200 dark:border-stone-700 flex-shrink-0 ${className}`}
      />
    )
  )

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:items-center gap-4">
        {/* Student Info - flex-1 */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Avatar />
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {student.name}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {student.email}
            </p>
          </div>
        </div>

        {/* Progress - fixed width */}
        <div className="w-32 flex items-center gap-2">
          <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(student.progress)}`}
              style={{ width: `${student.progress}%` }}
            />
          </div>
          <span className={`text-xs font-medium tabular-nums w-8 text-right ${
            student.progress === 100
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-600 dark:text-stone-400'
          }`}>
            {student.progress}%
          </span>
        </div>

        {/* Enrolled Date - fixed width */}
        <div className="w-28 text-sm text-stone-600 dark:text-stone-400">
          {formatDate(student.enrolledAt)}
        </div>

        {/* Last Access - fixed width */}
        <div className="w-28 text-sm text-stone-600 dark:text-stone-400">
          {getLastAccessLabel(student.lastAccessAt)}
        </div>

        {/* Actions - fixed width */}
        <div className="w-20 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onView}
            className="p-2 text-stone-500 hover:text-[#143F3B] dark:text-stone-400 dark:hover:text-[#6B9B7A] hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onEmail}
            className="p-2 text-stone-500 hover:text-[#143F3B] dark:text-stone-400 dark:hover:text-[#6B9B7A] hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            title="Enviar email"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar />
            <div className="min-w-0">
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                {student.name}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                {student.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onView}
              className="p-2 text-stone-500 hover:text-[#143F3B] dark:text-stone-400 dark:hover:text-[#6B9B7A] hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEmail}
              className="p-2 text-stone-500 hover:text-[#143F3B] dark:text-stone-400 dark:hover:text-[#6B9B7A] hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span>Inscrito: {formatDate(student.enrolledAt)}</span>
          <span>·</span>
          <span>{getLastAccessLabel(student.lastAccessAt)}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressColor(student.progress)}`}
              style={{ width: `${student.progress}%` }}
            />
          </div>
          <span className={`text-xs font-medium tabular-nums ${
            student.progress === 100
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-stone-600 dark:text-stone-400'
          }`}>
            {student.completedLessons}/{student.totalLessons} lecciones
          </span>
        </div>
      </div>
    </div>
  )
}
