import { format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

/**
 * Get user's timezone from browser (client-side only)
 * Returns IANA timezone string like "America/Argentina/Buenos_Aires"
 */
export function getUserTimezone(): string {
  if (typeof window === 'undefined') {
    return 'America/Argentina/Buenos_Aires' // Server-side fallback
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format a date in a specific timezone
 * @param date - The date to format (UTC or Date object)
 * @param timezone - IANA timezone string (e.g., "America/Argentina/Buenos_Aires")
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
 * Convert a local time in a specific timezone to UTC for storage
 * @param date - Date in local timezone
 * @param timezone - IANA timezone string
 * @returns UTC Date object
 */
export function toUTC(date: Date | string, timezone: string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return fromZonedTime(dateObj, timezone)
}

/**
 * Convert a datetime-local input value to UTC Date
 * datetime-local returns format: "2024-01-15T14:30"
 * @param datetimeLocalValue - Value from datetime-local input
 * @param timezone - User's timezone
 * @returns UTC Date object
 */
export function datetimeLocalToUTC(
  datetimeLocalValue: string,
  timezone: string
): Date {
  // datetime-local gives us a string like "2024-01-15T14:30"
  // We need to interpret this as being in the user's timezone
  return fromZonedTime(new Date(datetimeLocalValue), timezone)
}

/**
 * Convert a UTC date to datetime-local format for input value
 * @param date - UTC Date object
 * @param timezone - User's timezone
 * @returns String in "YYYY-MM-DDTHH:mm" format
 */
export function utcToDatetimeLocal(date: Date, timezone: string): string {
  const zonedDate = toZonedTime(date, timezone)
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm")
}

/**
 * Get a human-readable timezone label
 * @param timezone - IANA timezone string
 * @returns Human-readable label like "Argentina (GMT-3)"
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
