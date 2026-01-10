'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { auth } from '@/lib/auth'
import {
  getAllUsersWithDetails,
  getUserStats,
  updateUser,
  updateUserRole,
  deleteUser,
  toggleUserStatus,
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

const updateUserSchema = z.object({
  userId: z.string().min(1, 'ID de usuario requerido'),
  name: z.string().optional(),
  role: z.enum(['superadmin', 'user']).optional(),
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
 * Update user (name and optionally role)
 * Only superadmin and user (null) roles can be assigned manually
 * For educators/students, role should not be passed
 */
export async function updateUserAction(
  userId: string,
  data: { name?: string; role?: 'superadmin' | 'user' }
): Promise<ActionResult<UserWithDetails>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    // Validate input
    updateUserSchema.parse({ userId, ...data })

    // Update name if provided
    if (data.name !== undefined) {
      await updateUser(userId, { name: data.name })
    }

    // Update role only if provided (convert 'user' to null for database)
    if (data.role !== undefined) {
      const newRole = data.role === 'user' ? null : (data.role as Role)
      await updateUserRole(userId, newRole, authResult.userId)
    }

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
    console.error('Error updating user:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el usuario',
    }
  }
}

/**
 * Update user role (deprecated - use updateUserAction instead)
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
 * Toggle user active status (activate/deactivate)
 */
export async function toggleUserStatusAction(
  userId: string
): Promise<ActionResult<{ isActive: boolean }>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!userId) {
    return { success: false, error: 'ID de usuario requerido' }
  }

  // Prevent self-deactivation
  if (userId === authResult.userId) {
    return { success: false, error: 'No puedes desactivar tu propia cuenta' }
  }

  try {
    // Get user info to check if they're a superadmin
    const users = await getAllUsersWithDetails()
    const targetUser = users.find((u) => u.id === userId)

    if (!targetUser) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    // If deactivating a superadmin, ensure there's at least one other active superadmin
    if (targetUser.role === 'superadmin' && targetUser.isActive) {
      const activeSuperadmins = users.filter(
        (u) => u.role === 'superadmin' && u.isActive && u.id !== userId
      )
      if (activeSuperadmins.length === 0) {
        return {
          success: false,
          error: 'No puedes desactivar al último administrador activo',
        }
      }
    }

    const updatedUser = await toggleUserStatus(userId)

    revalidatePath('/admin/users')
    revalidatePath('/admin/users/students')
    revalidatePath('/admin/users/educators')
    revalidatePath('/admin')

    return { success: true, data: { isActive: updatedUser.isActive } }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al cambiar el estado del usuario',
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
