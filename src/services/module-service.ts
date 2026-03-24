import { prisma } from '@/lib/prisma'

// ============================================
// QUERIES
// ============================================

export async function getModulesByCourse(courseId: string) {
  return prisma.courseModule.findMany({
    where: { courseId },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          materials: { orderBy: { order: 'asc' } },
        },
      },
    },
    orderBy: { order: 'asc' },
  })
}

export async function getModuleById(id: string) {
  return prisma.courseModule.findUnique({
    where: { id },
    include: {
      course: true,
      lessons: {
        orderBy: { order: 'asc' },
      },
    },
  })
}

// ============================================
// MUTATIONS
// ============================================

export async function createModule(data: { courseId: string; title: string }) {
  const lastModule = await prisma.courseModule.findFirst({
    where: { courseId: data.courseId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const order = (lastModule?.order ?? -1) + 1

  return prisma.courseModule.create({
    data: {
      courseId: data.courseId,
      title: data.title,
      order,
    },
  })
}

export async function updateModule(id: string, data: { title: string }) {
  return prisma.courseModule.update({
    where: { id },
    data: { title: data.title },
  })
}

export async function deleteModule(id: string) {
  return prisma.courseModule.delete({
    where: { id },
  })
}

export async function reorderModules(courseId: string, moduleIds: string[]) {
  const updates = moduleIds.map((id, index) =>
    prisma.courseModule.update({
      where: { id },
      data: { order: index },
    })
  )

  return prisma.$transaction(updates)
}
