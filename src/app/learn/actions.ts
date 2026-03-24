'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { getSignedPlaybackToken } from '@/services/mux-service'
import { prisma } from '@/lib/prisma'
import {
  saveProgress,
  toggleLessonComplete,
} from '@/services/lesson-progress-service'
import {
  getCommentsByLesson,
  createComment,
  deleteComment,
} from '@/services/lesson-comment-service'
import { sendLessonCommentNotification } from '@/services/email-service'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * Get a signed playback token for a Mux video.
 */
export async function getPlaybackTokenAction(
  playbackId: string
): Promise<ActionResult<{ token: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const token = getSignedPlaybackToken(playbackId)
    return { success: true, data: { token } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Get comments for a lesson.
 */
export async function getCommentsAction(
  lessonId: string
): Promise<
  ActionResult<{
    comments: Array<{
      id: string
      body: string
      createdAt: Date
      user: { id: string; name: string | null; image: string | null }
      replies: Array<{
        id: string
        body: string
        createdAt: Date
        user: { id: string; name: string | null; image: string | null }
      }>
    }>
  }>
> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const comments = await getCommentsByLesson(lessonId)
    return { success: true, data: { comments } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Create a comment on a lesson.
 * Sends email notification to the educator (unless the commenter IS the educator).
 */
export async function createCommentAction(
  lessonId: string,
  body: string,
  parentId?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const comment = await createComment({
      lessonId,
      userId: session.user.id,
      body,
      parentId,
    })

    // Send email notification to educator (fire and forget)
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        title: true,
        slug: true,
        module: {
          select: {
            course: {
              select: {
                title: true,
                slug: true,
                educator: {
                  select: {
                    name: true,
                    notifyOnComments: true,
                    user: { select: { id: true, email: true } },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (lesson) {
      const educator = lesson.module.course.educator
      // Only notify if the commenter is NOT the educator and notifications are enabled
      if (educator.user.id !== session.user.id && educator.user.email && educator.notifyOnComments) {
        sendLessonCommentNotification({
          educatorEmail: educator.user.email,
          educatorName: educator.name,
          studentName: session.user.name || 'Estudiante',
          courseName: lesson.module.course.title,
          lessonName: lesson.title,
          commentBody: body.length > 300 ? body.slice(0, 300) + '...' : body,
          courseSlug: lesson.module.course.slug,
          lessonSlug: lesson.slug,
        }).catch((err) => console.error('Comment notification failed:', err))
      }
    }

    return { success: true, data: { id: comment.id } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Save video progress (debounced from client).
 */
export async function saveProgressAction(
  lessonId: string,
  progressSeconds: number,
  videoDuration: number | null
): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!student) {
      return { success: false, error: 'Estudiante no encontrado' }
    }

    const result = await saveProgress(
      student.id,
      lessonId,
      Math.round(progressSeconds),
      videoDuration
    )
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Toggle lesson completion manually.
 */
export async function toggleLessonCompleteAction(
  lessonId: string
): Promise<ActionResult<{ completed: boolean }>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autenticado' }
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!student) {
      return { success: false, error: 'Estudiante no encontrado' }
    }

    const result = await toggleLessonComplete(student.id, lessonId)
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}

/**
 * Delete a comment (only the author can delete).
 */
export async function deleteCommentAction(
  commentId: string
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'No autenticado' }
    }

    await deleteComment(commentId)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }
  }
}
