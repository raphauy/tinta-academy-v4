import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { isUserEnrolledInCourse } from './enrollment-service'

/**
 * Acceso al contenido grabado desde el reproductor y sus acciones. Un usuario con
 * sesión ve una lección si es vista previa de educador o admin, si el curso es
 * gratuito, si la lección es gratis o si está inscripto en el curso.
 */

/** Usuario con sesión que pide ver contenido; un visitante no tiene rol. */
export interface ContentViewer {
  id: string
  role: string | null | undefined
}

type CourseForAccess = {
  id: string
  priceUSD: number
  priceUYU: number | null
}

const lessonAccessSelect = {
  isFree: true,
  module: {
    select: { course: { select: { id: true, priceUSD: true, priceUYU: true } } },
  },
} satisfies Prisma.LessonSelect

type LessonForAccess = Prisma.LessonGetPayload<{ select: typeof lessonAccessSelect }>

/** Educadores y admins ven cualquier lección como vista previa. */
export function isPreviewRole(role: string | null | undefined): boolean {
  return role === 'educator' || role === 'superadmin'
}

/** Curso gratuito: sin precio en dólares ni en pesos. */
export function isFreeCourse(course: Pick<CourseForAccess, 'priceUSD' | 'priceUYU'>): boolean {
  return course.priceUSD === 0 && !course.priceUYU
}

/** Acceso a todas las lecciones: vista previa, curso gratuito o inscripción no cancelada. */
export async function hasCourseAccess(
  viewer: ContentViewer,
  course: CourseForAccess
): Promise<boolean> {
  if (isPreviewRole(viewer.role) || isFreeCourse(course)) return true
  return isUserEnrolledInCourse(viewer.id, course.id)
}

async function canViewLessonFor(viewer: ContentViewer, lesson: LessonForAccess): Promise<boolean> {
  if (lesson.isFree) return true
  return hasCourseAccess(viewer, lesson.module.course)
}

/** Si el usuario puede ver la lección, incluida su discusión. */
export async function canViewLesson(viewer: ContentViewer, lessonId: string): Promise<boolean> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: lessonAccessSelect,
  })
  return lesson ? canViewLessonFor(viewer, lesson) : false
}

/** Si el usuario puede reproducir un video de Mux: alguna lección con ese video le da acceso. */
export async function canPlayVideo(viewer: ContentViewer, playbackId: string): Promise<boolean> {
  if (isPreviewRole(viewer.role)) return true

  const lessons = await prisma.lesson.findMany({
    where: { muxPlaybackId: playbackId },
    select: lessonAccessSelect,
  })
  for (const lesson of lessons) {
    if (await canViewLessonFor(viewer, lesson)) return true
  }
  return false
}
