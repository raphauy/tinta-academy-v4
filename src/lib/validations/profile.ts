import { z } from 'zod'

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  image: z
    .union([
      z.string().url('URL de imagen invalida'),
      z.literal(''),
      z.null(),
    ])
    .transform((val) => (val === '' ? null : val)),
})

export type UpdateProfileData = z.infer<typeof updateProfileSchema>
