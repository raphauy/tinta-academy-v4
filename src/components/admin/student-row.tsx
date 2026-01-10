'use client'

import { useState, useMemo } from 'react'
import {
  Eye,
  Edit,
  MapPin,
  GraduationCap,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { StudentWithStats } from '@/services/student-service'

interface StudentRowProps {
  student: StudentWithStats
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
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#143F3B] to-[#1e5a54] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
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

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatSpent(usd: number, uyu: number): string {
  const parts: string[] = []
  if (usd > 0) parts.push(`USD ${formatNumber(usd)}`)
  if (uyu > 0) parts.push(`$ ${formatNumber(uyu)}`)
  return parts.length > 0 ? parts.join(' / ') : '-'
}

function formatRelativeDate(date: Date | null): string {
  if (!date) return 'Sin actividad'
  const dateObj = new Date(date)
  const now = new Date()
  const diffTime = now.getTime() - dateObj.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} dias`
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem.`
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`
  return `Hace ${Math.floor(diffDays / 365)} anos`
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function StudentRow({ student, onView, onEdit }: StudentRowProps) {
  const fullName = student.user.name ||
    `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
    student.user.email.split('@')[0]
  const isRecentlyActive = useMemo(() => {
    if (!student.lastActivityAt) return false
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(student.lastActivityAt).getTime() > sevenDaysAgo.getTime()
  }, [student.lastActivityAt])

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start gap-3">
          <Avatar
            src={student.user.image}
            name={fullName}
            initials={getInitials(student.firstName, student.lastName)}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onView}
                className="font-medium text-stone-900 dark:text-stone-100 truncate hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:underline transition-colors text-left"
              >
                {fullName}
              </button>
              {isRecentlyActive && (
                <span className="w-2 h-2 rounded-full bg-[#143F3B] dark:bg-[#6B9B7A] flex-shrink-0" title="Activo recientemente" />
              )}
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
              {student.user.email}
            </p>
            {student.city && (
              <div className="flex items-center gap-1 mt-1 text-xs text-stone-400 dark:text-stone-500">
                <MapPin className="w-3 h-3" />
                <span>{student.city}{student.country ? `, ${student.country}` : ''}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onView}
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 pl-13">
          <div className="flex items-center gap-1.5 text-xs">
            <GraduationCap className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
            <span className="text-stone-600 dark:text-stone-300">
              {student.enrollmentsCount} inscripciones
            </span>
            {student.completedCourses > 0 && (
              <span className="text-[#143F3B] dark:text-[#6B9B7A]">
                ({student.completedCourses} completados)
              </span>
            )}
          </div>
          <div className="text-xs font-medium text-stone-900 dark:text-stone-100">
            {formatSpent(student.totalSpentUSD, student.totalSpentUYU)}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="col-span-4 flex items-center gap-3 min-w-0">
          <Avatar
            src={student.user.image}
            name={fullName}
            initials={getInitials(student.firstName, student.lastName)}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <button
                onClick={onView}
                className="font-medium text-stone-900 dark:text-stone-100 truncate hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:underline transition-colors text-left"
              >
                {fullName}
              </button>
              {isRecentlyActive && (
                <span className="w-2 h-2 rounded-full bg-[#143F3B] dark:bg-[#6B9B7A] flex-shrink-0" title="Activo recientemente" />
              )}
            </div>
            <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
              {student.user.email}
            </p>
          </div>
        </div>

        <div className="col-span-2 min-w-0">
          {student.city ? (
            <>
              <div className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
                <MapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 flex-shrink-0" />
                <span className="truncate">{student.city}</span>
              </div>
              {student.country && (
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                  {student.country}
                </p>
              )}
            </>
          ) : (
            <span className="text-xs text-stone-400 dark:text-stone-500">-</span>
          )}
        </div>

        <div className="col-span-2 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex items-center gap-1">
              <GraduationCap className="w-4 h-4 text-stone-400 dark:text-stone-500" />
              <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {student.enrollmentsCount}
              </span>
            </div>
            {student.completedCourses > 0 && (
              <div className="flex items-center gap-1 text-[#143F3B] dark:text-[#6B9B7A]">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{student.completedCourses}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
            {formatRelativeDate(student.lastActivityAt)}
          </p>
        </div>

        <div className="col-span-2 text-center">
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {formatSpent(student.totalSpentUSD, student.totalSpentUYU)}
          </p>
          {(student.totalSpentUSD > 0 || student.totalSpentUYU > 0) && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              total
            </p>
          )}
        </div>

        <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            Ver
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
        </div>
      </div>
    </div>
  )
}
