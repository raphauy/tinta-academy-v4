'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface LocalDateTimeProps {
  date: Date | string | null | undefined
  formatStr?: string
  fallback?: string
}

/**
 * Client component that displays a date/time in the user's local timezone.
 *
 * Since this runs on the client, it automatically uses the browser's timezone.
 */
export function LocalDateTime({
  date,
  formatStr = "d 'de' MMMM 'de' yyyy, HH:mm",
  fallback = '-',
}: LocalDateTimeProps) {
  if (!date) {
    return <span>{fallback}</span>
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return <span>{fallback}</span>
  }

  const formatted = format(dateObj, formatStr, { locale: es })

  return <time dateTime={dateObj.toISOString()}>{formatted}</time>
}
