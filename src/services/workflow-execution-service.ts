import { prisma } from '@/lib/prisma'
import { addDays, startOfDay } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import {
  CourseStatus,
  EnrollmentStatus,
  type CourseWorkflowStatus,
  type WorkflowTriggerType,
} from '@prisma/client'
import { sendDynamicEmail } from './email-service'
import {
  renderTemplate,
  formatDateForTemplate,
  type TemplateVariables,
} from './email-template-service'
import {
  TRIGGER_TO_COURSE_FIELD,
  COURSE_FIELD_LABELS,
  formatTriggerDescription,
} from '@/lib/constants/workflow'

// =============================================================================
// Types
// =============================================================================

export interface CourseForWorkflow {
  id: string
  title: string
  startDate: Date | null
  endDate: Date | null
  examDate: Date | null
  classDates: Date[]
  registrationDeadline: Date | null
  enrolledCount: number
}

// Base type for step trigger info (used for scheduled date calculation)
interface StepTriggerInfo {
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex: number | null
}

interface WorkflowStepForExecution extends StepTriggerInfo {
  id: string
  order: number
  template: {
    id: string
    name: string
    subject: string
    body: string
  }
}

interface WorkflowForAssignment {
  id: string
  name: string
  sendAtHour: number
  sendAtMinute: number
  sendAtTimezone: string
  steps: WorkflowStepForExecution[]
}

export interface DateValidationResult {
  isValid: boolean
  missingDates: Array<{
    field: string
    label: string
    triggerType: WorkflowTriggerType
    stepNames: string[]
  }>
}

export interface SchedulePreviewItem {
  stepId: string
  stepOrder: number
  templateName: string
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex: number | null
  scheduledAt: Date | null
  description: string
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * Get courses available for workflow assignment
 * Only returns published courses with at least one date field set
 */
// Status values that allow workflow assignment
const workflowAssignableStatuses: CourseStatus[] = [
  CourseStatus.draft,
  CourseStatus.announced,
  CourseStatus.enrolling,
  CourseStatus.full,
  CourseStatus.in_progress,
  CourseStatus.finished,
]

export async function getCoursesForWorkflowAssignment(
  educatorId: string
): Promise<CourseForWorkflow[]> {
  const courses = await prisma.course.findMany({
    where: {
      educatorId,
      status: { in: workflowAssignableStatuses },
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      examDate: true,
      classDates: true,
      registrationDeadline: true,
      enrolledCount: true,
    },
    orderBy: { title: 'asc' },
  })

  return courses
}

/**
 * Get all workflows assigned to a course
 */
export async function getCourseWorkflows(courseId: string) {
  return prisma.courseWorkflow.findMany({
    where: { courseId },
    include: {
      workflowTemplate: {
        include: {
          steps: {
            include: {
              template: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
      _count: {
        select: {
          executions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get a workflow by ID with steps for assignment
 */
export async function getWorkflowForAssignment(
  workflowId: string,
  educatorId: string
): Promise<WorkflowForAssignment | null> {
  const workflow = await prisma.workflowTemplate.findFirst({
    where: {
      id: workflowId,
      educatorId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      sendAtHour: true,
      sendAtMinute: true,
      sendAtTimezone: true,
      steps: {
        select: {
          id: true,
          triggerType: true,
          triggerOffset: true,
          triggerClassIndex: true,
          order: true,
          template: {
            select: {
              id: true,
              name: true,
              subject: true,
              body: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  return workflow
}

/**
 * Validate that a course has all required dates for a workflow's triggers
 */
export function validateCourseDatesForWorkflow(
  course: CourseForWorkflow,
  steps: WorkflowStepForExecution[]
): DateValidationResult {
  const missingDates: DateValidationResult['missingDates'] = []

  // Group steps by trigger type
  const stepsByTrigger = new Map<WorkflowTriggerType, string[]>()
  for (const step of steps) {
    const existing = stepsByTrigger.get(step.triggerType) || []
    existing.push(step.template.name)
    stepsByTrigger.set(step.triggerType, existing)
  }

  // Check each trigger type
  for (const [triggerType, stepNames] of stepsByTrigger) {
    const field = TRIGGER_TO_COURSE_FIELD[triggerType]
    const label = COURSE_FIELD_LABELS[field]

    let hasDate = false

    switch (triggerType) {
      case 'course_start':
        hasDate = course.startDate !== null
        break
      case 'course_end':
        hasDate = course.endDate !== null
        break
      case 'exam_date':
        hasDate = course.examDate !== null
        break
      case 'registration_deadline':
        hasDate = course.registrationDeadline !== null
        break
      case 'class_date':
        // For class_date, we need to check if the required class indices are available
        const requiredIndices = steps
          .filter((s) => s.triggerType === 'class_date')
          .map((s) => (s.triggerClassIndex ?? 1) - 1)
        const maxRequiredIndex = Math.max(...requiredIndices)
        hasDate = course.classDates.length > maxRequiredIndex
        break
    }

    if (!hasDate) {
      missingDates.push({
        field,
        label,
        triggerType,
        stepNames,
      })
    }
  }

  return {
    isValid: missingDates.length === 0,
    missingDates,
  }
}

/**
 * Calculate the scheduled date for a workflow step based on course dates
 */
function calculateScheduledAt(
  course: CourseForWorkflow,
  step: StepTriggerInfo,
  sendAtHour: number,
  sendAtMinute: number,
  sendAtTimezone: string
): Date | null {
  // 1. Get base date based on trigger type
  let baseDate: Date | null = null

  switch (step.triggerType) {
    case 'course_start':
      baseDate = course.startDate
      break
    case 'course_end':
      baseDate = course.endDate
      break
    case 'exam_date':
      baseDate = course.examDate
      break
    case 'registration_deadline':
      baseDate = course.registrationDeadline
      break
    case 'class_date':
      const idx = (step.triggerClassIndex ?? 1) - 1
      baseDate = course.classDates?.[idx] ?? null
      break
  }

  if (!baseDate) return null

  // 2. Apply offset (e.g., -7 = 7 days before)
  const scheduledDate = addDays(baseDate, step.triggerOffset)

  // 3. Set time in workflow's timezone
  const zonedDate = toZonedTime(scheduledDate, sendAtTimezone)
  zonedDate.setHours(sendAtHour, sendAtMinute, 0, 0)

  // 4. Convert back to UTC
  return fromZonedTime(zonedDate, sendAtTimezone)
}

/**
 * Calculate schedule preview for all workflow steps
 */
export function calculateSchedulePreview(
  course: CourseForWorkflow,
  workflow: WorkflowForAssignment
): SchedulePreviewItem[] {
  return workflow.steps.map((step) => ({
    stepId: step.id,
    stepOrder: step.order,
    templateName: step.template.name,
    triggerType: step.triggerType,
    triggerOffset: step.triggerOffset,
    triggerClassIndex: step.triggerClassIndex,
    scheduledAt: calculateScheduledAt(
      course,
      step,
      workflow.sendAtHour,
      workflow.sendAtMinute,
      workflow.sendAtTimezone
    ),
    description: formatTriggerDescription(
      step.triggerType,
      step.triggerOffset,
      step.triggerClassIndex
    ),
  }))
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * Assign a workflow to a course
 * Creates CourseWorkflow and generates executions for all enrolled students
 */
export async function assignWorkflowToCourse(data: {
  workflowId: string
  courseId: string
  educatorId: string
}): Promise<{ courseWorkflowId: string; executionsCreated: number }> {
  const { workflowId, courseId, educatorId } = data

  // Verify workflow belongs to educator and is active
  const workflow = await getWorkflowForAssignment(workflowId, educatorId)
  if (!workflow) {
    throw new Error('Workflow no encontrado o no está activo')
  }

  // Verify course belongs to educator
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      educatorId,
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      examDate: true,
      classDates: true,
      registrationDeadline: true,
      enrolledCount: true,
    },
  })

  if (!course) {
    throw new Error('Curso no encontrado')
  }

  // Validate dates
  const validation = validateCourseDatesForWorkflow(course, workflow.steps)
  if (!validation.isValid) {
    const missingLabels = validation.missingDates.map((d) => d.label).join(', ')
    throw new Error(`El curso no tiene las fechas necesarias: ${missingLabels}`)
  }

  // Check if workflow is already assigned to this course
  const existing = await prisma.courseWorkflow.findUnique({
    where: {
      courseId_workflowTemplateId: {
        courseId,
        workflowTemplateId: workflowId,
      },
    },
  })

  if (existing) {
    throw new Error('Este workflow ya está asignado a este curso')
  }

  // Create CourseWorkflow
  const courseWorkflow = await prisma.courseWorkflow.create({
    data: {
      courseId,
      workflowTemplateId: workflowId,
      status: 'active',
    },
  })

  // Generate executions for enrolled students
  const executionsCreated = await generateExecutionsForCourseWorkflow(
    courseWorkflow.id,
    course,
    workflow
  )

  return {
    courseWorkflowId: courseWorkflow.id,
    executionsCreated,
  }
}

/**
 * Generate workflow executions for all enrolled students in a course
 */
async function generateExecutionsForCourseWorkflow(
  courseWorkflowId: string,
  course: CourseForWorkflow,
  workflow: WorkflowForAssignment
): Promise<number> {
  // Get all confirmed enrollments for the course
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: course.id,
      status: EnrollmentStatus.confirmed,
    },
    include: {
      student: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
    },
  })

  const now = new Date()
  let executionsCreated = 0

  // For each enrollment, create executions for each step
  for (const enrollment of enrollments) {
    for (const step of workflow.steps) {
      const scheduledAt = calculateScheduledAt(
        course,
        step,
        workflow.sendAtHour,
        workflow.sendAtMinute,
        workflow.sendAtTimezone
      )

      // Only create execution if scheduled date is today or in the future
      if (scheduledAt && scheduledAt >= startOfDay(now)) {
        // Check if execution already exists (avoid duplicates)
        const existing = await prisma.workflowExecution.findUnique({
          where: {
            courseWorkflowId_workflowStepId_studentId: {
              courseWorkflowId,
              workflowStepId: step.id,
              studentId: enrollment.studentId,
            },
          },
        })

        if (!existing) {
          await prisma.workflowExecution.create({
            data: {
              courseWorkflowId,
              workflowStepId: step.id,
              studentId: enrollment.studentId,
              enrollmentId: enrollment.id,
              email: enrollment.student.user.email,
              scheduledAt,
              status: 'pending',
            },
          })
          executionsCreated++
        }
      }
    }
  }

  return executionsCreated
}

/**
 * Generate workflow executions for a newly enrolled student
 * Called when a student enrollment is confirmed
 */
export async function generateExecutionsForNewStudent(
  courseId: string,
  studentId: string,
  enrollmentId: string
): Promise<number> {
  // Get the student's email
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: { email: true },
      },
    },
  })

  if (!student) {
    throw new Error('Student not found')
  }

  // Get all active course workflows for this course
  const courseWorkflows = await prisma.courseWorkflow.findMany({
    where: {
      courseId,
      status: 'active',
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          examDate: true,
          classDates: true,
          registrationDeadline: true,
          enrolledCount: true,
        },
      },
      workflowTemplate: {
        select: {
          id: true,
          name: true,
          sendAtHour: true,
          sendAtMinute: true,
          sendAtTimezone: true,
          steps: {
            select: {
              id: true,
              triggerType: true,
              triggerOffset: true,
              triggerClassIndex: true,
              order: true,
              template: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                  body: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  const now = new Date()
  let executionsCreated = 0

  for (const cw of courseWorkflows) {
    const course = cw.course
    const workflow = cw.workflowTemplate

    for (const step of workflow.steps) {
      const scheduledAt = calculateScheduledAt(
        course,
        step,
        workflow.sendAtHour,
        workflow.sendAtMinute,
        workflow.sendAtTimezone
      )

      // Only create execution if scheduled date is today or in the future
      if (scheduledAt && scheduledAt >= startOfDay(now)) {
        // Check if execution already exists (avoid duplicates)
        const existing = await prisma.workflowExecution.findUnique({
          where: {
            courseWorkflowId_workflowStepId_studentId: {
              courseWorkflowId: cw.id,
              workflowStepId: step.id,
              studentId,
            },
          },
        })

        if (!existing) {
          await prisma.workflowExecution.create({
            data: {
              courseWorkflowId: cw.id,
              workflowStepId: step.id,
              studentId,
              enrollmentId,
              email: student.user.email,
              scheduledAt,
              status: 'pending',
            },
          })
          executionsCreated++
        }
      }
    }
  }

  return executionsCreated
}

/**
 * Toggle course workflow status between active and paused
 */
export async function toggleCourseWorkflowStatus(
  id: string,
  educatorId: string
): Promise<CourseWorkflowStatus> {
  // Verify ownership
  const courseWorkflow = await prisma.courseWorkflow.findFirst({
    where: {
      id,
      course: {
        educatorId,
      },
    },
  })

  if (!courseWorkflow) {
    throw new Error('Workflow no encontrado')
  }

  const newStatus: CourseWorkflowStatus =
    courseWorkflow.status === 'active' ? 'paused' : 'active'

  await prisma.courseWorkflow.update({
    where: { id },
    data: { status: newStatus },
  })

  return newStatus
}

/**
 * Remove a workflow assignment from a course
 * This will also delete all pending executions
 */
export async function removeCourseWorkflow(
  id: string,
  educatorId: string
): Promise<void> {
  // Verify ownership
  const courseWorkflow = await prisma.courseWorkflow.findFirst({
    where: {
      id,
      course: {
        educatorId,
      },
    },
  })

  if (!courseWorkflow) {
    throw new Error('Workflow no encontrado')
  }

  // Delete CourseWorkflow (cascade will delete executions)
  await prisma.courseWorkflow.delete({
    where: { id },
  })
}

// =============================================================================
// Cron Processing Functions
// =============================================================================

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://academy.tinta.wine'

/**
 * Get all pending workflow executions that are due for sending
 */
export async function getPendingWorkflowExecutions() {
  const now = new Date()

  return prisma.workflowExecution.findMany({
    where: {
      status: 'pending',
      scheduledAt: {
        lte: now,
      },
      courseWorkflow: {
        status: 'active',
      },
    },
    include: {
      courseWorkflow: {
        include: {
          course: true,
          workflowTemplate: {
            include: {
              educator: true,
            },
          },
        },
      },
      workflowStep: {
        include: {
          template: true,
        },
      },
      student: {
        include: {
          user: {
            select: { email: true },
          },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 100, // Process in batches of 100
  })
}

/**
 * Process a single workflow execution (send the email)
 */
export async function processWorkflowExecution(
  execution: Awaited<ReturnType<typeof getPendingWorkflowExecutions>>[0]
): Promise<{ success: boolean; error?: string }> {
  const { courseWorkflow, workflowStep, student } = execution
  const { course, workflowTemplate } = courseWorkflow
  const { template } = workflowStep

  // Build template variables
  const studentName =
    [student.firstName, student.lastName].filter(Boolean).join(' ') ||
    'Estudiante'

  const variables: TemplateVariables = {
    studentName,
    studentFirstName: student.firstName || 'Estudiante',
    studentEmail: student.user.email,
    courseName: course.title,
    courseStartDate: formatDateForTemplate(course.startDate),
    courseEndDate: formatDateForTemplate(course.endDate),
    examDate: formatDateForTemplate(course.examDate),
    educatorName: workflowTemplate.educator.name,
    courseUrl: `${baseUrl}/student/courses/${course.id}`,
  }

  // Render template
  const renderedSubject = renderTemplate(template.subject, variables)
  const renderedBody = renderTemplate(template.body, variables)

  // Update status to sending
  await prisma.workflowExecution.update({
    where: { id: execution.id },
    data: { status: 'sending' },
  })

  // Send email
  const result = await sendDynamicEmail({
    to: execution.email,
    subject: renderedSubject,
    body: renderedBody,
  })

  // Update status based on result
  if (result.success) {
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'sent',
        resendId: result.resendId,
        sentAt: new Date(),
      },
    })

    // Check if workflow should be marked as completed
    await checkAndCompleteWorkflow(execution.courseWorkflowId)

    return { success: true }
  } else {
    await prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: 'failed',
        errorMessage: result.error,
      },
    })
    return { success: false, error: result.error }
  }
}

/**
 * Helper to delay execution (for rate limiting)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Process all pending workflow executions
 * Called by the cron job
 */
export async function processAllPendingExecutions(): Promise<{
  processed: number
  sent: number
  failed: number
}> {
  const executions = await getPendingWorkflowExecutions()

  let sent = 0
  let failed = 0

  for (let i = 0; i < executions.length; i++) {
    const execution = executions[i]

    try {
      const result = await processWorkflowExecution(execution)
      if (result.success) {
        sent++
      } else {
        failed++
      }
    } catch (error) {
      console.error(
        `[Workflow] Error processing execution ${execution.id}:`,
        error
      )
      failed++

      // Update status to failed
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      })
    }

    // Add delay between sends to respect Resend rate limits (100ms)
    if (i < executions.length - 1) {
      await delay(100)
    }
  }

  return {
    processed: executions.length,
    sent,
    failed,
  }
}

// =============================================================================
// Advanced Management Functions
// =============================================================================

export interface ExecutionWithDetails {
  id: string
  scheduledAt: Date
  status: string
  sentAt: Date | null
  errorMessage: string | null
  student: {
    id: string
    firstName: string | null
    lastName: string | null
  }
  workflowStep: {
    id: string
    order: number
    triggerType: WorkflowTriggerType
    triggerOffset: number
    triggerClassIndex: number | null
    template: {
      id: string
      name: string
      subject: string
    }
  }
}

export interface CourseWorkflowStats {
  pending: number
  sent: number
  failed: number
  total: number
}

/**
 * Get pending executions for a course workflow
 */
export async function getPendingExecutionsForCourseWorkflow(
  courseWorkflowId: string
): Promise<ExecutionWithDetails[]> {
  const executions = await prisma.workflowExecution.findMany({
    where: {
      courseWorkflowId,
      status: 'pending',
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      workflowStep: {
        include: {
          template: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return executions.map((e) => ({
    id: e.id,
    scheduledAt: e.scheduledAt,
    status: e.status,
    sentAt: e.sentAt,
    errorMessage: e.errorMessage,
    student: e.student,
    workflowStep: e.workflowStep,
  }))
}

/**
 * Get execution history (sent/failed) for a course workflow
 */
export async function getExecutionHistoryForCourseWorkflow(
  courseWorkflowId: string
): Promise<ExecutionWithDetails[]> {
  const executions = await prisma.workflowExecution.findMany({
    where: {
      courseWorkflowId,
      // Include all states that represent processed emails (sent successfully or failed)
      status: { in: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'] },
    },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      workflowStep: {
        include: {
          template: {
            select: {
              id: true,
              name: true,
              subject: true,
            },
          },
        },
      },
    },
    orderBy: { sentAt: 'desc' },
  })

  return executions.map((e) => ({
    id: e.id,
    scheduledAt: e.scheduledAt,
    status: e.status,
    sentAt: e.sentAt,
    errorMessage: e.errorMessage,
    student: e.student,
    workflowStep: e.workflowStep,
  }))
}

/**
 * Get statistics for a course workflow
 */
export async function getCourseWorkflowStats(
  courseWorkflowId: string
): Promise<CourseWorkflowStats> {
  const [pending, sent, failed] = await Promise.all([
    prisma.workflowExecution.count({
      where: { courseWorkflowId, status: 'pending' },
    }),
    // Count all successfully sent states
    prisma.workflowExecution.count({
      where: { courseWorkflowId, status: { in: ['sent', 'delivered', 'opened', 'clicked'] } },
    }),
    // Count all failed states
    prisma.workflowExecution.count({
      where: { courseWorkflowId, status: { in: ['failed', 'bounced'] } },
    }),
  ])

  return {
    pending,
    sent,
    failed,
    total: pending + sent + failed,
  }
}

/**
 * Count executions that would be affected by a course date change
 */
export async function countAffectedExecutions(
  courseId: string
): Promise<number> {
  // Get all active course workflows for this course
  const courseWorkflows = await prisma.courseWorkflow.findMany({
    where: {
      courseId,
      status: 'active',
    },
    select: { id: true },
  })

  if (courseWorkflows.length === 0) return 0

  const courseWorkflowIds = courseWorkflows.map((cw) => cw.id)

  // Count pending executions across all active workflows
  return prisma.workflowExecution.count({
    where: {
      courseWorkflowId: { in: courseWorkflowIds },
      status: 'pending',
    },
  })
}

/**
 * Recalculate execution dates for all pending executions of a course
 * This is called when course dates change
 */
export async function recalculateExecutionsForCourse(
  courseId: string,
  educatorId: string
): Promise<{ updated: number; deleted: number }> {
  // Verify ownership
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      educatorId,
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      examDate: true,
      classDates: true,
      registrationDeadline: true,
      enrolledCount: true,
    },
  })

  if (!course) {
    throw new Error('Curso no encontrado')
  }

  // Get all active course workflows
  const courseWorkflows = await prisma.courseWorkflow.findMany({
    where: {
      courseId,
      status: 'active',
    },
    include: {
      workflowTemplate: {
        include: {
          steps: {
            select: {
              id: true,
              triggerType: true,
              triggerOffset: true,
              triggerClassIndex: true,
              order: true,
              template: {
                select: {
                  id: true,
                  name: true,
                  subject: true,
                  body: true,
                },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  const now = new Date()
  let updated = 0
  let deleted = 0

  for (const cw of courseWorkflows) {
    const workflow = cw.workflowTemplate

    // Get all pending executions for this course workflow
    const pendingExecutions = await prisma.workflowExecution.findMany({
      where: {
        courseWorkflowId: cw.id,
        status: 'pending',
      },
    })

    for (const execution of pendingExecutions) {
      // Find the step for this execution
      const step = workflow.steps.find((s) => s.id === execution.workflowStepId)

      if (!step) {
        // Step no longer exists, delete execution
        await prisma.workflowExecution.delete({
          where: { id: execution.id },
        })
        deleted++
        continue
      }

      // Calculate new scheduled date
      const newScheduledAt = calculateScheduledAt(
        course,
        step,
        workflow.sendAtHour,
        workflow.sendAtMinute,
        workflow.sendAtTimezone
      )

      if (!newScheduledAt || newScheduledAt < startOfDay(now)) {
        // Date is before today or invalid, delete execution
        await prisma.workflowExecution.delete({
          where: { id: execution.id },
        })
        deleted++
      } else {
        // Update scheduled date
        await prisma.workflowExecution.update({
          where: { id: execution.id },
          data: { scheduledAt: newScheduledAt },
        })
        updated++
      }
    }
  }

  return { updated, deleted }
}

/**
 * Check if a workflow should be marked as completed and update if so
 */
export async function checkAndCompleteWorkflow(
  courseWorkflowId: string
): Promise<boolean> {
  // Count pending executions
  const pendingCount = await prisma.workflowExecution.count({
    where: {
      courseWorkflowId,
      status: 'pending',
    },
  })

  // If no pending executions, mark as completed
  if (pendingCount === 0) {
    // Only mark as completed if it's currently active
    const updated = await prisma.courseWorkflow.updateMany({
      where: {
        id: courseWorkflowId,
        status: 'active',
      },
      data: { status: 'completed' },
    })

    return updated.count > 0
  }

  return false
}
