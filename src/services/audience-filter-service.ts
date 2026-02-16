import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import type {
  FilterConditions,
  FilterCondition,
  ConditionGroup,
  FilterPreviewResult,
  AudienceFilterWithEducator,
  FilterForSelection,
  DateRangeValue,
} from '@/types/audience-filter'

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Get all filters visible to an educator (own filters + public filters)
 */
export async function getFiltersByEducator(
  educatorId: string,
  search?: string
): Promise<AudienceFilterWithEducator[]> {
  const filters = await prisma.audienceFilter.findMany({
    where: {
      AND: [
        { OR: [{ educatorId }, { isPublic: true }] },
        ...(search
          ? [
              {
                OR: [
                  { name: { contains: search, mode: 'insensitive' as const } },
                  { description: { contains: search, mode: 'insensitive' as const } },
                ],
              },
            ]
          : []),
      ],
    },
    include: {
      educator: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          campaigns: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return filters
}

/**
 * Get filters available for selection in campaign creation
 */
export async function getFiltersForSelection(
  educatorId: string
): Promise<FilterForSelection[]> {
  const filters = await prisma.audienceFilter.findMany({
    where: {
      OR: [{ educatorId }, { isPublic: true }],
    },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      educatorId: true,
      cachedStudentCount: true,
      educator: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return filters.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    isPublic: f.isPublic,
    educatorId: f.educatorId,
    educatorName: f.educator.name,
    cachedStudentCount: f.cachedStudentCount,
  }))
}

/**
 * Get a single filter by ID (must be owned by educator or public)
 */
export async function getFilterById(
  id: string,
  educatorId: string
): Promise<AudienceFilterWithEducator | null> {
  const filter = await prisma.audienceFilter.findFirst({
    where: {
      id,
      OR: [{ educatorId }, { isPublic: true }],
    },
    include: {
      educator: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          campaigns: true,
        },
      },
    },
  })

  return filter
}

/**
 * Create a new audience filter
 */
export async function createFilter(data: {
  name: string
  description?: string
  isPublic: boolean
  conditions: FilterConditions
  educatorId: string
}) {
  return prisma.audienceFilter.create({
    data: {
      name: data.name,
      description: data.description,
      isPublic: data.isPublic,
      conditions: JSON.stringify(data.conditions),
      educatorId: data.educatorId,
    },
    include: {
      educator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Update an existing filter (must be owned by educator)
 */
export async function updateFilter(
  id: string,
  educatorId: string,
  data: {
    name?: string
    description?: string
    isPublic?: boolean
    conditions?: FilterConditions
  }
) {
  // Verify ownership
  const existing = await prisma.audienceFilter.findFirst({
    where: { id, educatorId },
  })

  if (!existing) {
    throw new Error('Filtro no encontrado o acceso denegado')
  }

  return prisma.audienceFilter.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      ...(data.conditions !== undefined && {
        conditions: JSON.stringify(data.conditions),
      }),
    },
    include: {
      educator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Delete a filter (must be owned by educator)
 */
export async function deleteFilter(id: string, educatorId: string) {
  // Verify ownership
  const existing = await prisma.audienceFilter.findFirst({
    where: { id, educatorId },
  })

  if (!existing) {
    throw new Error('Filtro no encontrado o acceso denegado')
  }

  // Check if filter is used in campaigns
  const campaignsCount = await prisma.emailCampaign.count({
    where: { audienceFilterId: id },
  })

  if (campaignsCount > 0) {
    throw new Error(
      `No se puede eliminar: el filtro está siendo usado en ${campaignsCount} campaña(s)`
    )
  }

  return prisma.audienceFilter.delete({
    where: { id },
  })
}

// =============================================================================
// Filter Evaluation (Query Builder)
// =============================================================================

/**
 * Build a Prisma where clause for course conditions based on a single FilterCondition
 */
function buildCourseCondition(
  condition: FilterCondition
): Prisma.CourseWhereInput {
  const { property, value } = condition

  switch (property) {
    case 'type':
      return { type: value as Prisma.EnumCourseTypeFilter }

    case 'modality':
      return { modality: value as Prisma.EnumCourseModalityFilter }

    case 'wsetLevel':
      return { type: 'wset', wsetLevel: value as number }

    case 'tags': {
      const tagSlugs = value as string[]
      if (tagSlugs.length === 0) return {}
      return {
        tags: {
          some: {
            slug: { in: tagSlugs },
          },
        },
      }
    }

    case 'dateRange': {
      const dateRange = value as DateRangeValue
      return buildDateRangeCondition(dateRange)
    }

    default:
      return {}
  }
}

/**
 * Build date range condition for courses
 */
function buildDateRangeCondition(
  dateRange: DateRangeValue
): Prisma.CourseWhereInput {
  const now = new Date()

  switch (dateRange.type) {
    case 'last_months': {
      const months = dateRange.months || 6
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)
      return {
        startDate: { gte: startDate },
      }
    }

    case 'this_year': {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      return {
        startDate: { gte: yearStart, lte: yearEnd },
      }
    }

    case 'last_year': {
      const lastYear = now.getFullYear() - 1
      const yearStart = new Date(lastYear, 0, 1)
      const yearEnd = new Date(lastYear, 11, 31, 23, 59, 59)
      return {
        startDate: { gte: yearStart, lte: yearEnd },
      }
    }

    case 'before': {
      if (!dateRange.date) return {}
      return {
        startDate: { lt: new Date(dateRange.date) },
      }
    }

    case 'after': {
      if (!dateRange.date) return {}
      return {
        startDate: { gt: new Date(dateRange.date) },
      }
    }

    case 'between': {
      if (!dateRange.startDate || !dateRange.endDate) return {}
      return {
        startDate: {
          gte: new Date(dateRange.startDate),
          lte: new Date(dateRange.endDate),
        },
      }
    }

    default:
      return {}
  }
}

/**
 * Build Prisma where clause for a condition group (AND logic within group)
 */
function buildGroupCondition(
  group: ConditionGroup
): Prisma.StudentWhereInput | null {
  if (group.conditions.length === 0) return null

  // Separate attended and not_attended conditions
  const attendedConditions = group.conditions.filter(
    (c) => c.operator === 'attended'
  )
  const notAttendedConditions = group.conditions.filter(
    (c) => c.operator === 'not_attended'
  )

  const andClauses: Prisma.StudentWhereInput[] = []

  // Process attended conditions: student must have enrollment matching ALL course conditions
  // Only consider courses that have already started (in_progress or finished)
  if (attendedConditions.length > 0) {
    const courseConditions = attendedConditions.map(buildCourseCondition)
    andClauses.push({
      enrollments: {
        some: {
          status: 'confirmed',
          course: {
            AND: [
              ...courseConditions,
              { status: { in: ['in_progress', 'finished'] } },
            ],
          },
        },
      },
    })
  }

  // Process not_attended conditions: student must NOT have enrollment matching each course condition
  // Only consider courses that have already started (in_progress or finished)
  for (const condition of notAttendedConditions) {
    const courseCondition = buildCourseCondition(condition)
    andClauses.push({
      NOT: {
        enrollments: {
          some: {
            status: 'confirmed',
            course: {
              AND: [
                courseCondition,
                { status: { in: ['in_progress', 'finished'] } },
              ],
            },
          },
        },
      },
    })
  }

  if (andClauses.length === 0) return null
  if (andClauses.length === 1) return andClauses[0]

  return { AND: andClauses }
}

/**
 * Build the complete Prisma where clause for filter conditions (OR logic between groups)
 */
export function buildFilterWhereClause(
  conditions: FilterConditions
): Prisma.StudentWhereInput {
  const groupConditions = conditions.groups
    .map(buildGroupCondition)
    .filter((c): c is Prisma.StudentWhereInput => c !== null)

  if (groupConditions.length === 0) {
    // No valid conditions, return empty result
    return { id: { equals: 'impossible_id' } }
  }

  if (groupConditions.length === 1) {
    return groupConditions[0]
  }

  return { OR: groupConditions }
}

/**
 * Evaluate a filter and return matching students
 */
export async function evaluateFilter(
  conditions: FilterConditions,
  limit?: number
): Promise<FilterPreviewResult> {
  const whereClause = buildFilterWhereClause(conditions)

  // Get count
  const count = await prisma.student.count({
    where: whereClause,
  })

  // Get students (with limit for preview)
  const students = await prisma.student.findMany({
    where: whereClause,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    take: limit || 50,
  })

  return {
    count,
    students: students.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.user.email,
    })),
  }
}

/**
 * Get student IDs matching a filter (for campaign sending)
 */
export async function getStudentIdsByFilter(
  filterId: string
): Promise<string[]> {
  const filter = await prisma.audienceFilter.findUnique({
    where: { id: filterId },
  })

  if (!filter) {
    throw new Error('Filtro no encontrado')
  }

  const conditions = JSON.parse(filter.conditions) as FilterConditions
  const whereClause = buildFilterWhereClause(conditions)

  const students = await prisma.student.findMany({
    where: whereClause,
    select: { id: true },
  })

  return students.map((s) => s.id)
}

/**
 * Update cached student count for a filter
 */
export async function updateFilterCache(filterId: string): Promise<number> {
  const filter = await prisma.audienceFilter.findUnique({
    where: { id: filterId },
  })

  if (!filter) {
    throw new Error('Filtro no encontrado')
  }

  const conditions = JSON.parse(filter.conditions) as FilterConditions
  const whereClause = buildFilterWhereClause(conditions)

  const count = await prisma.student.count({
    where: whereClause,
  })

  await prisma.audienceFilter.update({
    where: { id: filterId },
    data: {
      cachedStudentCount: count,
      cachedAt: new Date(),
    },
  })

  return count
}

// =============================================================================
// Tag Helpers
// =============================================================================

/**
 * Get all available tags for filter selection
 */
export async function getAllTags() {
  return prisma.tag.findMany({
    select: {
      slug: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  })
}

/**
 * Get student counts for multiple filters in a single batch
 */
export async function getFilterCountsBatch(
  filterIds: string[],
  educatorId: string
): Promise<Map<string, number>> {
  const results = new Map<string, number>()

  if (filterIds.length === 0) return results

  // Get all filters that are accessible to this educator
  const filters = await prisma.audienceFilter.findMany({
    where: {
      id: { in: filterIds },
      OR: [{ educatorId }, { isPublic: true }],
    },
    select: {
      id: true,
      conditions: true,
    },
  })

  // Evaluate each filter in parallel
  await Promise.all(
    filters.map(async (filter) => {
      try {
        const conditions = JSON.parse(filter.conditions) as FilterConditions
        const whereClause = buildFilterWhereClause(conditions)
        const count = await prisma.student.count({ where: whereClause })
        results.set(filter.id, count)
      } catch {
        // Skip filters with invalid conditions
        results.set(filter.id, 0)
      }
    })
  )

  return results
}
