import { prisma } from '@/lib/prisma'
import type { EmailCampaignStatus } from '@prisma/client'

/**
 * Get all campaigns for an educator with optional filters
 */
export async function getCampaignsByEducator(
  educatorId: string,
  filters?: {
    courseId?: string
    status?: EmailCampaignStatus
  }
) {
  return prisma.emailCampaign.findMany({
    where: {
      educatorId,
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.status && { status: filters.status })
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          subject: true
        }
      },
      course: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Get a single campaign by ID with template and recipients
 */
export async function getCampaignById(id: string, educatorId: string) {
  return prisma.emailCampaign.findFirst({
    where: {
      id,
      educatorId
    },
    include: {
      template: true,
      course: {
        select: {
          id: true,
          title: true
        }
      },
      recipients: {
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              user: {
                select: {
                  email: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })
}

/**
 * Create a new email campaign in draft status
 */
export async function createCampaign(data: {
  name: string
  templateId: string
  educatorId: string
  courseId?: string
  scheduledAt?: Date
  timezone: string
}) {
  return prisma.emailCampaign.create({
    data: {
      name: data.name,
      templateId: data.templateId,
      educatorId: data.educatorId,
      courseId: data.courseId,
      scheduledAt: data.scheduledAt,
      timezone: data.timezone,
      status: 'draft'
    }
  })
}

/**
 * Add recipients to a campaign (bulk insert)
 */
export async function addRecipientsToCampaign(
  campaignId: string,
  recipients: Array<{ studentId: string; email: string }>
) {
  // Use createMany for efficient bulk insert
  await prisma.emailRecipient.createMany({
    data: recipients.map((r) => ({
      campaignId,
      studentId: r.studentId,
      email: r.email,
      status: 'pending' as const
    })),
    skipDuplicates: true
  })

  // Update totalRecipients count on campaign
  const count = await prisma.emailRecipient.count({
    where: { campaignId }
  })

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { totalRecipients: count }
  })

  return count
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(
  id: string,
  status: EmailCampaignStatus
) {
  return prisma.emailCampaign.update({
    where: { id },
    data: {
      status,
      ...(status === 'sent' && { sentAt: new Date() })
    }
  })
}

/**
 * Recalculate and update campaign stats from recipients
 */
export async function updateCampaignStats(id: string) {
  const stats = await prisma.emailRecipient.groupBy({
    by: ['status'],
    where: { campaignId: id },
    _count: { status: true }
  })

  const statusCounts = stats.reduce(
    (acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    },
    {} as Record<string, number>
  )

  const totalRecipients = await prisma.emailRecipient.count({
    where: { campaignId: id }
  })

  return prisma.emailCampaign.update({
    where: { id },
    data: {
      totalRecipients,
      sentCount:
        (statusCounts['sent'] || 0) +
        (statusCounts['delivered'] || 0) +
        (statusCounts['opened'] || 0) +
        (statusCounts['clicked'] || 0),
      deliveredCount:
        (statusCounts['delivered'] || 0) +
        (statusCounts['opened'] || 0) +
        (statusCounts['clicked'] || 0),
      openedCount:
        (statusCounts['opened'] || 0) + (statusCounts['clicked'] || 0),
      clickedCount: statusCounts['clicked'] || 0,
      failedCount:
        (statusCounts['failed'] || 0) + (statusCounts['bounced'] || 0)
    }
  })
}
