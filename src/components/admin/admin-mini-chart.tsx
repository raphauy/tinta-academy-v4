import type { ChartDataPoint } from '@/services/admin-service'

export interface AdminMiniChartProps {
  data: ChartDataPoint[]
  label: string
  color?: 'primary' | 'secondary' | 'success'
  suffix?: string
  prefix?: string
  formatValue?: (value: number) => string
}

export function AdminMiniChart({
  data,
  label,
  color = 'primary',
  suffix = '',
  prefix = '',
  formatValue,
}: AdminMiniChartProps) {
  if (!data || data.length === 0) return null

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const range = maxValue - minValue || 1

  const width = 200
  const height = 60
  const padding = 4

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y =
      height - padding - ((d.value - minValue) / range) * (height - padding * 2)
    return { x, y, value: d.value, month: d.month }
  })

  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  const colorConfig = {
    primary: {
      stroke: '#143F3B',
      fill: '#143F3B',
      dot: 'bg-[#143F3B] dark:bg-[#6B9B7A]',
      darkStroke: 'dark:stroke-[#6B9B7A]',
    },
    secondary: {
      stroke: '#99757C',
      fill: '#99757C',
      dot: 'bg-[#99757C] dark:bg-[#DDBBC0]',
      darkStroke: 'dark:stroke-[#DDBBC0]',
    },
    success: {
      stroke: '#059669',
      fill: '#059669',
      dot: 'bg-emerald-600 dark:bg-emerald-400',
      darkStroke: 'dark:stroke-emerald-400',
    },
  }

  const colors = colorConfig[color]
  const currentValue = data[data.length - 1]?.value || 0
  const previousValue = data[data.length - 2]?.value || 0
  const change = currentValue - previousValue
  const changePercent =
    previousValue > 0 ? ((change / previousValue) * 100).toFixed(0) : 0

  const displayValue = formatValue
    ? formatValue(currentValue)
    : `${prefix}${currentValue.toLocaleString()}${suffix}`

  const gradientId = `admin-gradient-${color}-${label.replace(/\s/g, '')}`

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-0.5">
            {label}
          </p>
          <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {displayValue}
          </p>
        </div>
        {change !== 0 && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
              change > 0
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
            }`}
          >
            {change > 0 ? '+' : ''}
            {changePercent}%
          </span>
        )}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-16"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.fill} stopOpacity="0.2" />
              <stop offset="100%" stopColor={colors.fill} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill={`url(#${gradientId})`} />

          <path
            d={linePath}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={colors.darkStroke}
          />
        </svg>

        <div
          className={`absolute w-2.5 h-2.5 rounded-full -translate-x-1/2 -translate-y-1/2 ${colors.dot}`}
          style={{
            left: `${(points[points.length - 1].x / width) * 100}%`,
            top: `${(points[points.length - 1].y / height) * 100}%`,
          }}
        />
      </div>

      <div className="flex justify-between mt-1 text-[10px] text-stone-400 dark:text-stone-500">
        {data.map((d, i) => (
          <span
            key={i}
            className={
              i === data.length - 1
                ? 'font-medium text-stone-500 dark:text-stone-400'
                : ''
            }
          >
            {d.month}
          </span>
        ))}
      </div>
    </div>
  )
}
