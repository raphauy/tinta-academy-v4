import { useState } from 'react'
import {
  Eye,
  Edit,
  MapPin,
  GraduationCap,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { Student } from '@/../product/sections/admin/types'

interface StudentRowProps {
  student: Student
  onView?: () => void
  onEdit?: () => void
}

interface AvatarProps {
  src: string | null
  name: string
  initials: string
}

function Avatar({ src, name, initials }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (!src || imgError) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      onError={() => setImgError(true)}
    />
  )
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
  return `Hace ${Math.floor(diffDays / 365)} años`
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function StudentRow({ student, onView, onEdit }: StudentRowProps) {
  const fullName = `${student.firstName} ${student.lastName}`
  const isRecentlyActive = new Date(student.lastActivityAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-gris-tinta-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar
            src={student.avatarUrl}
            name={fullName}
            initials={getInitials(student.firstName, student.lastName)}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                {fullName}
              </h3>
              {isRecentlyActive && (
                <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" title="Activo recientemente" />
              )}
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
              {student.email}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-stone-400 dark:text-stone-500">
              <MapPin className="w-3 h-3" />
              <span>{student.city}, {student.country}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onView}
              className="p-2 text-stone-400 hover:text-teal-600 dark:text-stone-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={onEdit}
              className="p-2 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-gris-tinta-700 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 pl-13">
          <div className="flex items-center gap-1.5 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span className="text-stone-600 dark:text-stone-300">
              {student.enrollmentsCount} inscripciones
            </span>
            {student.completedCourses > 0 && (
              <span className="text-teal-600 dark:text-teal-400">
                ({student.completedCourses} completados)
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-stone-900 dark:text-stone-100">
            {formatCurrency(student.totalSpent)}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        {/* Student Info */}
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <Avatar
            src={student.avatarUrl}
            name={fullName}
            initials={getInitials(student.firstName, student.lastName)}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-stone-900 dark:text-stone-100 truncate">
                {fullName}
              </h3>
              {isRecentlyActive && (
                <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" title="Activo recientemente" />
              )}
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
              {student.email}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="col-span-2 min-w-0">
          <div className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
            <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
            <span className="truncate">{student.city}</span>
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">
            {student.country}
          </p>
        </div>

        {/* Enrollments */}
        <div className="col-span-2 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {student.enrollmentsCount}
              </span>
            </div>
            {student.completedCourses > 0 && (
              <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{student.completedCourses}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {formatRelativeDate(student.lastActivityAt)}
          </p>
        </div>

        {/* Total Spent */}
        <div className="col-span-2 text-center">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {formatCurrency(student.totalSpent)}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            USD total
          </p>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onView}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-gris-tinta-700 rounded-lg transition-colors"
          >
            <Edit className="w-3.5 h-3.5" />
            Editar
          </button>
        </div>
      </div>
    </div>
  )
}
