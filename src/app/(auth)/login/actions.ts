'use server'

import { signIn } from '@/lib/auth'
import { getOrCreateUser, getUserByEmail, updateUser } from '@/services/user-service'
import { generateOtp, createOtpToken } from '@/services/auth-service'
import { sendOtpEmail } from '@/services/email-service'
import { z } from 'zod'

const emailSchema = z.string().email('Email inválido')

type ActionResult = {
  success: boolean
  error?: string
  message?: string
  redirectUrl?: string
  hasName?: boolean
  name?: string
}

export async function checkEmailAction(email: string): Promise<ActionResult> {
  try {
    const validatedEmail = emailSchema.parse(email)

    // Auto-create users if they don't exist
    await getOrCreateUser(validatedEmail)

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Email inválido' }
    }
    console.error('Error checking email:', error)
    return { success: false, error: 'Error al verificar el email' }
  }
}

export async function sendOtpAction(email: string): Promise<ActionResult> {
  try {
    const validatedEmail = emailSchema.parse(email)

    // Get or create user
    const user = await getOrCreateUser(validatedEmail)

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        error: 'Tu cuenta está desactivada. Contacta al administrador.',
      }
    }

    // Generate OTP
    const otp = generateOtp()

    // Create token with 10 minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await createOtpToken({
      userId: user.id,
      token: otp,
      expiresAt,
    })

    // Send email
    await sendOtpEmail({ to: validatedEmail, otp })

    return {
      success: true,
      message: 'Código enviado a tu email',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Email inválido' }
    }
    console.error('Error sending OTP:', error)
    return { success: false, error: 'Error al enviar el código' }
  }
}

export async function verifyOtpAction(
  email: string,
  otp: string
): Promise<ActionResult> {
  try {
    const validatedEmail = emailSchema.parse(email)

    // Verify OTP length
    if (!/^\d{6}$/.test(otp)) {
      return { success: false, error: 'El código debe ser de 6 dígitos' }
    }

    // Check user exists
    const user = await getUserByEmail(validatedEmail)
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // Sign in with NextAuth
    const result = await signIn('credentials', {
      email: validatedEmail,
      otp,
      redirect: false,
    })

    if (result?.error) {
      return { success: false, error: 'Código inválido o expirado' }
    }

    // Determine redirect URL based on role
    let redirectUrl = '/'

    switch (user.role) {
      case 'superadmin':
        redirectUrl = '/admin'
        break
      case 'educator':
        redirectUrl = '/educator'
        break
      case 'student':
        redirectUrl = '/student'
        break
      default:
        redirectUrl = '/'
    }

    return { success: true, redirectUrl, hasName: !!user.name }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Email inválido' }
    }
    console.error('Error verifying OTP:', error)
    return { success: false, error: 'Error al verificar el código' }
  }
}

export async function updateUserNameAction(
  email: string,
  name: string
): Promise<ActionResult> {
  try {
    const validatedEmail = emailSchema.parse(email)

    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: 'El nombre es requerido' }
    }

    const user = await getUserByEmail(validatedEmail)
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    await updateUser(user.id, { name: trimmedName })

    let redirectUrl = '/'
    switch (user.role) {
      case 'superadmin':
        redirectUrl = '/admin'
        break
      case 'educator':
        redirectUrl = '/educator'
        break
      case 'student':
        redirectUrl = '/student'
        break
      default:
        redirectUrl = '/'
    }

    return { success: true, redirectUrl, name: trimmedName }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Email inválido' }
    }
    console.error('Error updating user name:', error)
    return { success: false, error: 'Error al guardar el nombre' }
  }
}
