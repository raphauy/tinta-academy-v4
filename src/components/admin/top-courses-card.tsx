'use client'

import { Trophy, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TopCourse } from '@/services/admin-service'

export interface TopCoursesCardProps {
  courses: TopCourse[]
  onViewCourse?: (id: string) => void
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatRevenue(usd: number, uyu: number): string {
  const parts: string[] = []
  if (usd > 0) parts.push(`USD ${formatNumber(usd)}`)
  if (uyu > 0) parts.push(`UYU ${formatNumber(uyu)}`)
  return parts.length > 0 ? parts.join(' / ') : '-'
}

export function TopCoursesCard({ courses, onViewCourse }: TopCoursesCardProps) {
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0:
        return {
          badge:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        }
      case 1:
        return {
          badge:
            'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300',
        }
      case 2:
        return {
          badge:
            'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        }
      default:
        return {
          badge:
            'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
        }
    }
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Cursos Destacados
        </h3>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {courses.map((course, index) => {
          const rankStyles = getRankStyles(index)
          return (
            <Button
              key={course.id}
              variant="ghost"
              onClick={() => onViewCourse?.(course.id)}
              className="w-full h-auto px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-left justify-start rounded-none"
            >
              <div className="flex items-start gap-3 w-full">
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rankStyles.badge}`}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                    {course.title}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                      <Users className="w-3 h-3" />
                      {course.enrollments} inscritos
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {formatRevenue(course.revenueUSD, course.revenueUYU)}
                    </span>
                  </div>
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {courses.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Trophy className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600 mb-2" />
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No hay cursos destacados aun
          </p>
        </div>
      )}
    </div>
  )
}
