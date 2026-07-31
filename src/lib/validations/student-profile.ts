import { z } from 'zod'

/**
 * Datos del estudiante que se piden al inscribirse (antes de pagar) y que
 * despues puede editar desde su perfil. Facturacion es opcional.
 */
export const studentProfileFormSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  identityDocument: z.string().min(1, 'La cédula es requerida'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  zip: z.string().min(1, 'El código postal es requerido'),
  country: z.string().min(1, 'El país es requerido'),
  billingName: z.string().optional(),
  billingTaxId: z.string().optional(),
  billingAddress: z.string().optional(),
})

/** Version para formularios: dateOfBirth como string (input type="date"). */
export type StudentProfileFormData = z.infer<typeof studentProfileFormSchema>

/** Version para el servidor: dateOfBirth ya convertida a Date. */
export const studentProfileSchema = studentProfileFormSchema.extend({
  dateOfBirth: z.coerce.date({ error: 'La fecha de nacimiento es requerida' }),
})

export type StudentProfileData = z.infer<typeof studentProfileSchema>

/**
 * Campos obligatorios del perfil, con su etiqueta para mostrarle al alumno
 * que le falta. El orden es el mismo en que aparecen en el formulario.
 */
export const REQUIRED_PROFILE_FIELDS = {
  firstName: 'nombre',
  lastName: 'apellido',
  identityDocument: 'cédula',
  phone: 'teléfono',
  dateOfBirth: 'fecha de nacimiento',
  address: 'dirección',
  city: 'ciudad',
  zip: 'código postal',
  country: 'país',
} as const

type RequiredProfileField = keyof typeof REQUIRED_PROFILE_FIELDS

/** Cualquier objeto con los campos del perfil (ej: un Student de Prisma). */
type ProfileFieldValues = Record<RequiredProfileField, string | Date | null | undefined>

function hasValue(value: string | Date | null | undefined): boolean {
  if (value == null) return false
  return typeof value === 'string' ? value.trim().length > 0 : true
}

/** Etiquetas de los campos obligatorios que el estudiante todavia no cargo. */
export function getMissingProfileFields(
  student: ProfileFieldValues | null | undefined
): string[] {
  if (!student) return Object.values(REQUIRED_PROFILE_FIELDS)

  return (Object.keys(REQUIRED_PROFILE_FIELDS) as RequiredProfileField[])
    .filter((field) => !hasValue(student[field]))
    .map((field) => REQUIRED_PROFILE_FIELDS[field])
}

export function isStudentProfileComplete(
  student: ProfileFieldValues | null | undefined
): boolean {
  return getMissingProfileFields(student).length === 0
}
