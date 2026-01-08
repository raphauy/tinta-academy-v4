import { prisma } from '@/lib/prisma'
import { Prisma, CourseModality, CourseType, CourseStatus } from '@prisma/client'

interface CourseFilters {
  modality?: string
  type?: string
  tagIds?: string[]
}

interface EducatorCourseFilters {
  status?: CourseStatus
  type?: CourseType
  modality?: CourseModality
}

export interface CreateCourseInput {
  title: string
  slug: string
  type: CourseType
  description?: string
  startDate?: Date
  endDate?: Date
  duration?: string
  // Class schedule fields
  classDates?: Date[]
  startTime?: string
  classDuration?: number
  examDate?: Date
  registrationDeadline?: Date
  // Capacity and other fields
  maxCapacity?: number
  priceUSD: number
  location?: string
  address?: string
  imageUrl?: string
  wsetLevel?: number
  educatorId: string
}

export interface UpdateCourseInput {
  title?: string
  slug?: string
  type?: CourseType
  description?: string
  startDate?: Date
  endDate?: Date
  duration?: string
  // Class schedule fields
  classDates?: Date[]
  startTime?: string
  classDuration?: number
  examDate?: Date
  registrationDeadline?: Date
  // Capacity and other fields
  maxCapacity?: number
  priceUSD?: number
  location?: string
  address?: string
  imageUrl?: string
  wsetLevel?: number
}

// Status values that are considered "published" (visible to public)
const publicStatuses: CourseStatus[] = [
  'announced',
  'enrolling',
  'full',
  'in_progress',
  'available',
  'finished',
]

export async function getCourses(filters: CourseFilters = {}) {
  const where: Prisma.CourseWhereInput = {
    // Only show published courses to public
    status: { in: publicStatuses },
  }

  if (filters.modality) {
    where.modality = filters.modality as CourseModality
  }

  if (filters.type) {
    where.type = filters.type as CourseType
  }

  if (filters.tagIds?.length) {
    where.tags = {
      some: {
        id: { in: filters.tagIds }
      }
    }
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      educator: true,
      tags: true,
    },
    orderBy: {
      startDate: 'asc'
    }
  })

  const now = new Date()
  const upcomingCourses = courses.filter(course => 
    course.status === 'available' || 
    (course.startDate && course.startDate > now)
  )
  
  const pastCourses = courses.filter(course => 
    course.status === 'finished' || 
    (course.startDate && course.startDate <= now && course.status !== 'available')
  )

  return {
    upcomingCourses,
    pastCourses
  }
}

export async function getUpcomingCourses(filters: CourseFilters = {}) {
  const { upcomingCourses } = await getCourses(filters)
  return upcomingCourses
}

export async function getPastCourses(filters: CourseFilters = {}) {
  const { pastCourses } = await getCourses(filters)
  return pastCourses
}

export async function getCourseBySlug(slug: string, includeUnpublished = false) {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      educator: true,
      tags: true,
    },
  })

  // If course is not found or should be hidden from public
  if (!course) return null
  if (!includeUnpublished && !publicStatuses.includes(course.status)) {
    return null
  }

  return course
}

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      educator: true,
      tags: true,
    },
  })
}

// ============================================
// EDUCATOR-SPECIFIC OPERATIONS
// ============================================

export async function getEducatorCourses(
  educatorId: string,
  filters: EducatorCourseFilters = {}
) {
  const where: Prisma.CourseWhereInput = {
    educatorId,
  }

  if (filters.status) {
    where.status = filters.status
  }

  if (filters.type) {
    where.type = filters.type
  }

  if (filters.modality) {
    where.modality = filters.modality
  }

  return prisma.course.findMany({
    where,
    include: {
      educator: true,
      tags: true,
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  })
}

export async function createCourse(data: CreateCourseInput) {
  return prisma.course.create({
    data: {
      title: data.title,
      slug: data.slug,
      type: data.type,
      modality: 'presencial', // Only presencial for now
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
      // Class schedule fields
      classDates: data.classDates ?? [],
      startTime: data.startTime,
      classDuration: data.classDuration,
      examDate: data.examDate,
      registrationDeadline: data.registrationDeadline,
      // Other fields
      maxCapacity: data.maxCapacity,
      priceUSD: data.priceUSD,
      location: data.location,
      address: data.address,
      imageUrl: data.imageUrl,
      wsetLevel: data.wsetLevel,
      status: 'draft', // New courses start as draft
      educatorId: data.educatorId,
    },
    include: {
      educator: true,
      tags: true,
    },
  })
}

export async function updateCourse(id: string, data: UpdateCourseInput) {
  return prisma.course.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate !== undefined && { startDate: data.startDate }),
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      ...(data.duration !== undefined && { duration: data.duration }),
      // Class schedule fields
      ...(data.classDates !== undefined && { classDates: data.classDates }),
      ...(data.startTime !== undefined && { startTime: data.startTime }),
      ...(data.classDuration !== undefined && { classDuration: data.classDuration }),
      ...(data.examDate !== undefined && { examDate: data.examDate }),
      ...(data.registrationDeadline !== undefined && { registrationDeadline: data.registrationDeadline }),
      // Other fields
      ...(data.maxCapacity !== undefined && { maxCapacity: data.maxCapacity }),
      ...(data.priceUSD !== undefined && { priceUSD: data.priceUSD }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.wsetLevel !== undefined && { wsetLevel: data.wsetLevel }),
    },
    include: {
      educator: true,
      tags: true,
    },
  })
}

export async function publishCourse(id: string) {
  return prisma.course.update({
    where: { id },
    data: {
      status: 'enrolling',
    },
  })
}

export async function unpublishCourse(id: string) {
  return prisma.course.update({
    where: { id },
    data: {
      status: 'draft',
    },
  })
}

export async function deleteCourse(id: string) {
  // Check if course has enrollments
  const enrollmentCount = await prisma.enrollment.count({
    where: { courseId: id },
  })

  if (enrollmentCount > 0) {
    throw new Error(
      `No se puede eliminar el curso porque tiene ${enrollmentCount} inscripción(es). Primero debe cancelar las inscripciones.`
    )
  }

  // Hard delete if no enrollments
  return prisma.course.delete({
    where: { id },
  })
}

/**
 * Checks if a slug is already in use by another course.
 * When editing, pass the courseId to allow the same slug for the same course.
 * @returns true if slug is in use by another course, false if available
 */
export async function checkSlug(slug: string, courseId?: string): Promise<boolean> {
  const existingCourse = await prisma.course.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!existingCourse) {
    return false // Slug is available
  }

  // If editing the same course, allow the same slug
  if (courseId && existingCourse.id === courseId) {
    return false // Slug belongs to this course, so it's available
  }

  return true // Slug is in use by another course
}