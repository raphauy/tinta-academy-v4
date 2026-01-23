'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import {
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  duplicateWorkflow,
  toggleWorkflowActive,
  isWorkflowInUse,
} from '@/services/workflow-template-service'
import {
  createWorkflowSchema,
  updateWorkflowSchema,
} from '@/lib/validations/workflow'
import type { WorkflowTriggerType } from '@prisma/client'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================
// HELPER FUNCTIONS
// ============================================

type EducatorWithUser = NonNullable<
  Awaited<ReturnType<typeof getEducatorByUserId>>
>

async function getAuthenticatedEducator(): Promise<
  { error: string } | { educator: EducatorWithUser }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    return { error: 'No autorizado - solo educadores' }
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    return { error: 'Educador no encontrado' }
  }

  return { educator }
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function createWorkflowAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    sendAtHour: parseInt(formData.get('sendAtHour') as string, 10),
    sendAtMinute: parseInt(formData.get('sendAtMinute') as string, 10),
    sendAtTimezone: formData.get('sendAtTimezone') as string,
    steps: JSON.parse(formData.get('steps') as string) as {
      templateId: string
      triggerType: WorkflowTriggerType
      triggerOffset: number
      triggerClassIndex?: number
      order: number
    }[],
  }

  const validated = createWorkflowSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    const workflow = await createWorkflow({
      ...validated.data,
      educatorId: educator.id,
    })

    revalidatePath('/educator/workflows')

    return { success: true, data: { id: workflow.id } }
  } catch (error) {
    console.error('Error creating workflow:', error)
    const message =
      error instanceof Error ? error.message : 'Error al crear el workflow'
    return { success: false, error: message }
  }
}

export async function updateWorkflowAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  // Parse form data
  const rawData = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    sendAtHour: parseInt(formData.get('sendAtHour') as string, 10),
    sendAtMinute: parseInt(formData.get('sendAtMinute') as string, 10),
    sendAtTimezone: formData.get('sendAtTimezone') as string,
    steps: JSON.parse(formData.get('steps') as string) as {
      templateId: string
      triggerType: WorkflowTriggerType
      triggerOffset: number
      triggerClassIndex?: number
      order: number
    }[],
  }

  const validated = updateWorkflowSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    await updateWorkflow(id, educator.id, validated.data)

    revalidatePath('/educator/workflows')
    revalidatePath(`/educator/workflows/${id}/edit`)

    return { success: true }
  } catch (error) {
    console.error('Error updating workflow:', error)
    const message =
      error instanceof Error ? error.message : 'Error al actualizar el workflow'
    return { success: false, error: message }
  }
}

export async function deleteWorkflowAction(id: string): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  // Check if workflow is in use
  const inUse = await isWorkflowInUse(id)
  if (inUse) {
    return {
      success: false,
      error:
        'No se puede eliminar: el workflow está siendo usado en uno o más cursos',
    }
  }

  try {
    await deleteWorkflow(id, educator.id)

    revalidatePath('/educator/workflows')

    return { success: true }
  } catch (error) {
    console.error('Error deleting workflow:', error)
    const message =
      error instanceof Error ? error.message : 'Error al eliminar el workflow'
    return { success: false, error: message }
  }
}

export async function duplicateWorkflowAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    const duplicate = await duplicateWorkflow(id, educator.id)

    revalidatePath('/educator/workflows')

    return { success: true, data: { id: duplicate.id } }
  } catch (error) {
    console.error('Error duplicating workflow:', error)
    const message =
      error instanceof Error ? error.message : 'Error al duplicar el workflow'
    return { success: false, error: message }
  }
}

export async function toggleWorkflowActiveAction(
  id: string
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    await toggleWorkflowActive(id, educator.id)

    revalidatePath('/educator/workflows')

    return { success: true }
  } catch (error) {
    console.error('Error toggling workflow status:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Error al cambiar estado del workflow'
    return { success: false, error: message }
  }
}
