interface ProgressBarProps {
  percentage: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function ProgressBar({ percentage, size = 'md', showLabel = true }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 ${height} bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ease-out ${
            percentage === 100
              ? 'bg-emerald-500 dark:bg-emerald-400'
              : 'bg-[#143F3B] dark:bg-[#4A7C59]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-xs font-medium tabular-nums ${
          percentage === 100
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-stone-500 dark:text-stone-400'
        }`}>
          {percentage}%
        </span>
      )}
    </div>
  )
}
