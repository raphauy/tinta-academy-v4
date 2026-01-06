import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a UTC date to a local date preserving the UTC day/month/year.
 * Use this when formatting dates that are stored as UTC midnight but represent a calendar date.
 * For example: `2024-11-08T00:00:00.000Z` → Nov 8 (not Nov 7 in UTC-3 timezone)
 */
export function toLocalDate(date: Date | string): Date {
  const d = new Date(date)
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}
