import { prisma } from '@/lib/prisma'

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: 'asc'
    }
  })
}

/**
 * Generates a URL-safe slug from a tag name.
 * Handles Spanish characters (accents, ñ) and normalizes spaces.
 */
function generateTagSlug(name: string): string {
  if (!name) return ''

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

  let slug = name.toLowerCase()

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

/**
 * Creates a new tag with the given name.
 * Automatically generates a slug from the name.
 * Returns existing tag if slug already exists.
 */
export async function createTag(name: string) {
  const slug = generateTagSlug(name)

  // Check if tag with this slug already exists
  const existing = await prisma.tag.findUnique({
    where: { slug }
  })

  if (existing) {
    return existing
  }

  return prisma.tag.create({
    data: {
      name: name.trim(),
      slug
    }
  })
}

/**
 * Gets a tag by its ID.
 */
export async function getTagById(id: string) {
  return prisma.tag.findUnique({
    where: { id }
  })
}