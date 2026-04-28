import { prisma } from '@/lib/prisma'

export async function subscribe(email: string) {
  const normalized = email.trim().toLowerCase()
  const subscription = await prisma.newsletterSubscription.upsert({
    where: { email: normalized },
    update: {
      isActive: true,
      subscribedAt: new Date()
    },
    create: {
      email: normalized,
      isActive: true
    }
  })

  return subscription
}