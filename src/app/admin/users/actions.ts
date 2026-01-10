'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  getAllUsersWithDetails,
  getUserStats,
  updateUserRole,
  deleteUser,
  getUserActivity,
  type UserWithDetails,
  type UserStats,
  type UserActivity,
} from '@/services/user-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateRoleSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  newRole: z.enum(['superadmin', 'educator', 'student']).nullable(),
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
 * Get all users with details for admin panel
 */
export async function getUsersForAdminAction(): Promise<
  ActionResult<{ users: UserWithDetails[]; stats: UserStats }>
> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const [users, stats] = await Promise.all([
      getAllUsersWithDetails(),
      getUserStats(),
    ])

    return { success: true, data: { users, stats } }
  } catch (error) {
    console.error('Error fetching users for admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los usuarios',
    }
  }
}

/**
 * Update user role
 */
export async function updateUserRoleAction(
  userId: string,
  newRole: Role | null
): Promise<ActionResult<UserWithDetails>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    // Validate input
    updateRoleSchema.parse({ userId, newRole })

    await updateUserRole(userId, newRole, authResult.userId)

    // Get full user details
    const users = await getAllUsersWithDetails()
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return { success: false, error: 'Error al obtener el usuario actualizado' }
    }

    revalidatePath('/admin/users')
    revalidatePath('/admin')

    return { success: true, data: user }
  } catch (error) {
    console.error('Error updating user role:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el rol del usuario',
    }
  }
}

/**
 * Delete user and all related data
 */
export async function deleteUserAction(
  userId: string
): Promise<ActionResult<void>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!userId) {
    return { success: false, error: 'ID de usuario requerido' }
  }

  try {
    await deleteUser(userId, authResult.userId)

    revalidatePath('/admin/users')
    revalidatePath('/admin/users/students')
    revalidatePath('/admin/users/educators')
    revalidatePath('/admin')

    return { success: true, data: undefined }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar el usuario',
    }
  }
}

/**
 * Get user activity history
 */
export async function getUserActivityAction(
  userId: string
): Promise<ActionResult<UserActivity[]>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!userId) {
    return { success: false, error: 'ID de usuario requerido' }
  }

  try {
    const activity = await getUserActivity(userId)
    return { success: true, data: activity }
  } catch (error) {
    console.error('Error fetching user activity:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener la actividad del usuario',
    }
  }
}
