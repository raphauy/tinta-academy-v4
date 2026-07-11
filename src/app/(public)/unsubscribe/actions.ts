'use server'

import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { unsubscribe as unsubscribeNewsletter } from '@/services/newsletter-service'
import { unsubscribeUser } from '@/services/user-service'

/**
 * Da de baja el email del token de todas las comunicaciones de marketing
 * (newsletter + usuario registrado). El token se re-verifica del lado servidor;
 * el cliente nunca envía el email en claro. Idempotente.
 */
export async function unsubscribeAction(
  token: string
): Promise<{ success: boolean }> {
  const email = verifyUnsubscribeToken(token)

  if (!email) {
    return { success: false }
  }

  try {
    await Promise.all([unsubscribeNewsletter(email), unsubscribeUser(email)])
    return { success: true }
  } catch (error) {
    console.error('Error al dar de baja:', error)
    return { success: false }
  }
}
