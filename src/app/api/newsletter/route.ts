import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email format')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = subscribeSchema.parse(body)

    // Create or update newsletter subscription
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email: validatedData.email },
      update: { 
        isActive: true,
        subscribedAt: new Date()
      },
      create: {
        email: validatedData.email,
        isActive: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }
    
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}