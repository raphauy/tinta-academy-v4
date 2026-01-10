import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface AdminMetricCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    label: string
  }
  subtitle?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
  size?: 'default' | 'compact'
}

export function AdminMetricCard({
  label,
  value,
  icon,
  trend,
  subtitle,
  variant = 'default',
  size = 'default',
}: AdminMetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="w-3 h-3" />
    if (trend.value < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: 'bg-[#143F3B] text-white',
          label: 'text-white/70',
          value: 'text-white',
          icon: 'bg-white/20 text-white',
          trendUp: 'text-emerald-300',
          trendDown: 'text-rose-300',
          trendNeutral: 'text-white/60',
        }
      case 'success':
        return {
          container:
            'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white',
          label: 'text-white/80',
          value: 'text-white',
          icon: 'bg-white/20 text-white',
          trendUp: 'text-emerald-100',
          trendDown: 'text-rose-200',
          trendNeutral: 'text-white/60',
        }
      case 'warning':
        return {
          container:
            'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
          label: 'text-white/80',
          value: 'text-white',
          icon: 'bg-white/20 text-white',
          trendUp: 'text-emerald-200',
          trendDown: 'text-rose-200',
          trendNeutral: 'text-white/60',
        }
      default:
        return {
          container:
            'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800',
          label: 'text-stone-500 dark:text-stone-400',
          value: 'text-stone-900 dark:text-stone-100',
          icon: 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20 text-[#143F3B] dark:text-[#6B9B7A]',
          trendUp: 'text-emerald-600 dark:text-emerald-400',
          trendDown: 'text-rose-600 dark:text-rose-400',
          trendNeutral: 'text-stone-500 dark:text-stone-400',
        }
    }
  }

  const styles = getVariantStyles()

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return styles.trendUp
    if (trend.value < 0) return styles.trendDown
    return styles.trendNeutral
  }

  return (
    <div
      className={`rounded-xl transition-all duration-200 hover:shadow-md h-full ${styles.container} ${
        size === 'compact' ? 'p-3' : 'p-4'
      }`}
    >
      <div className="flex items-start justify-between gap-3 h-full">
        <div className="flex-1 min-w-0 flex flex-col h-full">
          <p className={`text-xs font-medium mb-1 ${styles.label}`}>{label}</p>

          <p
            className={`font-bold tracking-tight ${styles.value} ${
              size === 'compact' ? 'text-xl' : 'text-2xl'
            }`}
          >
            {value}
          </p>

          {subtitle && (
            <p className={`mt-auto pt-2 text-xs ${styles.label}`}>{subtitle}</p>
          )}
          {trend && !subtitle && (
            <div
              className={`flex items-center gap-1 mt-auto pt-2 text-xs font-medium ${getTrendColor()}`}
            >
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>

        <div
          className={`flex-shrink-0 inline-flex items-center justify-center rounded-lg ${styles.icon} ${
            size === 'compact' ? 'w-8 h-8' : 'w-9 h-9'
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
