import { prisma } from '@/lib/prisma'
import type { EmailCampaignStatus } from '@prisma/client'
import { sendDynamicEmail } from './email-service'
import {
  renderTemplate,
  formatDateForTemplate,
  type TemplateVariables
} from './email-template-service'

/**
 * Get recent campaigns for an educator (limited)
 */
export async function getRecentCampaigns(educatorId: string, limit: number = 10) {
  return prisma.emailCampaign.findMany({
    where: { educatorId },
    select: {
      id: true,
      name: true,
      status: true,
      totalRecipients: true,
      sentCount: true,
      scheduledAt: true,
      sentAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

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
  audienceFilterId?: string
  scheduledAt?: Date
  timezone: string
}) {
  return prisma.emailCampaign.create({
    data: {
      name: data.name,
      templateId: data.templateId,
      educatorId: data.educatorId,
      courseId: data.courseId,
      audienceFilterId: data.audienceFilterId,
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

// =============================================================================
// Campaign Send Processing
// =============================================================================

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://academy.tinta.wine'

/**
 * Helper to delay execution (for rate limiting)
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Process and send all pending emails for a campaign
 * Returns count of sent and failed emails
 */
export async function processCampaignSend(
  campaignId: string
): Promise<{ sent: number; failed: number }> {
  // Get campaign with template, recipients, course, and educator
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: {
      template: true,
      course: true,
      educator: true,
      recipients: {
        where: { status: 'pending' },
        include: {
          student: {
            include: {
              user: {
                select: { email: true }
              }
            }
          }
        }
      }
    }
  })

  if (!campaign) {
    throw new Error('Campaign not found')
  }

  // Update campaign status to 'sending'
  await updateCampaignStatus(campaignId, 'sending')

  let sent = 0
  let failed = 0

  // Process each recipient
  for (const recipient of campaign.recipients) {
    // Build variables object
    const studentName = [
      recipient.student.firstName,
      recipient.student.lastName
    ]
      .filter(Boolean)
      .join(' ') || 'Estudiante'

    const variables: TemplateVariables = {
      studentName,
      studentFirstName: recipient.student.firstName || 'Estudiante',
      studentEmail: recipient.student.user.email,
      courseName: campaign.course?.title,
      courseStartDate: formatDateForTemplate(campaign.course?.startDate),
      courseEndDate: formatDateForTemplate(campaign.course?.endDate),
      examDate: formatDateForTemplate(campaign.course?.examDate),
      educatorName: campaign.educator.name,
      courseUrl: campaign.course
        ? `${baseUrl}/student/courses/${campaign.course.id}`
        : undefined
    }

    // Render template with variables
    const renderedSubject = renderTemplate(campaign.template.subject, variables)
    const renderedBody = renderTemplate(campaign.template.body, variables)

    // Send email
    const result = await sendDynamicEmail({
      to: recipient.email,
      subject: renderedSubject,
      body: renderedBody
    })

    // Update recipient status
    if (result.success) {
      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'sent',
          resendId: result.resendId,
          sentAt: new Date()
        }
      })
      sent++
    } else {
      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'failed',
          errorMessage: result.error
        }
      })
      failed++
    }

    // Add delay between sends to respect Resend rate limits (100ms)
    if (campaign.recipients.indexOf(recipient) < campaign.recipients.length - 1) {
      await delay(100)
    }
  }

  // Update campaign stats
  await updateCampaignStats(campaignId)

  // Update campaign status based on results
  // If all succeeded -> 'sent', if some failed -> 'partially_sent'
  const finalStatus: EmailCampaignStatus =
    failed === 0 ? 'sent' : 'partially_sent'

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: finalStatus,
      sentAt: new Date()
    }
  })

  return { sent, failed }
}

// =============================================================================
// Campaign Scheduling
// =============================================================================

/**
 * Get all campaigns that are scheduled and due for sending (scheduledAt <= now)
 */
export async function getScheduledCampaignsDue() {
  const now = new Date()
  console.log('[getScheduledCampaignsDue] Checking for campaigns with scheduledAt <=', now.toISOString())

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      status: 'scheduled',
      scheduledAt: {
        lte: now
      }
    },
    include: {
      template: {
        select: {
          id: true,
          name: true
        }
      },
      educator: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  })

  console.log(`[getScheduledCampaignsDue] Found ${campaigns.length} due campaigns`)
  return campaigns
}

/**
 * Get all campaigns with status 'scheduled' (for debugging)
 */
export async function getAllScheduledCampaigns() {
  return prisma.emailCampaign.findMany({
    where: {
      status: 'scheduled'
    },
    select: {
      id: true,
      name: true,
      status: true,
      scheduledAt: true
    },
    orderBy: { scheduledAt: 'asc' }
  })
}

/**
 * Schedule a campaign for future sending
 */
export async function scheduleCampaign(
  campaignId: string,
  scheduledAt: Date,
  timezone: string
) {
  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'scheduled',
      scheduledAt,
      timezone
    }
  })
}

/**
 * Cancel a scheduled campaign (validates ownership)
 */
export async function cancelScheduledCampaign(
  campaignId: string,
  educatorId: string
) {
  // First verify the campaign exists and belongs to the educator
  const campaign = await prisma.emailCampaign.findFirst({
    where: {
      id: campaignId,
      educatorId
    }
  })

  if (!campaign) {
    throw new Error('Campaign not found or access denied')
  }

  if (campaign.status !== 'scheduled') {
    throw new Error('Only scheduled campaigns can be cancelled')
  }

  return prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'cancelled'
    }
  })
}

// =============================================================================
// Campaign History & Detail Queries
// =============================================================================

/**
 * Get campaigns with aggregated stats for history view
 */
export async function getCampaignsWithStats(
  educatorId: string,
  filters?: {
    courseId?: string
    status?: EmailCampaignStatus
    dateFrom?: Date
    dateTo?: Date
  }
) {
  return prisma.emailCampaign.findMany({
    where: {
      educatorId,
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters?.dateFrom && { gte: filters.dateFrom }),
              ...(filters?.dateTo && { lte: filters.dateTo })
            }
          }
        : {})
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
 * Get paginated recipients for a campaign
 */
export async function getCampaignRecipients(
  campaignId: string,
  options?: {
    skip?: number
    take?: number
  }
) {
  const { skip = 0, take = 50 } = options || {}

  const [recipients, total] = await Promise.all([
    prisma.emailRecipient.findMany({
      where: { campaignId },
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
      orderBy: { createdAt: 'asc' },
      skip,
      take
    }),
    prisma.emailRecipient.count({
      where: { campaignId }
    })
  ])

  return {
    recipients,
    total,
    hasMore: skip + take < total
  }
}

// =============================================================================
// Admin Functions
// =============================================================================

/**
 * Get all campaigns for admin panel with optional filters
 */
export async function getAllCampaignsForAdmin(filters?: {
  educatorId?: string
  status?: EmailCampaignStatus
  dateFrom?: Date
  dateTo?: Date
  search?: string
}) {
  return prisma.emailCampaign.findMany({
    where: {
      ...(filters?.educatorId && { educatorId: filters.educatorId }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.dateFrom || filters?.dateTo
        ? {
            createdAt: {
              ...(filters?.dateFrom && { gte: filters.dateFrom }),
              ...(filters?.dateTo && { lte: filters.dateTo })
            }
          }
        : {}),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { educator: { name: { contains: filters.search, mode: 'insensitive' } } }
        ]
      })
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
      },
      educator: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Get global campaign statistics for admin dashboard
 */
export async function getAdminCampaignStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalCampaigns,
    campaignsThisMonth,
    totalSent,
    totalDelivered,
    totalOpened
  ] = await Promise.all([
    prisma.emailCampaign.count(),
    prisma.emailCampaign.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    }),
    prisma.emailCampaign.aggregate({
      _sum: { sentCount: true }
    }),
    prisma.emailCampaign.aggregate({
      _sum: { deliveredCount: true }
    }),
    prisma.emailCampaign.aggregate({
      _sum: { openedCount: true }
    })
  ])

  const totalSentCount = totalSent._sum.sentCount || 0
  const totalDeliveredCount = totalDelivered._sum.deliveredCount || 0
  const totalOpenedCount = totalOpened._sum.openedCount || 0

  return {
    totalCampaigns,
    campaignsThisMonth,
    deliveryRate: totalSentCount > 0
      ? Math.round((totalDeliveredCount / totalSentCount) * 100)
      : 0,
    openRate: totalDeliveredCount > 0
      ? Math.round((totalOpenedCount / totalDeliveredCount) * 100)
      : 0
  }
}

/**
 * Get campaign by ID for admin (no educator ownership check)
 */
export async function getCampaignByIdForAdmin(id: string) {
  return prisma.emailCampaign.findUnique({
    where: { id },
    include: {
      template: true,
      course: {
        select: {
          id: true,
          title: true
        }
      },
      educator: {
        select: {
          id: true,
          name: true
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
        orderBy: { createdAt: 'asc' },
        take: 100
      }
    }
  })
}

/**
 * Get all educators with campaigns (for filter dropdown)
 */
export async function getEducatorsWithCampaigns() {
  return prisma.educator.findMany({
    where: {
      emailCampaigns: {
        some: {}
      }
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          emailCampaigns: true
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

// =============================================================================
// Course Communications History
// =============================================================================

export type CommunicationHistoryItem = {
  id: string
  type: 'campaign' | 'workflow'
  name: string
  templateName: string
  status: string
  recipientCount: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  date: Date
  scheduledAt?: Date | null
}

/**
 * Get combined communications history for a specific course
 * Returns both campaigns and workflow executions, sorted by date
 */
export async function getCommunicationsHistoryByCourse(
  courseId: string
): Promise<CommunicationHistoryItem[]> {
  // Get campaigns for this course
  const campaigns = await prisma.emailCampaign.findMany({
    where: { courseId },
    select: {
      id: true,
      name: true,
      status: true,
      totalRecipients: true,
      sentCount: true,
      deliveredCount: true,
      openedCount: true,
      scheduledAt: true,
      sentAt: true,
      createdAt: true,
      template: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get workflow executions for this course (grouped by workflow step)
  const workflowExecutions = await prisma.workflowExecution.groupBy({
    by: ['courseWorkflowId', 'workflowStepId'],
    where: {
      courseWorkflow: {
        courseId,
      },
    },
    _count: {
      id: true,
    },
    _max: {
      scheduledAt: true,
    },
  })

  // Get details for each workflow step
  const workflowDetails = await Promise.all(
    workflowExecutions.map(async (exec) => {
      const [stepInfo, statusCounts] = await Promise.all([
        prisma.workflowStep.findUnique({
          where: { id: exec.workflowStepId },
          include: {
            template: {
              select: { name: true },
            },
            workflowTemplate: {
              select: { name: true },
            },
          },
        }),
        prisma.workflowExecution.groupBy({
          by: ['status'],
          where: {
            courseWorkflowId: exec.courseWorkflowId,
            workflowStepId: exec.workflowStepId,
          },
          _count: { status: true },
        }),
      ])

      if (!stepInfo) return null

      const counts = statusCounts.reduce(
        (acc, s) => {
          acc[s.status] = s._count.status
          return acc
        },
        {} as Record<string, number>
      )

      const sentCount =
        (counts['sent'] || 0) +
        (counts['delivered'] || 0) +
        (counts['opened'] || 0) +
        (counts['clicked'] || 0)
      const deliveredCount =
        (counts['delivered'] || 0) +
        (counts['opened'] || 0) +
        (counts['clicked'] || 0)
      const openedCount = (counts['opened'] || 0) + (counts['clicked'] || 0)
      const pendingCount = counts['pending'] || 0

      // Determine overall status
      let status = 'pending'
      if (sentCount > 0 && pendingCount === 0) {
        status = 'sent'
      } else if (sentCount > 0 && pendingCount > 0) {
        status = 'sending'
      }

      // Create a step description using trigger type and order
      const stepName = `Paso ${stepInfo.order + 1}`

      return {
        id: `${exec.courseWorkflowId}-${exec.workflowStepId}`,
        type: 'workflow' as const,
        name: `${stepInfo.workflowTemplate.name}: ${stepName}`,
        templateName: stepInfo.template.name,
        status,
        recipientCount: exec._count.id,
        sentCount,
        deliveredCount,
        openedCount,
        date: exec._max.scheduledAt || new Date(),
        scheduledAt: exec._max.scheduledAt,
      }
    })
  )

  // Convert campaigns to common format
  const campaignItems: CommunicationHistoryItem[] = campaigns.map((c) => ({
    id: c.id,
    type: 'campaign' as const,
    name: c.name,
    templateName: c.template.name,
    status: c.status,
    recipientCount: c.totalRecipients,
    sentCount: c.sentCount,
    deliveredCount: c.deliveredCount,
    openedCount: c.openedCount,
    date: c.sentAt || c.createdAt,
    scheduledAt: c.scheduledAt,
  }))

  // Combine and sort by date (most recent first)
  const workflowItems = workflowDetails.filter(
    (w): w is NonNullable<typeof w> => w !== null
  )

  const combined = [...campaignItems, ...workflowItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return combined
}
