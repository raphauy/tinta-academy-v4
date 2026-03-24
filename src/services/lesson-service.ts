import { prisma } from '@/lib/prisma'
import { MaterialType } from '@prisma/client'
import { deleteAsset } from '@/services/mux-service'

// ============================================
// QUERIES
// ============================================

export async function getLessonsByModule(moduleId: string) {
  return prisma.lesson.findMany({
    where: { moduleId },
    include: { materials: { orderBy: { order: 'asc' } } },
    orderBy: { order: 'asc' },
  })
}

export async function getLessonById(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { include: { course: true } },
      materials: { orderBy: { order: 'asc' } },
    },
  })
}

/**
 * Get a lesson for the player by course slug and lesson slug.
 * Searches across all modules of the course.
 */
export async function getLessonForPlayer(courseSlug: string, lessonSlug: string) {
  return prisma.lesson.findFirst({
    where: {
      slug: lessonSlug,
      module: {
        course: { slug: courseSlug },
      },
    },
    include: {
      module: {
        include: {
          course: {
            include: {
              educator: true,
              modules: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: {
                    orderBy: { order: 'asc' },
                    select: {
                      id: true,
                      title: true,
                      slug: true,
                      videoDuration: true,
                      videoStatus: true,
                      isFree: true,
                      order: true,
                      moduleId: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      materials: { orderBy: { order: 'asc' } },
    },
  })
}

// ============================================
// MUTATIONS
// ============================================

export interface CreateLessonInput {
  moduleId: string
  title: string
  slug: string
  summary?: string
  isFree?: boolean
}

export async function createLesson(data: CreateLessonInput) {
  // Auto-calculate order
  const lastLesson = await prisma.lesson.findFirst({
    where: { moduleId: data.moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const order = (lastLesson?.order ?? -1) + 1

  // Auto-mark first lesson of first module as free for paid courses
  let isFree = data.isFree ?? false
  if (!isFree) {
    const module = await prisma.courseModule.findUnique({
      where: { id: data.moduleId },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' },
              take: 1,
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
      },
    })

    if (module) {
      const isFirstModule = module.course.modules[0]?.id === data.moduleId
      const hasNoLessons = module.course.modules[0]?.lessons.length === 0
      const isPaidCourse = module.course.priceUSD > 0

      if (isFirstModule && hasNoLessons && isPaidCourse) {
        isFree = true
      }
    }
  }

  return prisma.lesson.create({
    data: {
      moduleId: data.moduleId,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      isFree,
      order,
    },
  })
}

export interface UpdateLessonInput {
  title?: string
  slug?: string
  summary?: string
  isFree?: boolean
}

export async function updateLesson(id: string, data: UpdateLessonInput) {
  return prisma.lesson.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.isFree !== undefined && { isFree: data.isFree }),
    },
  })
}

export async function deleteLesson(id: string) {
  // Get lesson to check for Mux asset
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    select: { muxAssetId: true },
  })

  // Delete Mux asset if it exists
  if (lesson?.muxAssetId) {
    await deleteAsset(lesson.muxAssetId)
  }

  return prisma.lesson.delete({ where: { id } })
}

export async function reorderLessons(moduleId: string, lessonIds: string[]) {
  const updates = lessonIds.map((id, index) =>
    prisma.lesson.update({
      where: { id },
      data: { order: index },
    })
  )

  return prisma.$transaction(updates)
}

// ============================================
// LESSON MATERIALS
// ============================================

export async function createLessonMaterial(data: {
  lessonId: string
  name: string
  url: string
  type: MaterialType
}) {
  const lastMaterial = await prisma.lessonMaterial.findFirst({
    where: { lessonId: data.lessonId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const order = (lastMaterial?.order ?? -1) + 1

  return prisma.lessonMaterial.create({
    data: { ...data, order },
  })
}

export async function deleteLessonMaterial(id: string) {
  return prisma.lessonMaterial.delete({ where: { id } })
}
