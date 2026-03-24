import { prisma } from '@/lib/prisma'

// ============================================
// QUERIES
// ============================================

export async function getCommentsByLesson(lessonId: string) {
  return prisma.lessonComment.findMany({
    where: { lessonId, parentId: null },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCommentCount(lessonId: string) {
  return prisma.lessonComment.count({ where: { lessonId } })
}

// ============================================
// MUTATIONS
// ============================================

export async function createComment(data: {
  lessonId: string
  userId: string
  body: string
  parentId?: string
}) {
  return prisma.lessonComment.create({
    data: {
      lessonId: data.lessonId,
      userId: data.userId,
      body: data.body,
      parentId: data.parentId || null,
    },
    include: {
      user: {
        select: { id: true, name: true, image: true },
      },
    },
  })
}

export async function deleteComment(id: string) {
  return prisma.lessonComment.delete({ where: { id } })
}
