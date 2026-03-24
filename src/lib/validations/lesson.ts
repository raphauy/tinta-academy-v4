import { z } from 'zod'

export const createLessonSchema = z.object({
  moduleId: z.string().min(1, 'El módulo es requerido'),
  title: z.string().min(1, 'El título es requerido').max(200),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .regex(
      /^[a-z0-9-]+$/,
      'El slug solo puede contener letras minúsculas, números y guiones'
    ),
  summary: z.string().optional(),
  isFree: z.boolean().default(false),
})

export const updateLessonSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  summary: z.string().optional(),
  isFree: z.boolean().optional(),
})

export type CreateLessonInput = z.infer<typeof createLessonSchema>
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>
