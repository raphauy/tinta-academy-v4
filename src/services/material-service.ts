import { prisma } from '@/lib/prisma'
import { MaterialType } from '@prisma/client'

export interface CreateMaterialInput {
  courseId: string
  name: string
  type: MaterialType
  url: string
  description?: string
  order?: number
}

export interface UpdateMaterialInput {
  name?: string
  type?: MaterialType
  url?: string
  description?: string
  order?: number
}

export async function getMaterialsByCourse(courseId: string) {
  return prisma.courseMaterial.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
  })
}

export async function getMaterialById(id: string) {
  return prisma.courseMaterial.findUnique({
    where: { id },
    include: { course: true },
  })
}

export async function createMaterial(data: CreateMaterialInput) {
  // Get the highest order for this course
  const lastMaterial = await prisma.courseMaterial.findFirst({
    where: { courseId: data.courseId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const order = data.order ?? (lastMaterial?.order ?? -1) + 1

  return prisma.courseMaterial.create({
    data: {
      courseId: data.courseId,
      name: data.name,
      type: data.type,
      url: data.url,
      description: data.description,
      order,
    },
  })
}

export async function updateMaterial(id: string, data: UpdateMaterialInput) {
  return prisma.courseMaterial.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.order !== undefined && { order: data.order }),
    },
  })
}

export async function deleteMaterial(id: string) {
  return prisma.courseMaterial.delete({
    where: { id },
  })
}

export async function reorderMaterials(
  courseId: string,
  materialIds: string[]
) {
  // Update order for each material based on position in array
  const updates = materialIds.map((id, index) =>
    prisma.courseMaterial.update({
      where: { id },
      data: { order: index },
    })
  )

  return prisma.$transaction(updates)
}
