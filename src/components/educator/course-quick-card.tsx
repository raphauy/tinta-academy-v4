import Link from 'next/link'
import { Users, Clock, MapPin, Monitor, Calendar, ChevronRight, FileEdit, GraduationCap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { EducatorCourseQuickAccess } from '@/services/educator-service'
import { toLocalDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export interface CourseQuickCardProps {
  course: EducatorCourseQuickAccess
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'verde-uva' | 'muted' | 'neutral' | 'warning' | 'info' | 'success' | 'orange' | 'purple' | 'stone'

export function CourseQuickCard({ course }: CourseQuickCardProps) {
  const isOnline = course.modality === 'online'

  const getTypeLabel = () => {
    switch (course.type) {
      case 'wset':
        return 'WSET'
      case 'taller':
        return 'Taller'
      case 'cata':
        return 'Cata'
      case 'curso':
        return 'Curso'
      default:
        return course.type
    }
  }

  const getTypeVariant = (): BadgeVariant => {
    switch (course.type) {
      case 'wset':
        return 'default'
      case 'taller':
      case 'cata':
        return 'verde-uva'
      default:
        return 'muted'
    }
  }

  const getStatusLabel = () => {
    switch (course.status) {
      case 'draft':
        return 'Borrador'
      case 'announced':
        return 'Anunciado'
      case 'enrolling':
        return 'Inscribiendo'
      case 'full':
        return 'Completo'
      case 'in_progress':
        return 'En curso'
      case 'finished':
        return 'Finalizado'
      case 'available':
        return 'Disponible'
      default:
        return course.status
    }
  }

  const getStatusVariant = (): BadgeVariant => {
    switch (course.status) {
      case 'draft':
        return 'warning'
      case 'announced':
        return 'info'
      case 'enrolling':
      case 'available':
        return 'success'
      case 'full':
        return 'orange'
      case 'in_progress':
        return 'purple'
      case 'finished':
      default:
        return 'stone'
    }
  }

  const formatPrice = () => {
    if (course.priceUSD === 0) return 'Gratis'
    if (course.priceUSD) return `USD ${course.priceUSD}`
    return 'Sin precio'
  }

  const formatDate = (date: Date | null) => {
    if (!date) return null
    try {
      return format(toLocalDate(date), 'd MMM.', { locale: es })
    } catch {
      return null
    }
  }

  const isDraft = course.status === 'draft'

  return (
    <div
      className={`group rounded-xl border transition-all duration-200 hover:shadow-md ${
        isDraft
          ? 'bg-stone-50 dark:bg-stone-900/50 border-dashed border-stone-300 dark:border-stone-700'
          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="p-3">
        {/* Tags row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {/* Type badge */}
          <Badge variant={getTypeVariant()}>
            {getTypeLabel()}
          </Badge>

          {/* Modality badge */}
          <Badge variant="neutral">
            {isOnline ? (
              <>
                <Monitor className="w-3 h-3" />
                Online
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Presencial
              </>
            )}
          </Badge>

          {/* Status badge */}
          <Badge variant={getStatusVariant()}>
            {getStatusLabel()}
          </Badge>
        </div>

        {/* Title and price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/educator/courses/${course.id}/edit`}
            className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] transition-colors"
          >
            {course.title}
          </Link>
          <span className="text-sm font-bold text-[#143F3B] dark:text-[#6B9B7A] flex-shrink-0">
            {formatPrice()}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          {isOnline ? (
            <>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.totalStudents || 0}
              </span>
              {course.averageProgress > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-12 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#143F3B] dark:bg-[#6B9B7A] rounded-full"
                      style={{ width: `${course.averageProgress}%` }}
                    />
                  </div>
                  {course.averageProgress}%
                </span>
              )}
            </>
          ) : (
            <>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {course.enrolledCount || 0}/{course.maxCapacity || 0}
              </span>
              {course.startDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(course.startDate)}
                </span>
              )}
            </>
          )}
          {course.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-stone-100 dark:border-stone-800">
        <Link
          href={`/educator/courses/${course.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
          <FileEdit className="w-3.5 h-3.5" />
          Editar
        </Link>
        <div className="w-px bg-stone-100 dark:bg-stone-800" />
        <Link
          href={`/educator/courses/${course.id}/students`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          {course.totalStudents || course.enrolledCount || 0} Estudiantes
        </Link>
        <div className="w-px bg-stone-100 dark:bg-stone-800" />
        <Link
          href={`/cursos/${course.slug}`}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
          Ver detalles
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
