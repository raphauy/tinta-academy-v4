import { prisma } from '@/lib/prisma'
import { Prisma, CourseModality, CourseType } from '@prisma/client'

interface CourseFilters {
  modality?: string
  type?: string  
  tagIds?: string[]
}

export async function getCourses(filters: CourseFilters = {}) {
  const where: Prisma.CourseWhereInput = {}
  
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

export async function getCourseBySlug(slug: string) {
  return prisma.course.findUnique({
    where: { slug },
    include: {
      educator: true,
      tags: true,
    },
  })
}