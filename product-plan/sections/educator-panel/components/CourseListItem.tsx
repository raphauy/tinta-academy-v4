import { Users, Clock, MapPin, Wifi, Calendar, MoreVertical, Eye, Pencil, Trash2, Copy, Upload } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Course } from '@/../product/sections/educator-panel/types'

export interface CourseListItemProps {
  course: Course
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onPublish?: () => void
  onDuplicate?: () => void
}

export function CourseListItem({
  course,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate
}: CourseListItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isOnline = course.modality === 'online'
  const isDraft = course.status === 'draft'

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const getStatusLabel = () => {
    switch (course.status) {
      case 'draft': return 'Borrador'
      case 'published': return 'Publicado'
      case 'finished': return 'Finalizado'
      default: return course.status
    }
  }

  const getStatusColor = () => {
    switch (course.status) {
      case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'published': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      case 'finished': return 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
      default: return 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
    }
  }

  const formatPrice = () => {
    if (course.priceUSD === 0 || course.priceUYU === 0) return 'Gratis'
    if (course.priceUSD) return `US$ ${course.priceUSD}`
    if (course.priceUYU) return `$ ${course.priceUYU.toLocaleString()}`
    return 'Sin precio'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div
      className={`group bg-white dark:bg-stone-900 rounded-xl border transition-all duration-200 hover:shadow-md ${
        isDraft
          ? 'border-dashed border-stone-300 dark:border-stone-700'
          : 'border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Course Image */}
          <div className="w-full sm:w-32 h-20 sm:h-20 rounded-lg bg-stone-100 dark:bg-stone-800 overflow-hidden flex-shrink-0">
            <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-800 flex items-center justify-center">
              <span className="text-2xl">🍷</span>
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            {/* Tags row */}
            <div className="flex items-center flex-wrap gap-1.5 mb-2">
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
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor()}`}>
                {getStatusLabel()}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1 line-clamp-1 group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors">
              {course.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1 mb-3">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
              {isOnline ? (
                <>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.totalStudents || 0} alumnos
                  </span>
                  {course.averageProgress !== undefined && course.averageProgress > 0 && (
                    <span className="flex items-center gap-1">
                      Progreso: {course.averageProgress}%
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.enrolledCount || 0}/{course.maxCapacity || 0} inscritos
                  </span>
                  {course.eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(course.eventDate)}
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

          {/* Price & Actions */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-0">
            <span className="text-lg font-bold text-[#143F3B] dark:text-[#6B9B7A]">
              {formatPrice()}
            </span>

            {/* Actions Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700 py-1 z-10">
                  <button
                    onClick={() => { onView?.(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver curso
                  </button>
                  <button
                    onClick={() => { onEdit?.(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  {isDraft && (
                    <button
                      onClick={() => { onPublish?.(); setMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Publicar
                    </button>
                  )}
                  <button
                    onClick={() => { onDuplicate?.(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </button>
                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />
                  <button
                    onClick={() => { onDelete?.(); setMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
