import { z } from 'zod'

/** Link de acceso de una clase virtual (Zoom, Meet u otra plataforma). */
export const accessUrlSchema = z
  .string()
  .trim()
  .url('Ingresá una URL válida (ej: https://zoom.us/j/...)')

/** Clase virtual tal como la envía el formulario: el link y la contraseña pueden cargarse más adelante. */
export const virtualClassSchema = z.object({
  date: z.coerce.date(),
  streamingUrl: accessUrlSchema.optional(),
  streamingPassword: z.string().trim().optional(),
})

/** Mensaje de error del link, o null si es válido o todavía no se cargó. */
export function getAccessUrlError(url: string | null | undefined): string | null {
  if (!url?.trim()) return null
  const result = accessUrlSchema.safeParse(url)
  return result.success ? null : result.error.issues[0].message
}

export interface SemipresencialScheduleInput {
  classDates: ReadonlyArray<Date | string>
  virtualClasses: ReadonlyArray<{ streamingUrl?: string | null }>
}

/**
 * Reglas del calendario de un curso semipresencial: al menos una fecha de clase y,
 * si una clase virtual ya tiene link, que sea una URL válida. Una clase virtual sin
 * link es válida: el link se puede cargar más adelante.
 */
export function validateSemipresencialSchedule(
  input: SemipresencialScheduleInput
): string | null {
  if (input.classDates.length === 0) {
    return 'Agregá al menos una fecha de clase'
  }

  for (const virtualClass of input.virtualClasses) {
    const urlError = getAccessUrlError(virtualClass.streamingUrl)
    if (urlError) {
      return `Hay una clase virtual con un link inválido. ${urlError}`
    }
  }

  return null
}
