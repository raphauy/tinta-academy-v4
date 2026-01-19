'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplateById,
  isTemplateInUse,
} from '@/services/email-template-service'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createTemplateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  subject: z.string().min(1, 'El asunto es requerido'),
  body: z.string().min(1, 'El contenido es requerido'),
})

const updateTemplateSchema = createTemplateSchema

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

export async function createTemplateAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const rawData = {
    name: formData.get('name') as string,
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
  }

  const validated = createTemplateSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    const template = await createTemplate({
      ...validated.data,
      educatorId: educator.id,
    })

    revalidatePath('/educator/templates')

    return { success: true, data: { id: template.id } }
  } catch (error) {
    console.error('Error creating template:', error)
    return {
      success: false,
      error: 'Error al crear la plantilla',
    }
  }
}

export async function updateTemplateAction(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const rawData = {
    name: formData.get('name') as string,
    subject: formData.get('subject') as string,
    body: formData.get('body') as string,
  }

  const validated = updateTemplateSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    await updateTemplate(id, educator.id, validated.data)

    revalidatePath('/educator/templates')
    revalidatePath(`/educator/templates/${id}/edit`)

    return { success: true }
  } catch (error) {
    console.error('Error updating template:', error)
    const message =
      error instanceof Error ? error.message : 'Error al actualizar la plantilla'
    return {
      success: false,
      error: message,
    }
  }
}

export async function deleteTemplateAction(id: string): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  // Check if template is in use
  const inUse = await isTemplateInUse(id)
  if (inUse) {
    return {
      success: false,
      error: 'No se puede eliminar: la plantilla está siendo usada en uno o más workflows',
    }
  }

  try {
    await deleteTemplate(id, educator.id)

    revalidatePath('/educator/templates')

    return { success: true }
  } catch (error) {
    console.error('Error deleting template:', error)
    const message =
      error instanceof Error ? error.message : 'Error al eliminar la plantilla'
    return {
      success: false,
      error: message,
    }
  }
}

export async function duplicateTemplateAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  // Get the original template
  const original = await getTemplateById(id, educator.id)

  if (!original) {
    return {
      success: false,
      error: 'Plantilla no encontrada o sin acceso',
    }
  }

  try {
    const duplicate = await createTemplate({
      name: `${original.name} (Copia)`,
      subject: original.subject,
      body: original.body,
      educatorId: educator.id,
    })

    revalidatePath('/educator/templates')

    return { success: true, data: { id: duplicate.id } }
  } catch (error) {
    console.error('Error duplicating template:', error)
    return {
      success: false,
      error: 'Error al duplicar la plantilla',
    }
  }
}
