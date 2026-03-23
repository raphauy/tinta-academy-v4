'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
import {
  getCoursesForWorkflowAssignment,
  getWorkflowForAssignment,
  validateCourseDatesForWorkflow,
  calculateSchedulePreview,
  assignWorkflowToCourse,
  toggleCourseWorkflowStatus,
  removeCourseWorkflow,
  getPendingExecutionsForCourseWorkflow,
  getExecutionHistoryForCourseWorkflow,
  getCourseWorkflowStats,
  countAffectedExecutions,
  recalculateExecutionsForCourse,
  regenerateExecutionsForWorkflow,
  type DateValidationResult,
  type SchedulePreviewItem,
  type ExecutionWithDetails,
  type CourseWorkflowStats,
} from '@/services/workflow-execution-service'

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
      id?: string
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
      id?: string
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

    // Regenerate executions for courses using this workflow (new steps)
    await regenerateExecutionsForWorkflow(id)

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

// ============================================
// WORKFLOW ASSIGNMENT ACTIONS
// ============================================

export async function getCoursesForAssignmentAction(): Promise<
  ActionResult<
    Array<{
      id: string
      title: string
      slug: string
      startDate: Date | null
      endDate: Date | null
      examDate: Date | null
      classDates: Date[]
      registrationDeadline: Date | null
      enrolledCount: number
    }>
  >
> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    const courses = await getCoursesForWorkflowAssignment(educator.id)
    return { success: true, data: courses }
  } catch (error) {
    console.error('Error fetching courses for assignment:', error)
    return { success: false, error: 'Error al obtener cursos' }
  }
}

export async function getSchedulePreviewAction(
  workflowId: string,
  courseId: string
): Promise<
  ActionResult<{
    validation: DateValidationResult
    preview: SchedulePreviewItem[]
  }>
> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    // Get workflow
    const workflow = await getWorkflowForAssignment(workflowId, educator.id)
    if (!workflow) {
      return { success: false, error: 'Workflow no encontrado' }
    }

    // Get course
    const courses = await getCoursesForWorkflowAssignment(educator.id)
    const course = courses.find((c) => c.id === courseId)
    if (!course) {
      return { success: false, error: 'Curso no encontrado' }
    }

    // Validate dates
    const validation = validateCourseDatesForWorkflow(course, workflow.steps)

    // Calculate preview
    const preview = calculateSchedulePreview(course, workflow)

    return { success: true, data: { validation, preview } }
  } catch (error) {
    console.error('Error generating schedule preview:', error)
    return { success: false, error: 'Error al generar vista previa' }
  }
}

export async function assignWorkflowToCourseAction(
  workflowId: string,
  courseId: string
): Promise<ActionResult<{ executionsCreated: number }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    const result = await assignWorkflowToCourse({
      workflowId,
      courseId,
      educatorId: educator.id,
    })

    revalidatePath('/educator/workflows')
    revalidatePath(`/educator/courses/${courseId}/edit`)

    return { success: true, data: { executionsCreated: result.executionsCreated } }
  } catch (error) {
    console.error('Error assigning workflow to course:', error)
    const message =
      error instanceof Error ? error.message : 'Error al asignar el workflow'
    return { success: false, error: message }
  }
}

export async function toggleCourseWorkflowStatusAction(
  id: string
): Promise<ActionResult<{ newStatus: string }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    const newStatus = await toggleCourseWorkflowStatus(id, educator.id)

    revalidatePath('/educator/workflows')
    revalidatePath('/educator/courses')

    return { success: true, data: { newStatus } }
  } catch (error) {
    console.error('Error toggling course workflow status:', error)
    const message =
      error instanceof Error ? error.message : 'Error al cambiar estado'
    return { success: false, error: message }
  }
}

export async function removeCourseWorkflowAction(
  id: string
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    await removeCourseWorkflow(id, educator.id)

    revalidatePath('/educator/workflows')
    revalidatePath('/educator/courses')

    return { success: true }
  } catch (error) {
    console.error('Error removing course workflow:', error)
    const message =
      error instanceof Error ? error.message : 'Error al eliminar workflow'
    return { success: false, error: message }
  }
}

// ============================================
// WORKFLOW EXECUTION DETAIL ACTIONS
// ============================================

export async function getWorkflowExecutionsAction(
  courseWorkflowId: string
): Promise<
  ActionResult<{
    pending: ExecutionWithDetails[]
    history: ExecutionWithDetails[]
    stats: CourseWorkflowStats
  }>
> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    // Verify ownership: courseWorkflow must belong to a course owned by educator
    const courseWorkflow = await prisma.courseWorkflow.findFirst({
      where: {
        id: courseWorkflowId,
        course: {
          educatorId: educator.id,
        },
      },
    })

    if (!courseWorkflow) {
      return { success: false, error: 'Workflow no encontrado' }
    }

    const [pending, history, stats] = await Promise.all([
      getPendingExecutionsForCourseWorkflow(courseWorkflowId),
      getExecutionHistoryForCourseWorkflow(courseWorkflowId),
      getCourseWorkflowStats(courseWorkflowId),
    ])

    return { success: true, data: { pending, history, stats } }
  } catch (error) {
    console.error('Error fetching workflow executions:', error)
    return { success: false, error: 'Error al obtener ejecuciones' }
  }
}

export async function countAffectedExecutionsAction(
  courseId: string
): Promise<ActionResult<{ count: number }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    // Verify ownership: course must belong to educator
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        educatorId: educator.id,
      },
    })

    if (!course) {
      return { success: false, error: 'Curso no encontrado' }
    }

    const count = await countAffectedExecutions(courseId)
    return { success: true, data: { count } }
  } catch (error) {
    console.error('Error counting affected executions:', error)
    return { success: false, error: 'Error al contar ejecuciones afectadas' }
  }
}

export async function recalculateExecutionsAction(
  courseId: string
): Promise<ActionResult<{ updated: number; deleted: number }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  try {
    const result = await recalculateExecutionsForCourse(courseId, educator.id)

    revalidatePath('/educator/workflows')
    revalidatePath('/educator/courses')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error recalculating executions:', error)
    const message =
      error instanceof Error ? error.message : 'Error al recalcular fechas'
    return { success: false, error: message }
  }
}
