import { prisma } from '@/lib/prisma'

/**
 * Get all email templates for an educator
 */
export async function getTemplatesByEducator(educatorId: string) {
  return prisma.emailTemplate.findMany({
    where: { educatorId },
    orderBy: { updatedAt: 'desc' }
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
