'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import {
  getFiltersByEducator,
  getFilterById,
  createFilter,
  updateFilter,
  deleteFilter,
  evaluateFilter,
  getAllTags,
  getFiltersForSelection,
  getFilterCountsBatch,
} from '@/services/audience-filter-service'
import type {
  FilterConditions,
  AudienceFilterWithEducator,
  FilterPreviewResult,
  FilterForSelection,
} from '@/types/audience-filter'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const filterFormSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  conditions: z.string().min(1, 'Las condiciones son requeridas'), // JSON string
})

const updateFilterSchema = filterFormSchema.extend({
  id: z.string().min(1, 'El ID es requerido'),
})

const deleteFilterSchema = z.object({
  id: z.string().min(1, 'El ID es requerido'),
})

const previewFilterSchema = z.object({
  conditions: z.string().min(1, 'Las condiciones son requeridas'),
  limit: z.number().optional(),
})

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

type EducatorWithUser = NonNullable<
  Awaited<ReturnType<typeof getEducatorByUserId>>
>

// ============================================
// HELPER FUNCTIONS
// ============================================

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

/**
 * Get all filters visible to the educator
 */
export async function getFiltersAction(
  search?: string
): Promise<ActionResult<AudienceFilterWithEducator[]>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const filters = await getFiltersByEducator(authResult.educator.id, search)
    return { success: true, data: filters }
  } catch (error) {
    console.error('Error getting filters:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener filtros',
    }
  }
}

/**
 * Get a single filter by ID
 */
export async function getFilterAction(
  id: string
): Promise<ActionResult<AudienceFilterWithEducator>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const filter = await getFilterById(id, authResult.educator.id)

    if (!filter) {
      return { success: false, error: 'Filtro no encontrado' }
    }

    return { success: true, data: filter }
  } catch (error) {
    console.error('Error getting filter:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener filtro',
    }
  }
}

/**
 * Create a new audience filter
 */
export async function createFilterAction(
  data: z.infer<typeof filterFormSchema>
): Promise<ActionResult<AudienceFilterWithEducator>> {
  const validated = filterFormSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const conditions = JSON.parse(validated.data.conditions) as FilterConditions

    const filter = await createFilter({
      name: validated.data.name,
      description: validated.data.description,
      isPublic: validated.data.isPublic,
      conditions,
      educatorId: authResult.educator.id,
    })

    revalidatePath('/educator/filters')

    return {
      success: true,
      data: {
        ...filter,
        _count: { campaigns: 0 },
      },
    }
  } catch (error) {
    console.error('Error creating filter:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear filtro',
    }
  }
}

/**
 * Update an existing filter
 */
export async function updateFilterAction(
  data: z.infer<typeof updateFilterSchema>
): Promise<ActionResult<AudienceFilterWithEducator>> {
  const validated = updateFilterSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const conditions = JSON.parse(validated.data.conditions) as FilterConditions

    const filter = await updateFilter(validated.data.id, authResult.educator.id, {
      name: validated.data.name,
      description: validated.data.description,
      isPublic: validated.data.isPublic,
      conditions,
    })

    revalidatePath('/educator/filters')
    revalidatePath(`/educator/filters/${validated.data.id}/edit`)

    return {
      success: true,
      data: {
        ...filter,
        _count: { campaigns: 0 },
      },
    }
  } catch (error) {
    console.error('Error updating filter:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al actualizar filtro',
    }
  }
}

/**
 * Delete a filter
 */
export async function deleteFilterAction(
  data: z.infer<typeof deleteFilterSchema>
): Promise<ActionResult> {
  const validated = deleteFilterSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    await deleteFilter(validated.data.id, authResult.educator.id)

    revalidatePath('/educator/filters')

    return { success: true }
  } catch (error) {
    console.error('Error deleting filter:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar filtro',
    }
  }
}

/**
 * Preview filter results (evaluate conditions)
 */
export async function previewFilterAction(
  data: z.infer<typeof previewFilterSchema>
): Promise<ActionResult<FilterPreviewResult>> {
  const validated = previewFilterSchema.safeParse(data)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const conditions = JSON.parse(validated.data.conditions) as FilterConditions
    const result = await evaluateFilter(conditions, validated.data.limit || 50)

    return { success: true, data: result }
  } catch (error) {
    console.error('Error previewing filter:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Error al evaluar filtro',
    }
  }
}

/**
 * Get all available tags for filter conditions
 */
export async function getTagsAction(): Promise<
  ActionResult<Array<{ slug: string; name: string }>>
> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const tags = await getAllTags()
    return { success: true, data: tags }
  } catch (error) {
    console.error('Error getting tags:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener tags',
    }
  }
}

/**
 * Get filters for selection in campaign creation
 */
export async function getFiltersForSelectionAction(): Promise<
  ActionResult<FilterForSelection[]>
> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const filters = await getFiltersForSelection(authResult.educator.id)
    return { success: true, data: filters }
  } catch (error) {
    console.error('Error getting filters for selection:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener filtros',
    }
  }
}

/**
 * Get the student count for a filter by ID (real-time evaluation)
 */
export async function getFilterCountAction(
  filterId: string
): Promise<ActionResult<{ count: number }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const filter = await getFilterById(filterId, authResult.educator.id)

    if (!filter) {
      return { success: false, error: 'Filtro no encontrado' }
    }

    const conditions = JSON.parse(filter.conditions) as FilterConditions
    const result = await evaluateFilter(conditions, 0) // limit 0 = only count

    return { success: true, data: { count: result.count } }
  } catch (error) {
    console.error('Error getting filter count:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al evaluar filtro',
    }
  }
}

/**
 * Get student counts for multiple filters in a single batch call
 */
export async function getFilterCountsBatchAction(
  filterIds: string[]
): Promise<ActionResult<Record<string, number>>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  try {
    const countsMap = await getFilterCountsBatch(filterIds, authResult.educator.id)
    const countsRecord: Record<string, number> = {}
    countsMap.forEach((count, id) => {
      countsRecord[id] = count
    })

    return { success: true, data: countsRecord }
  } catch (error) {
    console.error('Error getting filter counts batch:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al evaluar filtros',
    }
  }
}
