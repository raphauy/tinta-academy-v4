import type { CourseModality } from '@prisma/client'

/**
 * Punto único de la modalidad de un curso: etiqueta legible y qué piezas tiene
 * cada modalidad. Sumar una modalidad nueva empieza acá (los íconos viven en
 * components/course/modality-icons.ts).
 */

/** Modalidades en el orden en que se ofrecen en menús y filtros. */
export const COURSE_MODALITIES: readonly CourseModality[] = [
  'presencial',
  'semipresencial',
  'webinar',
  'online',
]

export const MODALITY_LABELS: Record<CourseModality, string> = {
  presencial: 'Presencial',
  semipresencial: 'Semipresencial',
  webinar: 'Webinar',
  online: 'Online',
}

/** Modalidades que cuentan como presenciales en los conteos: tienen clases presenciales con fecha. */
export const MODALITIES_WITH_PRESENCIAL_CLASSES: readonly CourseModality[] = [
  'presencial',
  'semipresencial',
]

export function isCourseModality(value: string): value is CourseModality {
  return (COURSE_MODALITIES as readonly string[]).includes(value)
}

/** Etiqueta legible de la modalidad; si el valor es desconocido lo devuelve tal cual. */
export function getModalityLabel(modality: string): string {
  return isCourseModality(modality) ? MODALITY_LABELS[modality] : modality
}

/** Cómo se nombra un curso de esa modalidad en títulos: "Curso Presencial", "Webinar". */
export function getModalityCourseTitle(modality: string): string {
  if (modality === 'webinar') return MODALITY_LABELS.webinar
  return isCourseModality(modality) ? `Curso ${MODALITY_LABELS[modality]}` : 'Curso'
}

/** Tiene clases con fecha: calendario, cupo y ciclo de estados de los cursos con fecha. */
export function hasClassDates(modality: string): boolean {
  return (
    modality === 'presencial' ||
    modality === 'semipresencial' ||
    modality === 'webinar'
  )
}

/** Tiene contenido grabado: módulos y lecciones que se ven a ritmo propio. */
export function hasRecordedContent(modality: string): boolean {
  return modality === 'online' || modality === 'semipresencial'
}

/** Dos fechas de clase son la misma clase si coinciden exactamente: se guardan tal cual en classDates. */
export function isSameClassDate(a: Date | string, b: Date | string): boolean {
  return new Date(a).getTime() === new Date(b).getTime()
}

/** La clase de esa fecha dentro de una lista de clases, por ejemplo las clases virtuales del curso. */
export function findClassOnDate<T extends { date: Date | string }>(
  date: Date | string,
  classes: ReadonlyArray<T>
): T | undefined {
  return classes.find((c) => isSameClassDate(c.date, date))
}

/** Deja solo las clases cuya fecha está en classDates, una por fecha. */
export function keepClassesOnDates<T extends { date: Date }>(
  classes: ReadonlyArray<T>,
  classDates: ReadonlyArray<Date>
): T[] {
  const result: T[] = []
  for (const c of classes) {
    const isClassDate = classDates.some((d) => isSameClassDate(d, c.date))
    if (isClassDate && !findClassOnDate(c.date, result)) {
      result.push(c)
    }
  }
  return result
}
