'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from '@/services/module-service'
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  createLessonMaterial,
  deleteLessonMaterial,
  getLessonById,
} from '@/services/lesson-service'
import { createDirectUpload, getSignedPlaybackToken } from '@/services/mux-service'
import { generateSlug } from '@/lib/utils'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================
// HELPERS
// ============================================

class ActionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

async function getAuthenticatedEducator() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new ActionError('No autenticado')
  }

  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    throw new ActionError('No autorizado')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    throw new ActionError('Educador no encontrado')
  }

  return educator
}

async function verifyCourseOwnership(courseId: string, educatorId: string) {
  const course = await getCourseById(courseId)

  if (!course) {
    throw new ActionError('Curso no encontrado')
  }

  if (course.educatorId !== educatorId) {
    throw new ActionError('No tienes permiso para modificar este curso')
  }

  return course
}

function handleError<T = void>(error: unknown): ActionResult<T> {
  if (error instanceof ActionError) {
    return { success: false, error: error.message }
  }
  return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
}

// ============================================
// MODULE ACTIONS
// ============================================

export async function createModuleAction(
  courseId: string,
  title: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    const mod = await createModule({ courseId, title })
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true, data: { id: mod.id } }
  } catch (error) {
    return handleError(error)
  }
}

export async function updateModuleAction(
  courseId: string,
  moduleId: string,
  title: string
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await updateModule(moduleId, { title })
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteModuleAction(
  courseId: string,
  moduleId: string
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await deleteModule(moduleId)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

export async function reorderModulesAction(
  courseId: string,
  moduleIds: string[]
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await reorderModules(courseId, moduleIds)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

// ============================================
// LESSON ACTIONS
// ============================================

export async function createLessonAction(
  courseId: string,
  moduleId: string,
  title: string
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    const slug = generateSlug(title)
    const lesson = await createLesson({ moduleId, title, slug })
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true, data: { id: lesson.id, slug: lesson.slug } }
  } catch (error) {
    return handleError(error)
  }
}

export async function updateLessonAction(
  courseId: string,
  lessonId: string,
  data: { title?: string; slug?: string; summary?: string; isFree?: boolean }
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await updateLesson(lessonId, data)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteLessonAction(
  courseId: string,
  lessonId: string
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await deleteLesson(lessonId)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

export async function reorderLessonsAction(
  courseId: string,
  moduleId: string,
  lessonIds: string[]
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await reorderLessons(moduleId, lessonIds)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

// ============================================
// VIDEO UPLOAD ACTION
// ============================================

export async function getVideoUploadUrlAction(
  courseId: string,
  lessonId: string
): Promise<ActionResult<{ uploadUrl: string; uploadId: string }>> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)

    const lesson = await getLessonById(lessonId)
    if (!lesson || lesson.module.course.id !== courseId) {
      throw new ActionError('Lección no encontrada')
    }

    const result = await createDirectUpload(lessonId)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true, data: { uploadUrl: result.uploadUrl!, uploadId: result.uploadId } }
  } catch (error) {
    return handleError(error)
  }
}

// ============================================
// LESSON MATERIAL ACTIONS
// ============================================

export async function createLessonMaterialAction(
  courseId: string,
  lessonId: string,
  data: { name: string; url: string; type: string }
): Promise<ActionResult<{ id: string }>> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    const material = await createLessonMaterial({
      lessonId,
      name: data.name,
      url: data.url,
      type: data.type as 'link' | 'image' | 'document' | 'video' | 'other',
    })
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true, data: { id: material.id } }
  } catch (error) {
    return handleError(error)
  }
}

export async function deleteLessonMaterialAction(
  courseId: string,
  materialId: string
): Promise<ActionResult> {
  try {
    const educator = await getAuthenticatedEducator()
    await verifyCourseOwnership(courseId, educator.id)
    await deleteLessonMaterial(materialId)
    revalidatePath(`/educator/courses/${courseId}/modules`)
    return { success: true }
  } catch (error) {
    return handleError(error)
  }
}

// ============================================
// PLAYBACK TOKEN ACTION
// ============================================

export async function getPlaybackTokenAction(
  playbackId: string
): Promise<ActionResult<{ token: string }>> {
  try {
    await getAuthenticatedEducator()
    const token = getSignedPlaybackToken(playbackId)
    return { success: true, data: { token } }
  } catch (error) {
    return handleError(error)
  }
}
