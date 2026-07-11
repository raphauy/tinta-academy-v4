import jwt from 'jsonwebtoken'

/**
 * Tokens firmados para el link de baja de comunicaciones.
 *
 * Firmamos el email con AUTH_SECRET para evitar que cualquiera dé de baja a un
 * tercero manipulando la URL. Sin columna extra en la BD.
 *
 * La baja es unificada: al confirmar, el email se da de baja del newsletter
 * (NewsletterSubscription.isActive=false) y del registro de usuario
 * (User.emailUnsubscribedAt). Por eso el token solo necesita el email.
 */

const PURPOSE = 'unsubscribe'

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET no está configurado')
  }
  return secret
}

/**
 * Genera un token firmado para dar de baja el email indicado.
 * Sin expiración: los links de baja deben funcionar indefinidamente.
 */
export function signUnsubscribeToken(email: string): string {
  return jwt.sign(
    { email: email.trim().toLowerCase(), purpose: PURPOSE },
    getSecret()
  )
}

/**
 * Verifica un token de baja y devuelve el email, o null si es inválido.
 */
export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, getSecret())
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'purpose' in payload &&
      payload.purpose === PURPOSE &&
      'email' in payload &&
      typeof payload.email === 'string'
    ) {
      return payload.email
    }
    return null
  } catch {
    return null
  }
}
