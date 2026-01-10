'use client'

import {
  Laptop,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import type { AdminCourse } from '@/services/course-service'

interface AdminCourseCardProps {
  course: AdminCourse
  onViewDetails?: () => void
  onViewEnrollments?: () => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusConfig: Record<string, { label: string; className: string }> = {
  announced: {
    label: 'Anunciado',
    className:
      'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  enrolling: {
    label: 'Inscribiendo',
    className:
      'bg-[#143F3B]/10 text-[#143F3B] dark:bg-[#143F3B]/20 dark:text-[#6B9B7A]',
  },
  full: {
    label: 'Completo',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  in_progress: {
    label: 'En curso',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  available: {
    label: 'Disponible',
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  finished: {
    label: 'Finalizado',
    className:
      'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  },
  draft: {
    label: 'Borrador',
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
}

export function AdminCourseCard({
  course,
  onViewDetails,
  onViewEnrollments,
}: AdminCourseCardProps) {
  const isOnline = course.modality === 'online'
  const status = statusConfig[course.status] || statusConfig.draft
  const hasEnrollments = course.enrolledCount > 0
  const capacityPercent = course.maxCapacity
    ? Math.round((course.enrolledCount / course.maxCapacity) * 100)
    : null

  return (
    <div className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#143F3B]/30 dark:hover:border-[#6B9B7A]/30 hover:shadow-lg hover:shadow-[#143F3B]/5">
      <div className="relative h-28 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-850 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <pattern
              id={`grid-${course.id}`}
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#grid-${course.id})`} />
          </svg>
        </div>

        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
              isOnline
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
            }`}
          >
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

        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
            {course.type}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            por {course.educator.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
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
            <p
              className={`text-sm font-semibold ${
                hasEnrollments
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-stone-900 dark:text-stone-100'
              }`}
            >
              {course.enrolledCount}
              {course.maxCapacity && (
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  /{course.maxCapacity}
                </span>
              )}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Inscritos
            </p>
          </button>

          <div className="text-center py-2 px-1 rounded-lg bg-stone-50 dark:bg-stone-800">
            <div className="flex items-center justify-center gap-1 text-stone-400 dark:text-stone-500 mb-0.5">
              <DollarSign className="w-3 h-3" />
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {formatCurrency(course.totalRevenue)}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              Ingresos
            </p>
          </div>
        </div>

        {capacityPercent !== null && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-stone-500 dark:text-stone-400">
                Capacidad
              </span>
              <span
                className={`font-medium ${
                  capacityPercent >= 90
                    ? 'text-red-600 dark:text-red-400'
                    : capacityPercent >= 70
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-[#143F3B] dark:text-[#6B9B7A]'
                }`}
              >
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
                      : 'bg-[#143F3B]'
                }`}
                style={{ width: `${Math.min(capacityPercent, 100)}%` }}
              />
            </div>
          </div>
        )}

        {isOnline && course.completionRate > 0 && (
          <div className="flex items-center gap-3 mb-3 py-2 px-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <BarChart3 className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <div className="flex-1 text-xs">
              <span className="text-stone-600 dark:text-stone-300">
                Completado:{' '}
              </span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {course.completionRate}%
              </span>
              <span className="text-stone-400 dark:text-stone-500 mx-2">
                ·
              </span>
              <span className="text-stone-600 dark:text-stone-300">
                Progreso:{' '}
              </span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {course.averageProgress}%
              </span>
            </div>
          </div>
        )}

        {course.startDate && (
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            <span>Inicia {formatDate(course.startDate)}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-700">
          <div>
            <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {formatCurrency(course.priceUSD)}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500 ml-1">
              USD
            </span>
          </div>

          <button
            onClick={onViewDetails}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:text-[#0e2c29] dark:hover:text-[#8cc49a] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20 rounded-lg transition-colors"
          >
            Ver detalles
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
