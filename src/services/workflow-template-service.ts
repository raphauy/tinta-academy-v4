import { prisma } from '@/lib/prisma'
import { WorkflowTriggerType } from '@prisma/client'

// =============================================================================
// Types
// =============================================================================

export interface CreateWorkflowStepInput {
  templateId: string
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex?: number
  order: number
}

export interface CreateWorkflowInput {
  name: string
  description?: string
  educatorId: string
  sendAtHour: number
  sendAtMinute: number
  sendAtTimezone: string
  steps: CreateWorkflowStepInput[]
}

export interface UpdateWorkflowInput {
  name?: string
  description?: string
  isActive?: boolean
  sendAtHour?: number
  sendAtMinute?: number
  sendAtTimezone?: string
  steps?: CreateWorkflowStepInput[]
}

// =============================================================================
// Queries
// =============================================================================

/**
 * Get all workflow templates for an educator
 * Optionally filter by search query
 */
export async function getWorkflowsByEducator(
  educatorId: string,
  search?: string
) {
  return prisma.workflowTemplate.findMany({
    where: {
      educatorId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: {
          template: {
            select: { id: true, name: true },
          },
        },
      },
      courseWorkflows: {
        where: {
          status: { in: ['active', 'paused'] },
        },
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get a single workflow template by ID with ownership check
 */
export async function getWorkflowById(id: string, educatorId: string) {
  return prisma.workflowTemplate.findFirst({
    where: {
      id,
      educatorId,
    },
    include: {
      steps: {
        orderBy: { order: 'asc' },
        include: {
          template: {
            select: { id: true, name: true, subject: true },
          },
        },
      },
    },
  })
}

/**
 * Get workflow templates available for selection (simple list)
 */
export async function getWorkflowsForSelect(educatorId: string) {
  return prisma.workflowTemplate.findMany({
    where: {
      educatorId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      description: true,
      _count: {
        select: { steps: true },
      },
    },
    orderBy: { name: 'asc' },
  })
}

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create a new workflow template with its steps
 * All operations are performed in a transaction
 */
export async function createWorkflow(data: CreateWorkflowInput) {
  // Validate that all templates belong to the educator
  const templateIds = data.steps.map((step) => step.templateId)
  const templates = await prisma.emailTemplate.findMany({
    where: {
      id: { in: templateIds },
      educatorId: data.educatorId,
    },
    select: { id: true },
  })

  const validTemplateIds = new Set(templates.map((t) => t.id))
  const invalidTemplates = templateIds.filter((id) => !validTemplateIds.has(id))

  if (invalidTemplates.length > 0) {
    throw new Error('Una o más plantillas no son válidas o no te pertenecen')
  }

  return prisma.$transaction(async (tx) => {
    // Create the workflow template
    const workflow = await tx.workflowTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        educatorId: data.educatorId,
        sendAtHour: data.sendAtHour,
        sendAtMinute: data.sendAtMinute,
        sendAtTimezone: data.sendAtTimezone,
        isActive: true,
      },
    })

    // Create the steps
    if (data.steps.length > 0) {
      await tx.workflowStep.createMany({
        data: data.steps.map((step) => ({
          workflowTemplateId: workflow.id,
          templateId: step.templateId,
          triggerType: step.triggerType,
          triggerOffset: step.triggerOffset,
          triggerClassIndex: step.triggerClassIndex,
          order: step.order,
        })),
      })
    }

    return workflow
  })
}

/**
 * Update an existing workflow template
 * Replaces all steps if provided
 */
export async function updateWorkflow(
  id: string,
  educatorId: string,
  data: UpdateWorkflowInput
) {
  // Verify ownership
  const existing = await prisma.workflowTemplate.findFirst({
    where: { id, educatorId },
  })

  if (!existing) {
    throw new Error('Workflow no encontrado o sin acceso')
  }

  // If updating steps, validate templates
  if (data.steps) {
    const templateIds = data.steps.map((step) => step.templateId)
    const templates = await prisma.emailTemplate.findMany({
      where: {
        id: { in: templateIds },
        educatorId,
      },
      select: { id: true },
    })

    const validTemplateIds = new Set(templates.map((t) => t.id))
    const invalidTemplates = templateIds.filter(
      (tid) => !validTemplateIds.has(tid)
    )

    if (invalidTemplates.length > 0) {
      throw new Error('Una o más plantillas no son válidas o no te pertenecen')
    }
  }

  return prisma.$transaction(async (tx) => {
    // Update workflow template
    const workflow = await tx.workflowTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.sendAtHour !== undefined && { sendAtHour: data.sendAtHour }),
        ...(data.sendAtMinute !== undefined && {
          sendAtMinute: data.sendAtMinute,
        }),
        ...(data.sendAtTimezone !== undefined && {
          sendAtTimezone: data.sendAtTimezone,
        }),
      },
    })

    // If steps are provided, replace all steps
    if (data.steps) {
      // Delete existing steps
      await tx.workflowStep.deleteMany({
        where: { workflowTemplateId: id },
      })

      // Create new steps
      if (data.steps.length > 0) {
        await tx.workflowStep.createMany({
          data: data.steps.map((step) => ({
            workflowTemplateId: id,
            templateId: step.templateId,
            triggerType: step.triggerType,
            triggerOffset: step.triggerOffset,
            triggerClassIndex: step.triggerClassIndex,
            order: step.order,
          })),
        })
      }
    }

    return workflow
  })
}

/**
 * Toggle workflow active status
 */
export async function toggleWorkflowActive(id: string, educatorId: string) {
  const existing = await prisma.workflowTemplate.findFirst({
    where: { id, educatorId },
  })

  if (!existing) {
    throw new Error('Workflow no encontrado o sin acceso')
  }

  return prisma.workflowTemplate.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })
}

/**
 * Check if a workflow is being used by any active course
 */
export async function isWorkflowInUse(id: string): Promise<boolean> {
  const count = await prisma.courseWorkflow.count({
    where: {
      workflowTemplateId: id,
      status: { in: ['active', 'paused'] },
    },
  })
  return count > 0
}

/**
 * Delete a workflow template
 * Throws error if workflow is in use
 */
export async function deleteWorkflow(id: string, educatorId: string) {
  // Verify ownership
  const existing = await prisma.workflowTemplate.findFirst({
    where: { id, educatorId },
  })

  if (!existing) {
    throw new Error('Workflow no encontrado o sin acceso')
  }

  // Check if in use
  const inUse = await isWorkflowInUse(id)
  if (inUse) {
    throw new Error(
      'No se puede eliminar: el workflow está siendo usado en uno o más cursos'
    )
  }

  // Delete workflow (steps will cascade delete)
  return prisma.workflowTemplate.delete({
    where: { id },
  })
}

/**
 * Duplicate a workflow template
 */
export async function duplicateWorkflow(id: string, educatorId: string) {
  const original = await prisma.workflowTemplate.findFirst({
    where: { id, educatorId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!original) {
    throw new Error('Workflow no encontrado o sin acceso')
  }

  return prisma.$transaction(async (tx) => {
    // Create duplicate workflow
    const duplicate = await tx.workflowTemplate.create({
      data: {
        name: `${original.name} (Copia)`,
        description: original.description,
        educatorId,
        sendAtHour: original.sendAtHour,
        sendAtMinute: original.sendAtMinute,
        sendAtTimezone: original.sendAtTimezone,
        isActive: true,
      },
    })

    // Duplicate steps
    if (original.steps.length > 0) {
      await tx.workflowStep.createMany({
        data: original.steps.map((step) => ({
          workflowTemplateId: duplicate.id,
          templateId: step.templateId,
          triggerType: step.triggerType,
          triggerOffset: step.triggerOffset,
          triggerClassIndex: step.triggerClassIndex,
          order: step.order,
        })),
      })
    }

    return duplicate
  })
}

// =============================================================================
// Admin Functions
// =============================================================================

/**
 * Get all workflow templates for admin view
 * Supports filtering by educator, active status, and search
 */
export async function getAllWorkflowsForAdmin(filters?: {
  educatorId?: string
  isActive?: boolean
  search?: string
}) {
  return prisma.workflowTemplate.findMany({
    where: {
      ...(filters?.educatorId && { educatorId: filters.educatorId }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      educator: { select: { id: true, name: true } },
      steps: { orderBy: { order: 'asc' } },
      courseWorkflows: {
        where: { status: { in: ['active', 'paused'] } },
        include: { course: { select: { id: true, title: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get aggregated statistics for admin workflows dashboard
 */
export async function getAdminWorkflowStats() {
  const [totalWorkflows, activeWorkflows, totalPending, totalSent, totalFailed] =
    await Promise.all([
      prisma.workflowTemplate.count(),
      prisma.workflowTemplate.count({ where: { isActive: true } }),
      prisma.workflowExecution.count({ where: { status: 'pending' } }),
      prisma.workflowExecution.count({
        where: { status: { in: ['sent', 'delivered', 'opened', 'clicked'] } },
      }),
      prisma.workflowExecution.count({
        where: { status: { in: ['failed', 'bounced'] } },
      }),
    ])
  return { totalWorkflows, activeWorkflows, totalPending, totalSent, totalFailed }
}

/**
 * Get list of educators that have at least one workflow
 */
export async function getEducatorsWithWorkflows() {
  return prisma.educator.findMany({
    where: { workflowTemplates: { some: {} } },
    select: {
      id: true,
      name: true,
      _count: { select: { workflowTemplates: true } },
    },
    orderBy: { name: 'asc' },
  })
}
