'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getStudentByUserId,
  updateStudentProfile,
} from '@/services/student-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

type StudentWithUser = NonNullable<
  Awaited<ReturnType<typeof getStudentByUserId>>
>

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getAuthenticatedStudent(): Promise<
  { error: string } | { student: StudentWithUser }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'student') {
    // Block mutations when superadmin/educator is viewing as student
    return { error: 'Las acciones no están disponibles en modo de visualización' }
  }

  const student = await getStudentByUserId(session.user.id)

  if (!student) {
    return { error: 'Estudiante no encontrado' }
  }

  return { student }
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido').optional(),
  lastName: z.string().min(1, 'El apellido es requerido').optional(),
  identityDocument: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  billingName: z.string().optional(),
  billingTaxId: z.string().optional(),
  billingAddress: z.string().optional(),
})

const notificationPreferencesSchema = z.object({
  notifyNewCourses: z.boolean(),
  notifyPromotions: z.boolean(),
  notifyCourseUpdates: z.boolean(),
})

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Update student profile information
 */
export async function updateStudentProfileAction(
  formData: FormData
): Promise<ActionResult> {
  const authResult = await getAuthenticatedStudent()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { student } = authResult

  const rawData = {
    firstName: (formData.get('firstName') as string) || undefined,
    lastName: (formData.get('lastName') as string) || undefined,
    identityDocument: (formData.get('identityDocument') as string) || undefined,
    phone: (formData.get('phone') as string) || undefined,
    dateOfBirth: formData.get('dateOfBirth') || undefined,
    address: (formData.get('address') as string) || undefined,
    city: (formData.get('city') as string) || undefined,
    zip: (formData.get('zip') as string) || undefined,
    country: (formData.get('country') as string) || undefined,
    billingName: (formData.get('billingName') as string) || undefined,
    billingTaxId: (formData.get('billingTaxId') as string) || undefined,
    billingAddress: (formData.get('billingAddress') as string) || undefined,
  }

  // Filter out undefined values
  const filteredData = Object.fromEntries(
    Object.entries(rawData).filter(([, v]) => v !== undefined)
  )

  const validated = updateProfileSchema.safeParse(filteredData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    await updateStudentProfile(student.id, validated.data)

    revalidatePath('/student/profile')
    revalidatePath('/student')

    return { success: true }
  } catch (error) {
    console.error('Error updating student profile:', error)
    return {
      success: false,
      error: 'Error al actualizar el perfil',
    }
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferencesAction(
  preferences: {
    notifyNewCourses: boolean
    notifyPromotions: boolean
    notifyCourseUpdates: boolean
  }
): Promise<ActionResult> {
  const authResult = await getAuthenticatedStudent()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { student } = authResult

  const validated = notificationPreferencesSchema.safeParse(preferences)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    await updateStudentProfile(student.id, validated.data)

    revalidatePath('/student/profile')

    return { success: true }
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return {
      success: false,
      error: 'Error al actualizar las preferencias de notificación',
    }
  }
}

/**
 * Update student avatar (User.image field)
 */
export async function updateStudentAvatarAction(
  imageUrl: string | null
): Promise<ActionResult<{ imageUrl: string | null }>> {
  const authResult = await getAuthenticatedStudent()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { student } = authResult

  try {
    await prisma.user.update({
      where: { id: student.userId },
      data: { image: imageUrl },
    })

    revalidatePath('/student/profile')
    revalidatePath('/student')

    return { success: true, data: { imageUrl } }
  } catch (error) {
    console.error('Error updating student avatar:', error)
    return {
      success: false,
      error: 'Error al actualizar la foto de perfil',
    }
  }
}
