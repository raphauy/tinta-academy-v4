'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import {
  createCourse,
  updateCourse,
  publishCourse,
  unpublishCourse,
  deleteCourse,
  getCourseById,
} from '@/services/course-service'
import { CourseType } from '@prisma/client'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCourseSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z
    .string()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .regex(
      /^[a-z0-9-]+$/,
      'El slug solo puede contener letras minúsculas, números y guiones'
    ),
  type: z.nativeEnum(CourseType),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  duration: z.string().optional(),
  maxCapacity: z.coerce.number().int().positive().optional(),
  priceUSD: z.coerce.number().positive('El precio debe ser mayor a 0'),
  location: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  wsetLevel: z.coerce.number().int().min(1).max(4).optional(),
})

const updateCourseSchema = createCourseSchema.partial()

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

// ============================================
// HELPER FUNCTIONS
// ============================================

type EducatorWithUser = NonNullable<
  Awaited<ReturnType<typeof getEducatorByUserId>>
>
type CourseWithRelations = NonNullable<Awaited<ReturnType<typeof getCourseById>>>

async function getAuthenticatedEducator(): Promise<
  { error: string } | { educator: EducatorWithUser }
> {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }

  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    return { error: 'No autorizado - solo educadores' }
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    return { error: 'Educador no encontrado' }
  }

  return { educator }
}

async function verifyCourseOwnership(
  courseId: string,
  educatorId: string
): Promise<{ error: string } | { course: CourseWithRelations }> {
  const course = await getCourseById(courseId)

  if (!course) {
    return { error: 'Curso no encontrado' }
  }

  if (course.educatorId !== educatorId) {
    return { error: 'No tienes permiso para modificar este curso' }
  }

  return { course }
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function createCourseAction(
  formData: FormData
): Promise<ActionResult<{ id: string; slug: string }>> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const rawData = {
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    type: formData.get('type') as string,
    description: (formData.get('description') as string) || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    duration: (formData.get('duration') as string) || undefined,
    maxCapacity: formData.get('maxCapacity') || undefined,
    priceUSD: formData.get('priceUSD'),
    location: (formData.get('location') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    imageUrl: (formData.get('imageUrl') as string) || undefined,
    wsetLevel: formData.get('wsetLevel') || undefined,
  }

  const validated = createCourseSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    const course = await createCourse({
      ...validated.data,
      imageUrl: validated.data.imageUrl || undefined,
      educatorId: educator.id,
    })

    revalidatePath('/educator/courses')
    revalidatePath('/educator')

    return {
      success: true,
      data: { id: course.id, slug: course.slug },
    }
  } catch (error) {
    console.error('Error creating course:', error)
    return {
      success: false,
      error: 'Error al crear el curso',
    }
  }
}

export async function updateCourseAction(
  courseId: string,
  formData: FormData
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const ownershipResult = await verifyCourseOwnership(courseId, educator.id)

  if ('error' in ownershipResult) {
    return { success: false, error: ownershipResult.error }
  }

  const rawData = {
    title: formData.get('title') || undefined,
    slug: formData.get('slug') || undefined,
    type: formData.get('type') || undefined,
    description: formData.get('description') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    duration: formData.get('duration') || undefined,
    maxCapacity: formData.get('maxCapacity') || undefined,
    priceUSD: formData.get('priceUSD') || undefined,
    location: formData.get('location') || undefined,
    address: formData.get('address') || undefined,
    imageUrl: formData.get('imageUrl') || undefined,
    wsetLevel: formData.get('wsetLevel') || undefined,
  }

  // Filter out undefined values
  const filteredData = Object.fromEntries(
    Object.entries(rawData).filter(([, v]) => v !== undefined)
  )

  const validated = updateCourseSchema.safeParse(filteredData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    await updateCourse(courseId, {
      ...validated.data,
      imageUrl: validated.data.imageUrl || undefined,
    })

    revalidatePath('/educator/courses')
    revalidatePath(`/educator/courses/${courseId}`)
    revalidatePath('/educator')
    revalidatePath('/') // Landing page might show this course

    return { success: true }
  } catch (error) {
    console.error('Error updating course:', error)
    return {
      success: false,
      error: 'Error al actualizar el curso',
    }
  }
}

export async function publishCourseAction(
  courseId: string
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const ownershipResult = await verifyCourseOwnership(courseId, educator.id)

  if ('error' in ownershipResult) {
    return { success: false, error: ownershipResult.error }
  }

  const { course } = ownershipResult

  if (course.status !== 'draft') {
    return {
      success: false,
      error: 'Solo se pueden publicar cursos en estado borrador',
    }
  }

  try {
    await publishCourse(courseId)

    revalidatePath('/educator/courses')
    revalidatePath('/educator')
    revalidatePath('/') // Landing page

    return { success: true }
  } catch (error) {
    console.error('Error publishing course:', error)
    return {
      success: false,
      error: 'Error al publicar el curso',
    }
  }
}

export async function unpublishCourseAction(
  courseId: string
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const ownershipResult = await verifyCourseOwnership(courseId, educator.id)

  if ('error' in ownershipResult) {
    return { success: false, error: ownershipResult.error }
  }

  const { course } = ownershipResult

  if (course.status === 'draft') {
    return {
      success: false,
      error: 'El curso ya está en estado borrador',
    }
  }

  try {
    await unpublishCourse(courseId)

    revalidatePath('/educator/courses')
    revalidatePath('/educator')
    revalidatePath('/') // Landing page

    return { success: true }
  } catch (error) {
    console.error('Error unpublishing course:', error)
    return {
      success: false,
      error: 'Error al despublicar el curso',
    }
  }
}

export async function deleteCourseAction(
  courseId: string
): Promise<ActionResult> {
  const authResult = await getAuthenticatedEducator()

  if ('error' in authResult) {
    return { success: false, error: authResult.error }
  }

  const { educator } = authResult

  const ownershipResult = await verifyCourseOwnership(courseId, educator.id)

  if ('error' in ownershipResult) {
    return { success: false, error: ownershipResult.error }
  }

  try {
    await deleteCourse(courseId)

    revalidatePath('/educator/courses')
    revalidatePath('/educator')
    revalidatePath('/') // Landing page

    return { success: true }
  } catch (error) {
    console.error('Error deleting course:', error)
    const message =
      error instanceof Error ? error.message : 'Error al eliminar el curso'
    return {
      success: false,
      error: message,
    }
  }
}
