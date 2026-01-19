import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// =============================================================================
// Template Variable Types
// =============================================================================

export interface TemplateVariables {
  studentName?: string
  studentFirstName?: string
  studentEmail?: string
  courseName?: string
  courseStartDate?: string
  courseEndDate?: string
  examDate?: string
  educatorName?: string
  courseUrl?: string
}

/**
 * Replace template variables in a string
 * Variables use the format {{variableName}}
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template

  // Replace each variable
  if (variables.studentName) {
    result = result.replace(/\{\{studentName\}\}/g, variables.studentName)
  }
  if (variables.studentFirstName) {
    result = result.replace(/\{\{studentFirstName\}\}/g, variables.studentFirstName)
  }
  if (variables.studentEmail) {
    result = result.replace(/\{\{studentEmail\}\}/g, variables.studentEmail)
  }
  if (variables.courseName) {
    result = result.replace(/\{\{courseName\}\}/g, variables.courseName)
  }
  if (variables.courseStartDate) {
    result = result.replace(/\{\{courseStartDate\}\}/g, variables.courseStartDate)
  }
  if (variables.courseEndDate) {
    result = result.replace(/\{\{courseEndDate\}\}/g, variables.courseEndDate)
  }
  if (variables.examDate) {
    result = result.replace(/\{\{examDate\}\}/g, variables.examDate)
  }
  if (variables.educatorName) {
    result = result.replace(/\{\{educatorName\}\}/g, variables.educatorName)
  }
  if (variables.courseUrl) {
    result = result.replace(/\{\{courseUrl\}\}/g, variables.courseUrl)
  }

  return result
}

/**
 * Format a date for template variables
 */
export function formatDateForTemplate(date: Date | null | undefined): string {
  if (!date) return ''
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Get all email templates for an educator
 * Optionally filter by search query (searches name, subject, and body)
 */
export async function getTemplatesByEducator(
  educatorId: string,
  search?: string
) {
  return prisma.emailTemplate.findMany({
    where: {
      educatorId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get a single template by ID with ownership check
 */
export async function getTemplateById(id: string, educatorId: string) {
  return prisma.emailTemplate.findFirst({
    where: {
      id,
      educatorId
    }
  })
}

/**
 * Create a new email template
 */
export async function createTemplate(data: {
  name: string
  subject: string
  body: string
  educatorId: string
}) {
  return prisma.emailTemplate.create({
    data: {
      name: data.name,
      subject: data.subject,
      body: data.body,
      educatorId: data.educatorId
    }
  })
}

/**
 * Update an existing template with ownership check
 */
export async function updateTemplate(
  id: string,
  educatorId: string,
  data: {
    name?: string
    subject?: string
    body?: string
  }
) {
  // First verify ownership
  const existing = await prisma.emailTemplate.findFirst({
    where: { id, educatorId }
  })

  if (!existing) {
    throw new Error('Template not found or access denied')
  }

  return prisma.emailTemplate.update({
    where: { id },
    data
  })
}

/**
 * Check if a template is used in any workflow step
 */
export async function isTemplateInUse(id: string): Promise<boolean> {
  const count = await prisma.workflowStep.count({
    where: { templateId: id }
  })
  return count > 0
}

/**
 * Delete a template with ownership check
 * Throws error if template is used in workflows
 */
export async function deleteTemplate(id: string, educatorId: string) {
  // First verify ownership
  const existing = await prisma.emailTemplate.findFirst({
    where: { id, educatorId }
  })

  if (!existing) {
    throw new Error('Template not found or access denied')
  }

  // Check if template is in use
  const inUse = await isTemplateInUse(id)
  if (inUse) {
    throw new Error('Cannot delete template: it is being used in one or more workflows')
  }

  return prisma.emailTemplate.delete({
    where: { id }
  })
}
