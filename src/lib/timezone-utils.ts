import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

/**
 * Get user's timezone from browser (client-side only)
 * Returns IANA timezone string like "America/Argentina/Buenos_Aires"
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'America/Montevideo' // Server-side fallback
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format a date in a specific timezone
 * @param date - The date to format (UTC or Date object)
 * @param timezone - IANA timezone string (e.g., "America/Montevideo")
 * @param formatStr - date-fns format string (e.g., "dd/MM/yyyy HH:mm")
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  formatStr: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const zonedDate = toZonedTime(dateObj, timezone)
  return format(zonedDate, formatStr)
}

/**
 * Convert a datetime-local input value to UTC ISO string
 * datetime-local returns format: "2024-01-15T14:30" (browser local time)
 *
 * JavaScript's new Date() with this format interprets it as LOCAL time,
 * then toISOString() converts to UTC automatically.
 *
 * @param datetimeLocalValue - Value from datetime-local input
 * @returns UTC ISO string
 */
export function datetimeLocalToUTC(
  datetimeLocalValue: string,
  _timezone?: string // Kept for API compatibility, but not needed
): Date {
  // new Date("2024-01-15T14:30") interprets as browser's local time
  // The Date object internally stores UTC
  return new Date(datetimeLocalValue)
}

/**
 * Convert a UTC date to datetime-local format for input value
 * Uses browser's local timezone automatically.
 *
 * @param date - Date object (internally UTC)
 * @returns String in "YYYY-MM-DDTHH:mm" format in local time
 */
export function utcToDatetimeLocal(date: Date, _timezone?: string): string {
  // date.getFullYear(), getMonth(), etc. return values in LOCAL timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Get a human-readable timezone label
 * @param timezone - IANA timezone string
 * @returns Human-readable label like "Montevideo (GMT-3)"
 */
export function getTimezoneLabel(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('es-AR', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    })
    const parts = formatter.formatToParts(now)
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value || ''

    // Extract city/region name from IANA timezone
    const city = timezone.split('/').pop()?.replace(/_/g, ' ') || timezone

    return `${city} (${offset})`
  } catch {
    return timezone
  }
}
