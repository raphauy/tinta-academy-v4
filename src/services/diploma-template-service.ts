import { del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import type { Course, DiplomaTemplate } from '@prisma/client'
import type { DiplomaTemplateInput } from '@/lib/validations/diploma'

export async function getDiplomaTemplateByCourseId(
  courseId: string
): Promise<DiplomaTemplate | null> {
  return prisma.diplomaTemplate.findUnique({ where: { courseId } })
}

/**
 * Crea o actualiza la plantilla del curso. Al actualizar, invalida cualquier
 * lote pendiente: borra los `DiplomaIssue` con status `generated` o `failed`
 * (y sus assets en Blob, best-effort). Los issues en `sent`/`sending` no se
 * tocan — regenerarlos es un flujo aparte (fase 4).
 *
 * Las emisiones excluidas tampoco se borran: perder esa fila haría que el
 * alumno excluido reaparezca como "nuevo" en la próxima emisión y termine
 * recibiendo el diploma. Sus assets quedan viejos a propósito; `restoreIssue`
 * los rehace al reincorporarlo.
 */
export async function upsertDiplomaTemplate(
  courseId: string,
  data: DiplomaTemplateInput
): Promise<DiplomaTemplate> {
  const invalidated = await prisma.diplomaIssue.findMany({
    where: {
      courseId,
      excludedAt: null,
      status: { in: ['generated', 'failed'] },
    },
    select: { id: true, pngUrl: true, pdfUrl: true },
  })

  const template = await prisma.$transaction(async (tx) => {
    if (invalidated.length > 0) {
      await tx.diplomaIssue.deleteMany({
        where: { id: { in: invalidated.map((i) => i.id) } },
      })
    }
    return tx.diplomaTemplate.upsert({
      where: { courseId },
      create: { courseId, ...data },
      update: data,
    })
  })

  if (invalidated.length > 0) {
    const urls = invalidated
      .flatMap((i) => [i.pngUrl, i.pdfUrl])
      .filter((url): url is string => !!url)
    if (urls.length > 0) {
      await Promise.allSettled(urls.map((url) => del(url))).catch(() => {})
    }
  }

  return template
}

/**
 * Elimina la plantilla de diploma del curso.
 * Falla si existen emisiones asociadas (DB también lo previene vía onDelete: Restrict).
 */
export async function deleteDiplomaTemplate(courseId: string): Promise<void> {
  const count = await prisma.diplomaIssue.count({ where: { courseId } })
  if (count > 0) {
    throw new Error(
      'No se puede eliminar la plantilla: existen diplomas emitidos para este curso'
    )
  }
  await prisma.diplomaTemplate.delete({ where: { courseId } })
}

/**
 * Resuelve la fecha que figura en el diploma según la configuración del template.
 *
 * Si la plantilla NO tiene fecha habilitada, igual snapshoteamos un valor en
 * `DiplomaIssue.issuedDate` (es non-nullable) usando el fallback last_class →
 * endDate → startDate → hoy. El renderer ignora la fecha cuando dateEnabled=false.
 */
export function resolveDiplomaDate(
  course: Pick<Course, 'classDates' | 'endDate' | 'startDate'>,
  template: Pick<DiplomaTemplate, 'dateEnabled' | 'dateMode' | 'dateCustomValue'>
): Date {
  if (template.dateEnabled && template.dateMode === 'custom') {
    if (!template.dateCustomValue) {
      throw new Error('dateMode=custom requiere dateCustomValue')
    }
    return template.dateCustomValue
  }
  if (course.classDates.length > 0) {
    return course.classDates.reduce((max, d) =>
      d.getTime() > max.getTime() ? d : max
    )
  }
  if (course.endDate) return course.endDate
  if (course.startDate) return course.startDate
  if (template.dateEnabled) {
    throw new Error(
      'No se puede resolver la fecha del diploma: el curso no tiene classDates, endDate ni startDate'
    )
  }
  return new Date()
}
