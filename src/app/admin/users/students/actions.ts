'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import {
  getAllStudentsWithStats,
  getStudentStats,
  getStudentByIdWithStats,
  updateStudentAsAdmin,
  type StudentWithStats,
  type StudentStats,
  type UpdateStudentAsAdminInput,
} from '@/services/student-service'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateStudentSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  identityDocument: z.string().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.date().nullable().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
  billingName: z.string().optional(),
  billingTaxId: z.string().optional(),
  billingAddress: z.string().optional(),
  notifyNewCourses: z.boolean().optional(),
  notifyPromotions: z.boolean().optional(),
  notifyCourseUpdates: z.boolean().optional(),
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
 * Get all students with stats for admin panel
 */
export async function getStudentsForAdminAction(): Promise<
  ActionResult<{ students: StudentWithStats[]; stats: StudentStats }>
> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const [students, stats] = await Promise.all([
      getAllStudentsWithStats(),
      getStudentStats(),
    ])

    return { success: true, data: { students, stats } }
  } catch (error) {
    console.error('Error fetching students for admin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener los estudiantes',
    }
  }
}

/**
 * Get student details by ID
 */
export async function getStudentDetailAction(
  studentId: string
): Promise<ActionResult<StudentWithStats>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!studentId) {
    return { success: false, error: 'ID de estudiante requerido' }
  }

  try {
    const student = await getStudentByIdWithStats(studentId)

    if (!student) {
      return { success: false, error: 'Estudiante no encontrado' }
    }

    return { success: true, data: student }
  } catch (error) {
    console.error('Error fetching student detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el detalle del estudiante',
    }
  }
}

/**
 * Update student as admin
 */
export async function updateStudentAction(
  studentId: string,
  data: UpdateStudentAsAdminInput
): Promise<ActionResult<StudentWithStats>> {
  const authResult = await requireSuperAdmin()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  if (!studentId) {
    return { success: false, error: 'ID de estudiante requerido' }
  }

  try {
    // Validate input
    const validatedData = updateStudentSchema.parse(data)

    await updateStudentAsAdmin(studentId, validatedData)

    // Get updated student with stats
    const student = await getStudentByIdWithStats(studentId)

    if (!student) {
      return { success: false, error: 'Error al obtener el estudiante actualizado' }
    }

    revalidatePath('/admin/users/students')
    revalidatePath('/admin')

    return { success: true, data: student }
  } catch (error) {
    console.error('Error updating student:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Datos inválidos: ${error.issues.map((e) => e.message).join(', ')}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el estudiante',
    }
  }
}
