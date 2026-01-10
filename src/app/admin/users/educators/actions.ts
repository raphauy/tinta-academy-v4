'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import {
  getAllEducatorsWithStats,
  getEducatorStats,
  getEducatorByIdWithStats,
  updateEducatorAsAdmin,
  deleteEducator,
  promoteUserToEducator,
  type EducatorWithStats,
  type EducatorStats,
  type CreateEducatorInput,
  type UpdateEducatorAsAdminInput,
} from '@/services/educator-service'
import { getEligibleEducatorUsers, type UserWithDetails } from '@/services/user-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createEducatorSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  name: z.string().min(1, 'Nombre requerido'),
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

const updateEducatorSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')).nullable(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

async function requireSuperAdmin(): Promise<
  { error: string } | { userId: string }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'superadmin') {
    return { error: 'Acceso denegado. Solo superadministradores.' }
  }

  return { userId: session.user.id }
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get all educators with stats for admin panel
 */
export async function getEducatorsForAdminAction(): Promise<
  ActionResult<{ educators: EducatorWithStats[]; stats: EducatorStats }>
> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const [educators, stats] = await Promise.all([
      getAllEducatorsWithStats(),
      getEducatorStats(),
    ])

    return { success: true, data: { educators, stats } }
  } catch (error) {
    console.error('Error fetching educators for admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los educadores',
    }
  }
}

/**
 * Get educator details by ID
 */
export async function getEducatorDetailAction(
  educatorId: string
): Promise<ActionResult<EducatorWithStats>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!educatorId) {
    return { success: false, error: 'ID de educador requerido' }
  }

  try {
    const educator = await getEducatorByIdWithStats(educatorId)

    if (!educator) {
      return { success: false, error: 'Educador no encontrado' }
    }

    return { success: true, data: educator }
  } catch (error) {
    console.error('Error fetching educator detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el detalle del educador',
    }
  }
}

/**
 * Create educator from existing user
 */
export async function createEducatorAction(
  data: CreateEducatorInput
): Promise<ActionResult<EducatorWithStats>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    // Validate input
    const validatedData = createEducatorSchema.parse(data)

    // Use promoteUserToEducator to create educator and update role
    await promoteUserToEducator(validatedData.userId, {
      name: validatedData.name,
      title: validatedData.title,
      bio: validatedData.bio,
      imageUrl: validatedData.imageUrl || undefined,
    })

    // Get the created educator with stats
    const educators = await getAllEducatorsWithStats()
    const educator = educators.find((e) => e.userId === validatedData.userId)

    if (!educator) {
      return { success: false, error: 'Error al obtener el educador creado' }
    }

    revalidatePath('/admin/users/educators')
    revalidatePath('/admin/users')
    revalidatePath('/admin')

    return { success: true, data: educator }
  } catch (error) {
    console.error('Error creating educator:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el educador',
    }
  }
}

/**
 * Update educator as admin
 */
export async function updateEducatorAction(
  educatorId: string,
  data: UpdateEducatorAsAdminInput
): Promise<ActionResult<EducatorWithStats>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!educatorId) {
    return { success: false, error: 'ID de educador requerido' }
  }

  try {
    // Validate input
    const validatedData = updateEducatorSchema.parse(data)

    await updateEducatorAsAdmin(educatorId, {
      name: validatedData.name,
      title: validatedData.title,
      bio: validatedData.bio,
      imageUrl: validatedData.imageUrl || undefined,
    })

    // Get updated educator with stats
    const educator = await getEducatorByIdWithStats(educatorId)

    if (!educator) {
      return { success: false, error: 'Error al obtener el educador actualizado' }
    }

    revalidatePath('/admin/users/educators')
    revalidatePath('/admin')

    return { success: true, data: educator }
  } catch (error) {
    console.error('Error updating educator:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el educador',
    }
  }
}

/**
 * Delete educator
 */
export async function deleteEducatorAction(
  educatorId: string
): Promise<ActionResult<void>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!educatorId) {
    return { success: false, error: 'ID de educador requerido' }
  }

  try {
    await deleteEducator(educatorId)

    revalidatePath('/admin/users/educators')
    revalidatePath('/admin/users')
    revalidatePath('/admin')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting educator:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el educador',
    }
  }
}

/**
 * Get users eligible to become educators
 */
export async function getEligibleEducatorUsersAction(): Promise<
  ActionResult<UserWithDetails[]>
> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const users = await getEligibleEducatorUsers()
    return { success: true, data: users }
  } catch (error) {
    console.error('Error fetching eligible users:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los usuarios',
    }
  }
}
