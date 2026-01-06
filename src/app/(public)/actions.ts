'use server'

import { z } from 'zod'
import { subscribe } from '@/services/newsletter-service'

const emailSchema = z.string().email('Invalid email format')

export async function subscribeToNewsletter(email: string) {
  try {
    const validatedEmail = emailSchema.parse(email)
    await subscribe(validatedEmail)
    
    return { 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Invalid email format' 
      }
    }
    
    console.error('Error subscribing to newsletter:', error)
    return { 
      success: false, 
      error: 'Failed to subscribe to newsletter' 
    }
  }
}