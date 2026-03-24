import { z } from 'zod'

export const createModuleSchema = z.object({
  courseId: z.string().min(1, 'El curso es requerido'),
  title: z.string().min(1, 'El título es requerido').max(200),
})

export const updateModuleSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
})

export type CreateModuleInput = z.infer<typeof createModuleSchema>
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>
