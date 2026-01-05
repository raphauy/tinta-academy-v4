import { Users, Clock, MapPin, Wifi, Calendar, ChevronRight, FileEdit } from 'lucide-react'
import type { Course } from '@/../product/sections/educator-panel/types'

export interface CourseQuickCardProps {
  course: Course
  onView?: () => void
  onEdit?: () => void
}

export function CourseQuickCard({ course, onView, onEdit }: CourseQuickCardProps) {
  const isOnline = course.modality === 'online'
  const isDraft = course.status === 'draft'

  const getTypeLabel = () => {
    switch (course.type) {
      case 'wset': return 'WSET'
      case 'taller': return 'Taller'
      case 'cata': return 'Cata'
      case 'curso': return 'Curso'
      default: return course.type
    }
  }

  const getTypeColor = () => {
    switch (course.type) {
      case 'wset': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
      case 'taller': return 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300'
      case 'cata': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
      default: return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
    }
  }

  const formatPrice = () => {
    if (course.priceUSD === 0 || course.priceUYU === 0) return 'Gratis'
    if (course.priceUSD) return `US$ ${course.priceUSD}`
    if (course.priceUYU) return `$ ${course.priceUYU.toLocaleString()}`
    return 'Sin precio'
  }

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
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${getTypeColor()}`}>
            {getTypeLabel()}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
            isOnline
              ? 'bg-[#143F3B] text-white'
              : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Presencial'}
          </span>
          {isDraft && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
              Borrador
            </span>
          )}
        </div>

        {/* Title and price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors">
            {course.title}
          </h3>
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
              {course.averageProgress !== undefined && course.averageProgress > 0 && (
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
              {course.eventDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(course.eventDate).toLocaleDateString('es-UY', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              )}
            </>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.duration}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-stone-100 dark:border-stone-800">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
          <FileEdit className="w-3.5 h-3.5" />
          Editar
        </button>
        <div className="w-px bg-stone-100 dark:bg-stone-800" />
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
        >
          Ver detalles
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
