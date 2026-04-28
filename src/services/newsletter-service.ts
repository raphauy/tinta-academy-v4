import { prisma } from '@/lib/prisma'

export async function subscribe(email: string) {
  const normalized = email.trim().toLowerCase()

  // Match case-insensitively to avoid creating duplicates when a legacy row
  // stored the email with mixed casing.
  const existing = await prisma.newsletterSubscription.findFirst({
    where: { email: { equals: normalized, mode: 'insensitive' } },
  })

  if (existing) {
    return prisma.newsletterSubscription.update({
      where: { id: existing.id },
      data: {
        email: normalized,
        isActive: true,
        subscribedAt: new Date(),
      },
    })
  }

  return prisma.newsletterSubscription.create({
    data: {
      email: normalized,
      isActive: true,
    },
  })
}