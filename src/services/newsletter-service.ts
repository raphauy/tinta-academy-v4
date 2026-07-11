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

/**
 * Marca la suscripción como inactiva (baja del newsletter).
 * Idempotente: si el email no existe o ya estaba inactivo no falla.
 */
export async function unsubscribe(email: string) {
  const normalized = email.trim().toLowerCase()

  return prisma.newsletterSubscription.updateMany({
    where: { email: { equals: normalized, mode: 'insensitive' } },
    data: { isActive: false },
  })
}

/**
 * Suscriptores activos del newsletter (para audiencias de campañas).
 */
export async function getActiveSubscribers(): Promise<{ email: string }[]> {
  return prisma.newsletterSubscription.findMany({
    where: { isActive: true },
    select: { email: true },
    orderBy: { subscribedAt: 'desc' },
  })
}

/**
 * Cantidad de suscriptores activos del newsletter.
 */
export async function getActiveSubscribersCount(): Promise<number> {
  return prisma.newsletterSubscription.count({
    where: { isActive: true },
  })
}