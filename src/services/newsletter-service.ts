import { prisma } from '@/lib/prisma'

export async function subscribe(email: string) {
  const subscription = await prisma.newsletterSubscription.upsert({
    where: { email },
    update: { 
      isActive: true,
      subscribedAt: new Date()
    },
    create: {
      email,
      isActive: true
    }
  })

  return subscription
}