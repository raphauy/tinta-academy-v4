import { z } from 'zod'

// =============================================================================
// Workflow Step Schema
// =============================================================================

export const workflowStepSchema = z.object({
  templateId: z.string().min(1, 'Selecciona una plantilla'),
  triggerType: z.enum([
    'course_start',
    'course_end',
    'exam_date',
    'class_date',
    'registration_deadline',
  ]),
  triggerOffset: z.number().int(),
  triggerClassIndex: z.number().int().min(1).optional(),
  order: z.number().int().min(0),
})

export type WorkflowStepFormData = z.infer<typeof workflowStepSchema>

// =============================================================================
// Create Workflow Schema
// =============================================================================

export const createWorkflowSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido'),
    description: z.string().optional(),
    sendAtHour: z.number().int().min(0).max(23),
    sendAtMinute: z.number().int().min(0).max(59),
    sendAtTimezone: z.string().min(1),
    steps: z.array(workflowStepSchema).min(1, 'Agrega al menos un paso'),
  })
  .refine(
    (data) => {
      // Validate that class_date steps have triggerClassIndex
      return data.steps.every(
        (step) =>
          step.triggerType !== 'class_date' ||
          (step.triggerClassIndex !== undefined && step.triggerClassIndex >= 1)
      )
    },
    {
      message:
        'Los pasos con trigger "Fecha de clase" requieren un índice de clase válido',
      path: ['steps'],
    }
  )

export type CreateWorkflowFormData = z.infer<typeof createWorkflowSchema>

// =============================================================================
// Update Workflow Schema
// =============================================================================

export const updateWorkflowSchema = createWorkflowSchema

export type UpdateWorkflowFormData = z.infer<typeof updateWorkflowSchema>
