import { z } from 'zod'

export const DIPLOMA_FONT_FAMILIES = [
  'Geist',
  'Playfair Display',
  'DM Serif Display',
] as const

export type DiplomaFontFamily = (typeof DIPLOMA_FONT_FAMILIES)[number]

export const DIPLOMA_FONT_WEIGHTS: Record<
  (typeof DIPLOMA_FONT_FAMILIES)[number],
  number[]
> = {
  Geist: [400, 500, 700],
  'Playfair Display': [400, 700],
  'DM Serif Display': [400],
}

const colorHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (formato esperado: #RRGGBB)')

const fontFamilySchema = z.enum(DIPLOMA_FONT_FAMILIES, {
  message: 'Tipografía no soportada',
})

const anchorSchema = z.enum(['left', 'center', 'right'])

export const diplomaTemplateSchema = z
  .object({
    // Imagen base
    baseImageUrl: z.string().url('URL de imagen inválida'),
    baseImageWidth: z.number().int().min(100).max(5000),
    baseImageHeight: z.number().int().min(100).max(5000),

    // Nombre (siempre activo)
    nameFontFamily: fontFamilySchema,
    nameFontWeight: z.number().int().positive(),
    nameFontSize: z.number().positive().max(25),
    nameColor: colorHexSchema,
    nameX: z.number().min(0).max(100),
    nameY: z.number().min(0).max(100),
    nameMaxWidth: z.number().positive().max(100),
    nameAnchor: anchorSchema,

    // Fecha (opcional)
    dateEnabled: z.boolean(),
    dateFontFamily: fontFamilySchema.nullable(),
    dateFontWeight: z.number().int().positive().nullable(),
    dateFontSize: z.number().positive().max(25).nullable(),
    dateColor: colorHexSchema.nullable(),
    dateX: z.number().min(0).max(100).nullable(),
    dateY: z.number().min(0).max(100).nullable(),
    dateMaxWidth: z.number().positive().max(100).nullable(),
    dateAnchor: anchorSchema.nullable(),
    dateFormat: z.string().min(1).nullable(),
    dateMode: z.enum(['last_class', 'custom']),
    dateCustomValue: z.date().nullable(),
  })
  .superRefine((data, ctx) => {
    // Validar peso de fuente del nombre contra el set permitido para la familia
    const allowedNameWeights = DIPLOMA_FONT_WEIGHTS[data.nameFontFamily]
    if (!allowedNameWeights.includes(data.nameFontWeight)) {
      ctx.addIssue({
        code: 'custom',
        path: ['nameFontWeight'],
        message: `Peso no disponible para ${data.nameFontFamily} (permitidos: ${allowedNameWeights.join(', ')})`,
      })
    }

    if (data.dateEnabled) {
      const required: Array<keyof typeof data> = [
        'dateFontFamily',
        'dateFontWeight',
        'dateFontSize',
        'dateColor',
        'dateX',
        'dateY',
        'dateMaxWidth',
        'dateAnchor',
        'dateFormat',
      ]
      for (const key of required) {
        if (data[key] === null || data[key] === undefined) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: 'Campo requerido cuando la fecha está habilitada',
          })
        }
      }

      // Validar peso de fuente de la fecha
      if (data.dateFontFamily && data.dateFontWeight) {
        const allowedDateWeights = DIPLOMA_FONT_WEIGHTS[data.dateFontFamily]
        if (!allowedDateWeights.includes(data.dateFontWeight)) {
          ctx.addIssue({
            code: 'custom',
            path: ['dateFontWeight'],
            message: `Peso no disponible para ${data.dateFontFamily} (permitidos: ${allowedDateWeights.join(', ')})`,
          })
        }
      }

      if (data.dateMode === 'custom' && data.dateCustomValue === null) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateCustomValue'],
          message: 'Elegí una fecha personalizada',
        })
      }
    }
  })

export type DiplomaTemplateInput = z.infer<typeof diplomaTemplateSchema>
