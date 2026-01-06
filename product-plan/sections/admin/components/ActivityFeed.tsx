import React from 'react'
import {
  UserPlus,
  CreditCard,
  GraduationCap,
  User,
  Clock,
  Tag,
  CheckCircle2
} from 'lucide-react'
import type { RecentActivity } from '@/../product/sections/admin/types'

export interface ActivityFeedProps {
  activities: RecentActivity[]
  maxItems?: number
}

function getActivityIcon(type: RecentActivity['type']) {
  const iconClass = 'w-4 h-4'
  switch (type) {
    case 'enrollment':
      return <UserPlus className={iconClass} />
    case 'payment':
      return <CreditCard className={iconClass} />
    case 'course_completed':
      return <GraduationCap className={iconClass} />
    case 'new_user':
      return <User className={iconClass} />
    case 'transfer_pending':
      return <Clock className={iconClass} />
    case 'coupon_used':
      return <Tag className={iconClass} />
    default:
      return <CheckCircle2 className={iconClass} />
  }
}

function getActivityColor(type: RecentActivity['type']) {
  switch (type) {
    case 'enrollment':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400'
      }
    case 'payment':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400'
      }
    case 'course_completed':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400'
      }
    case 'new_user':
      return {
        bg: 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20',
        text: 'text-[#143F3B] dark:text-[#6B9B7A]'
      }
    case 'transfer_pending':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400'
      }
    case 'coupon_used':
      return {
        bg: 'bg-[#99757C]/10 dark:bg-[#99757C]/20',
        text: 'text-[#99757C] dark:text-[#DDBBC0]'
      }
    default:
      return {
        bg: 'bg-stone-100 dark:bg-stone-800',
        text: 'text-stone-600 dark:text-stone-400'
      }
  }
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })
}

export function ActivityFeed({ activities, maxItems = 8 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-800">
        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
          Actividad Reciente
        </h3>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-stone-100 dark:divide-stone-800">
        {displayActivities.map((activity) => {
          const colors = getActivityColor(activity.type)
          return (
            <div
              key={activity.id}
              className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colors.bg}`}
                >
                  <span className={colors.text}>
                    {getActivityIcon(activity.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-snug">
                    {activity.description}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {displayActivities.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No hay actividad reciente
          </p>
        </div>
      )}
    </div>
  )
}
