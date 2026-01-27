import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import sanitize from 'sanitize-html'

// =============================================================================
// HTML Sanitization Configuration
// =============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe tags commonly used in email templates
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'pre', 'code',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['style', 'class'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    },
  })
}

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
 * Placeholders for variables without values
 */
const VARIABLE_PLACEHOLDERS: Record<keyof TemplateVariables, string> = {
  studentName: '[Sin nombre]',
  studentFirstName: '[Sin nombre]',
  studentEmail: '[Sin email]',
  courseName: '[Sin curso]',
  courseStartDate: '[Sin fecha]',
  courseEndDate: '[Sin fecha]',
  examDate: '[Sin fecha]',
  educatorName: '[Sin educador]',
  courseUrl: '[Sin URL]',
}

/**
 * Replace template variables in a string
 * Variables use the format {{variableName}}
 * Missing values are replaced with placeholders like [Sin curso]
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template

  // Replace each variable with its value or a placeholder
  for (const key of Object.keys(VARIABLE_PLACEHOLDERS) as (keyof TemplateVariables)[]) {
    const value = variables[key]
    const replacement = value || VARIABLE_PLACEHOLDERS[key]
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), replacement)
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
 * HTML body is sanitized before saving to prevent XSS
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
      body: sanitizeHtml(data.body),
      educatorId: data.educatorId
    }
  })
}

/**
 * Update an existing template with ownership check
 * HTML body is sanitized before saving to prevent XSS
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

  // Sanitize body if provided
  const sanitizedData = {
    ...data,
    ...(data.body && { body: sanitizeHtml(data.body) })
  }

  return prisma.emailTemplate.update({
    where: { id },
    data: sanitizedData
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
