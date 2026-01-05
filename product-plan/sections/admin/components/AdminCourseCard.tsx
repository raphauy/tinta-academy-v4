import {
  Laptop,
  MapPin,
  Users,
  Eye,
  DollarSign,
  Calendar,
  BarChart3,
  ChevronRight
} from 'lucide-react'
import type { AdminCourse } from '@/../product/sections/admin/types'

interface AdminCourseCardProps {
  course: AdminCourse
  onViewDetails?: () => void
  onViewObservers?: () => void
  onViewEnrollments?: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const statusConfig: Record<string, { label: string; className: string }> = {
  enrolling: {
    label: 'Inscribiendo',
    className: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
  },
  available: {
    label: 'Disponible',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
  },
  finished: {
    label: 'Finalizado',
    className: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
  },
  draft: {
    label: 'Borrador',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  }
}

export function AdminCourseCard({ course, onViewDetails, onViewObservers, onViewEnrollments }: AdminCourseCardProps) {
  const isOnline = course.modality === 'online'
  const status = statusConfig[course.status] || statusConfig.draft
  const hasObservers = course.observersCount > 0
  const hasEnrollments = course.enrolledCount > 0
  const capacityPercent = course.maxCapacity
    ? Math.round((course.enrolledCount / course.maxCapacity) * 100)
    : null

  return (
    <div className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/5">
      {/* Top Section with Image & Status */}
      <div className="relative h-28 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-850 overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id={`grid-${course.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#grid-${course.id})`} />
          </svg>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}>
            {status.label}
          </span>
        </div>

        {/* Modality Badge */}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
            isOnline
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
          }`}>
            {isOnline ? (
              <>
                <Laptop className="w-3 h-3" />
                Online
              </>
            ) : (
              <>
                <MapPin className="w-3 h-3" />
                Presencial
              </>
            )}
          </span>
        </div>

        {/* Course Type Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
            {course.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Educator */}
        <div className="mb-3">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            por {course.educatorName}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Enrolled */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewEnrollments?.()
            }}
            disabled={!hasEnrollments}
            className={`text-center py-2 px-1 rounded-lg transition-colors ${
              hasEnrollments
                ? 'bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer'
                : 'bg-stone-50 dark:bg-stone-800 cursor-default'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-stone-400 dark:text-stone-500 mb-0.5">
              <Users className="w-3 h-3" />
            </div>
            <p className={`text-sm font-semibold ${
              hasEnrollments
                ? 'text-blue-700 dark:text-blue-400'
                : 'text-stone-900 dark:text-stone-100'
            }`}>
              {course.enrolledCount}
              {course.maxCapacity && (
                <span className="text-xs text-stone-400 dark:text-stone-500">/{course.maxCapacity}</span>
              )}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Inscritos</p>
          </button>

          {/* Observers */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewObservers?.()
            }}
            disabled={!hasObservers}
            className={`text-center py-2 px-1 rounded-lg transition-colors ${
              hasObservers
                ? 'bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 cursor-pointer'
                : 'bg-stone-50 dark:bg-stone-800 cursor-default'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-stone-400 dark:text-stone-500 mb-0.5">
              <Eye className="w-3 h-3" />
            </div>
            <p className={`text-sm font-semibold ${
              hasObservers
                ? 'text-teal-700 dark:text-teal-400'
                : 'text-stone-900 dark:text-stone-100'
            }`}>
              {course.observersCount}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Interesados</p>
          </button>

          {/* Revenue */}
          <div className="text-center py-2 px-1 rounded-lg bg-stone-50 dark:bg-stone-800">
            <div className="flex items-center justify-center gap-1 text-stone-400 dark:text-stone-500 mb-0.5">
              <DollarSign className="w-3 h-3" />
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {formatCurrency(course.totalRevenue)}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">Ingresos</p>
          </div>
        </div>

        {/* Capacity Bar (for presencial courses) */}
        {capacityPercent !== null && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-stone-500 dark:text-stone-400">Capacidad</span>
              <span className={`font-medium ${
                capacityPercent >= 90
                  ? 'text-red-600 dark:text-red-400'
                  : capacityPercent >= 70
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-teal-600 dark:text-teal-400'
              }`}>
                {capacityPercent}%
              </span>
            </div>
            <div className="h-1.5 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercent >= 90
                    ? 'bg-red-500'
                    : capacityPercent >= 70
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Online Course Progress (for online courses) */}
        {isOnline && course.completionRate !== undefined && (
          <div className="flex items-center gap-3 mb-3 py-2 px-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <BarChart3 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <div className="flex-1 text-xs">
              <span className="text-stone-600 dark:text-stone-300">Completado: </span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">{course.completionRate}%</span>
              <span className="text-stone-400 dark:text-stone-500 mx-2">·</span>
              <span className="text-stone-600 dark:text-stone-300">Progreso: </span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">{course.averageProgress}%</span>
            </div>
          </div>
        )}

        {/* Start Date (for presencial) */}
        {course.startDate && (
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Inicia {formatDate(course.startDate)}</span>
          </div>
        )}

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-700">
          <div>
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {formatCurrency(course.priceUSD)}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 ml-1">USD</span>
          </div>

          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
          >
            Ver detalles
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
