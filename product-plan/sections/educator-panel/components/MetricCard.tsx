import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface MetricCardProps {
  label: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    label: string
  }
  variant?: 'default' | 'highlight'
}

export function MetricCard({ label, value, icon, trend, variant = 'default' }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="w-3 h-3" />
    if (trend.value < 0) return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return 'text-emerald-600 dark:text-emerald-400'
    if (trend.value < 0) return 'text-rose-600 dark:text-rose-400'
    return 'text-stone-500 dark:text-stone-400'
  }

  return (
    <div
      className={`rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
        variant === 'highlight'
          ? 'bg-[#143F3B] text-white'
          : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Label */}
          <p
            className={`text-xs font-medium mb-1 ${
              variant === 'highlight'
                ? 'text-white/70'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {label}
          </p>

          {/* Value */}
          <p
            className={`text-2xl font-bold tracking-tight ${
              variant === 'highlight'
                ? 'text-white'
                : 'text-stone-900 dark:text-stone-100'
            }`}
          >
            {value}
          </p>

          {/* Trend */}
          {trend && (
            <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
              variant === 'highlight'
                ? trend.value > 0 ? 'text-emerald-300' : trend.value < 0 ? 'text-rose-300' : 'text-white/60'
                : getTrendColor()
            }`}>
              {getTrendIcon()}
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg ${
            variant === 'highlight'
              ? 'bg-white/20'
              : 'bg-[#143F3B]/10 dark:bg-[#143F3B]/20'
          }`}
        >
          <span className={variant === 'highlight' ? 'text-white' : 'text-[#143F3B] dark:text-[#6B9B7A]'}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  )
}
