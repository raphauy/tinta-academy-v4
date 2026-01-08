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

/**
 * Generates a URL-safe slug from a title.
 * Handles Spanish characters (accents, ñ) and normalizes spaces.
 */
export function generateSlug(title: string): string {
  if (!title) return ''

  const replacements: Array<{ from: string; to: string }> = [
    { from: 'á', to: 'a' },
    { from: 'é', to: 'e' },
    { from: 'í', to: 'i' },
    { from: 'ó', to: 'o' },
    { from: 'ú', to: 'u' },
    { from: 'ñ', to: 'n' },
    { from: 'Á', to: 'a' },
    { from: 'É', to: 'e' },
    { from: 'Í', to: 'i' },
    { from: 'Ó', to: 'o' },
    { from: 'Ú', to: 'u' },
    { from: 'Ñ', to: 'n' },
  ]

  let slug = title.toLowerCase()

  for (const { from, to } of replacements) {
    slug = slug.replaceAll(from, to)
  }

  // Remove multiple spaces, then replace spaces with hyphens
  slug = slug.replace(/\s+/g, ' ').trim().replaceAll(' ', '-')

  // Remove any character that's not alphanumeric or hyphen
  slug = slug.replace(/[^a-z0-9-]/g, '')

  // Remove consecutive hyphens
  slug = slug.replace(/-+/g, '-')

  return slug
}
