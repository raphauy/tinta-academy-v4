'use server'

import { revalidatePath } from 'next/cache'
import { del, put } from '@vercel/blob'
import { imageSize } from 'image-size'
import { z } from 'zod'
import type { DiplomaStatus, DiplomaTemplate } from '@prisma/client'
import { auth } from '@/lib/auth'
import { getCourseById } from '@/services/course-service'
import { getEducatorByUserId } from '@/services/educator-service'
import {
  deleteDiplomaTemplate,
  getDiplomaTemplateByCourseId,
  resolveDiplomaDate,
  upsertDiplomaTemplate,
} from '@/services/diploma-template-service'
import {
  discardGeneratedBatch,
  excludeIssue,
  generateBatchForCourse,
  getCourseProgress,
  regenerateBatchForCourse,
  resendDiploma,
  restoreIssue,
  retryFailedForCourse,
  sendBatchForCourse,
  EXCLUDABLE_STATUSES,
  type BatchResult,
  type CourseDiplomaProgress,
} from '@/services/diploma-service'
import { prisma } from '@/lib/prisma'
import { renderDiploma } from '@/services/diploma-render-service'
import { sendDiplomaEmail } from '@/services/email-service'
import {
  diplomaTemplateSchema,
  type DiplomaTemplateInput,
} from '@/lib/validations/diploma'

// ============================================
// TYPES
// ============================================

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

type CourseWithEducator = NonNullable<Awaited<ReturnType<typeof getCourseById>>>

// ============================================
// HELPERS — auth + ownership
// ============================================

type AuthCtx = {
  userId: string
  role: 'educator' | 'superadmin'
  educatorId: string | null // null si es superadmin sin perfil educator
}

async function authorizeAccess(): Promise<{ error: string } | { ctx: AuthCtx }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'No autenticado' }
  }
  const role = session.user.role
  if (role !== 'educator' && role !== 'superadmin') {
    return { error: 'No autorizado' }
  }
  let educatorId: string | null = null
  if (role === 'educator') {
    const educator = await getEducatorByUserId(session.user.id)
    if (!educator) return { error: 'Educador no encontrado' }
    educatorId = educator.id
  }
  return { ctx: { userId: session.user.id, role, educatorId } }
}

async function verifyCourseAccess(
  courseId: string,
  ctx: AuthCtx
): Promise<{ error: string } | { course: CourseWithEducator }> {
  const course = await getCourseById(courseId)
  if (!course) return { error: 'Curso no encontrado' }
  if (course.type === 'wset') {
    return { error: 'Los cursos WSET no soportan diplomas en esta plataforma' }
  }
  if (ctx.role === 'superadmin') return { course }
  if (course.educatorId !== ctx.educatorId) {
    return { error: 'No tenés permiso para gestionar este curso' }
  }
  return { course }
}

function revalidateDiplomaPaths(courseId: string) {
  revalidatePath(`/educator/courses/${courseId}/diploma`)
  revalidatePath(`/educator/courses/${courseId}/edit`)
}

// ============================================
// ACTIONS
// ============================================

const MAX_BASE_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIMES = new Set(['image/png', 'image/jpeg'])

export async function uploadDiplomaBaseImageAction(
  courseId: string,
  formData: FormData
): Promise<ActionResult<{ url: string; width: number; height: number }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { success: false, error: 'No se recibió ningún archivo' }
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return { success: false, error: 'La imagen debe ser PNG o JPEG' }
  }
  if (file.size > MAX_BASE_IMAGE_BYTES) {
    return { success: false, error: 'La imagen no debe superar los 5 MB' }
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const dims = imageSize(buffer)
    if (!dims.width || !dims.height) {
      return {
        success: false,
        error: 'No se pudieron leer las dimensiones de la imagen',
      }
    }
    if (
      dims.width < 100 ||
      dims.height < 100 ||
      dims.width > 5000 ||
      dims.height > 5000
    ) {
      return {
        success: false,
        error:
          'La imagen debe medir entre 100 y 5000 px en cada dimensión',
      }
    }

    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const blob = await put(
      `diploma-templates/${courseId}/base-${Date.now()}.${ext}`,
      buffer,
      {
        access: 'public',
        contentType: file.type,
        addRandomSuffix: true,
      }
    )

    return {
      success: true,
      data: { url: blob.url, width: dims.width, height: dims.height },
    }
  } catch (error) {
    console.error('[diploma] uploadDiplomaBaseImageAction error:', error)
    return { success: false, error: 'Error al subir la imagen' }
  }
}

export async function upsertDiplomaTemplateAction(
  courseId: string,
  input: DiplomaTemplateInput
): Promise<ActionResult<DiplomaTemplate>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  const parsed = diplomaTemplateSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? 'Datos inválidos' }
  }

  try {
    const existing = await getDiplomaTemplateByCourseId(courseId)
    const oldUrl = existing?.baseImageUrl
    const newUrl = parsed.data.baseImageUrl

    const template = await upsertDiplomaTemplate(courseId, parsed.data)

    if (oldUrl && oldUrl !== newUrl) {
      try {
        await del(oldUrl)
      } catch (delErr) {
        console.warn('[diploma] no se pudo borrar imagen anterior:', delErr)
      }
    }

    revalidateDiplomaPaths(courseId)
    return { success: true, data: template }
  } catch (error) {
    console.error('[diploma] upsertDiplomaTemplateAction error:', error)
    return { success: false, error: 'Error al guardar la plantilla' }
  }
}

// ============================================
// EMISIÓN — generación, envío, progreso, descarte
// ============================================

async function requireTemplate(
  courseId: string
): Promise<{ error: string } | { ok: true }> {
  const template = await getDiplomaTemplateByCourseId(courseId)
  if (!template) {
    return { error: 'El curso no tiene plantilla de diploma configurada' }
  }
  return { ok: true }
}

export async function generateDiplomasAction(
  courseId: string
): Promise<ActionResult<BatchResult>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }
  const tmpl = await requireTemplate(courseId)
  if ('error' in tmpl) return { success: false, error: tmpl.error }

  try {
    const result = await generateBatchForCourse(courseId)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[diploma] generateDiplomasAction error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al generar diplomas'
    return { success: false, error: message }
  }
}

export async function sendDiplomasAction(
  courseId: string
): Promise<ActionResult<BatchResult>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }
  const tmpl = await requireTemplate(courseId)
  if ('error' in tmpl) return { success: false, error: tmpl.error }

  try {
    const result = await sendBatchForCourse(courseId)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[diploma] sendDiplomasAction error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al enviar diplomas'
    return { success: false, error: message }
  }
}

export async function getDiplomaProgressAction(
  courseId: string
): Promise<ActionResult<CourseDiplomaProgress>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  try {
    const progress = await getCourseProgress(courseId)
    return { success: true, data: progress }
  } catch (error) {
    console.error('[diploma] getDiplomaProgressAction error:', error)
    return { success: false, error: 'Error al leer el progreso' }
  }
}

export async function discardGeneratedBatchAction(
  courseId: string
): Promise<ActionResult<{ discarded: number }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  try {
    const discarded = await discardGeneratedBatch(courseId)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: { discarded } }
  } catch (error) {
    console.error('[diploma] discardGeneratedBatchAction error:', error)
    return { success: false, error: 'Error al descartar el lote' }
  }
}

export async function deleteDiplomaTemplateAction(
  courseId: string
): Promise<ActionResult> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  try {
    const existing = await getDiplomaTemplateByCourseId(courseId)
    if (!existing) {
      revalidateDiplomaPaths(courseId)
      return { success: true }
    }
    await deleteDiplomaTemplate(courseId) // bloquea si hay issues
    try {
      await del(existing.baseImageUrl)
    } catch (delErr) {
      console.warn('[diploma] no se pudo borrar imagen base:', delErr)
    }
    revalidateDiplomaPaths(courseId)
    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Error al eliminar la plantilla'
    console.error('[diploma] deleteDiplomaTemplateAction error:', error)
    return { success: false, error: message }
  }
}

// ============================================
// FASE 4 — reenvío, regeneración, reintento
// ============================================

export async function resendDiplomaAction(
  courseId: string,
  issueId: string
): Promise<ActionResult<{ ok: true }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }
  const tmpl = await requireTemplate(courseId)
  if ('error' in tmpl) return { success: false, error: tmpl.error }

  try {
    const issue = await prisma.diplomaIssue.findUnique({
      where: { id: issueId },
      select: { id: true, courseId: true, status: true, excludedAt: true },
    })
    if (!issue) {
      return { success: false, error: 'Emisión no encontrada' }
    }
    if (issue.courseId !== courseId) {
      return { success: false, error: 'La emisión no pertenece a este curso' }
    }
    // Guarda contra pestañas desactualizadas: la UI no ofrece "Reenviar" a un
    // excluido, pero la action no debe confiar en eso.
    if (issue.excludedAt) {
      return {
        success: false,
        error:
          'Este alumno está excluido del envío. Volvé a incluirlo si querés mandarle el diploma.',
      }
    }
    if (issue.status !== 'sent' && issue.status !== 'failed') {
      return {
        success: false,
        error:
          'Solo se pueden reenviar emisiones en estado enviado o fallido',
      }
    }

    await resendDiploma(issueId)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: { ok: true } }
  } catch (error) {
    console.error('[diploma] resendDiplomaAction error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al reenviar el diploma'
    return { success: false, error: message }
  }
}

export async function regenerateDiplomasAction(
  courseId: string,
  options: { resendEmails: boolean }
): Promise<ActionResult<BatchResult>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }
  const tmpl = await requireTemplate(courseId)
  if ('error' in tmpl) return { success: false, error: tmpl.error }

  try {
    const result = await regenerateBatchForCourse(courseId, options)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[diploma] regenerateDiplomasAction error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al regenerar los diplomas'
    return { success: false, error: message }
  }
}

export async function retryFailedDiplomasAction(
  courseId: string
): Promise<ActionResult<BatchResult>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }
  const tmpl = await requireTemplate(courseId)
  if ('error' in tmpl) return { success: false, error: tmpl.error }

  try {
    const result = await retryFailedForCourse(courseId)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: result }
  } catch (error) {
    console.error('[diploma] retryFailedDiplomasAction error:', error)
    const message =
      error instanceof Error
        ? error.message
        : 'Error al reintentar los diplomas fallidos'
    return { success: false, error: message }
  }
}

// ============================================
// EXCLUSIÓN — sacar / reincorporar estudiantes del envío
// ============================================

/**
 * Localiza una emisión validando que pertenezca al curso indicado. Evita que
 * un educator con acceso a un curso opere sobre emisiones de otro.
 */
type IssueInCourse = {
  id: string
  courseId: string
  status: DiplomaStatus
  excludedAt: Date | null
  studentName: string
}

async function findIssueInCourse(
  courseId: string,
  issueId: string
): Promise<{ error: string } | { issue: IssueInCourse }> {
  const issue = await prisma.diplomaIssue.findUnique({
    where: { id: issueId },
    select: {
      id: true,
      courseId: true,
      status: true,
      excludedAt: true,
      studentName: true,
    },
  })
  if (!issue) return { error: 'Emisión no encontrada' as const }
  if (issue.courseId !== courseId) {
    return { error: 'La emisión no pertenece a este curso' as const }
  }
  return { issue }
}

export async function excludeDiplomaIssueAction(
  courseId: string,
  issueId: string
): Promise<ActionResult<{ studentName: string }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  try {
    const found = await findIssueInCourse(courseId, issueId)
    if ('error' in found) return { success: false, error: found.error }
    const { issue } = found

    if (issue.excludedAt) {
      return { success: false, error: 'Este alumno ya está excluido' }
    }
    // Un diploma ya enviado no se puede "des-enviar": el email salió y el
    // alumno lo tiene. Excluirlo solo generaría la ilusión de haberlo anulado.
    if (!EXCLUDABLE_STATUSES.includes(issue.status)) {
      return {
        success: false,
        error:
          issue.status === 'sent'
            ? 'El diploma ya fue enviado a este alumno, no se puede excluir'
            : 'No se puede excluir mientras el diploma se está procesando',
      }
    }

    await excludeIssue(issueId)
    revalidateDiplomaPaths(courseId)
    return { success: true, data: { studentName: issue.studentName } }
  } catch (error) {
    console.error('[diploma] excludeDiplomaIssueAction error:', error)
    return { success: false, error: 'Error al excluir al alumno' }
  }
}

export async function restoreDiplomaIssueAction(
  courseId: string,
  issueId: string
): Promise<ActionResult<{ studentName: string; regenerated: boolean }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  try {
    const found = await findIssueInCourse(courseId, issueId)
    if ('error' in found) return { success: false, error: found.error }
    const { issue } = found

    if (!issue.excludedAt) {
      return { success: false, error: 'Este alumno no está excluido' }
    }

    const { regenerated } = await restoreIssue(issueId)
    revalidateDiplomaPaths(courseId)
    return {
      success: true,
      data: { studentName: issue.studentName, regenerated },
    }
  } catch (error) {
    console.error('[diploma] restoreDiplomaIssueAction error:', error)
    return { success: false, error: 'Error al reincorporar al alumno' }
  }
}

// ============================================
// MUESTRA — render de prueba + envío de email de muestra
// ============================================

const sampleEmailSchema = z.string().email('Email inválido')

async function buildSampleAssets(
  courseId: string,
  template: DiplomaTemplateInput,
  sampleName: string
): Promise<{ png: Buffer; pdf: Buffer }> {
  const course = await getCourseById(courseId)
  if (!course) throw new Error('Curso no encontrado')

  const baseImageRes = await fetch(template.baseImageUrl)
  if (!baseImageRes.ok) {
    throw new Error('No se pudo descargar la imagen base de la plantilla')
  }
  const baseImage = Buffer.from(await baseImageRes.arrayBuffer())
  const baseImageMime: 'image/png' | 'image/jpeg' = template.baseImageUrl
    .toLowerCase()
    .split('?')[0]
    .endsWith('.png')
    ? 'image/png'
    : 'image/jpeg'

  const issuedDate = template.dateEnabled
    ? resolveDiplomaDate(course, {
        dateEnabled: template.dateEnabled,
        dateMode: template.dateMode,
        dateCustomValue: template.dateCustomValue ?? null,
      })
    : null

  // El renderer recibe el shape completo de DiplomaTemplate, así que armamos
  // un objeto compatible con valores del form state (algunos campos opcionales
  // se completan con defaults inocuos cuando dateEnabled=false).
  const renderTemplate = {
    id: 'sample',
    courseId,
    baseImageUrl: template.baseImageUrl,
    baseImageWidth: template.baseImageWidth,
    baseImageHeight: template.baseImageHeight,
    nameFontFamily: template.nameFontFamily,
    nameFontWeight: template.nameFontWeight,
    nameFontSize: template.nameFontSize,
    nameColor: template.nameColor,
    nameX: template.nameX,
    nameY: template.nameY,
    nameMaxWidth: template.nameMaxWidth,
    nameAnchor: template.nameAnchor,
    dateEnabled: template.dateEnabled,
    dateFontFamily: template.dateFontFamily,
    dateFontWeight: template.dateFontWeight,
    dateFontSize: template.dateFontSize,
    dateColor: template.dateColor,
    dateX: template.dateX,
    dateY: template.dateY,
    dateMaxWidth: template.dateMaxWidth,
    dateAnchor: template.dateAnchor,
    dateFormat: template.dateFormat,
    dateMode: template.dateMode,
    dateCustomValue: template.dateCustomValue ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies DiplomaTemplate

  return renderDiploma({
    baseImage,
    baseImageMime,
    baseImageWidth: template.baseImageWidth,
    baseImageHeight: template.baseImageHeight,
    template: renderTemplate,
    studentName: sampleName.trim(),
    issuedDate,
  })
}

export async function renderDiplomaSampleAction(
  courseId: string,
  input: { template: DiplomaTemplateInput; sampleName: string }
): Promise<ActionResult<{ pngBase64: string; pdfBase64: string }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  const parsed = diplomaTemplateSchema.safeParse(input.template)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { success: false, error: first?.message ?? 'Plantilla inválida' }
  }
  const sampleName = input.sampleName.trim()
  if (!sampleName) {
    return { success: false, error: 'Indicá un nombre de muestra' }
  }

  try {
    const { png, pdf } = await buildSampleAssets(
      courseId,
      parsed.data,
      sampleName
    )
    return {
      success: true,
      data: {
        pngBase64: png.toString('base64'),
        pdfBase64: pdf.toString('base64'),
      },
    }
  } catch (error) {
    console.error('[diploma] renderDiplomaSampleAction error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al renderizar la muestra'
    return { success: false, error: message }
  }
}

export async function sendDiplomaSampleEmailAction(
  courseId: string,
  input: {
    template: DiplomaTemplateInput
    sampleName: string
    toEmail: string
  }
): Promise<ActionResult<{ resendId?: string }>> {
  const authResult = await authorizeAccess()
  if ('error' in authResult) return { success: false, error: authResult.error }
  const courseResult = await verifyCourseAccess(courseId, authResult.ctx)
  if ('error' in courseResult) {
    return { success: false, error: courseResult.error }
  }

  const parsedTemplate = diplomaTemplateSchema.safeParse(input.template)
  if (!parsedTemplate.success) {
    const first = parsedTemplate.error.issues[0]
    return { success: false, error: first?.message ?? 'Plantilla inválida' }
  }
  const sampleName = input.sampleName.trim()
  if (!sampleName) {
    return { success: false, error: 'Indicá un nombre de muestra' }
  }
  const parsedEmail = sampleEmailSchema.safeParse(input.toEmail.trim())
  if (!parsedEmail.success) {
    return { success: false, error: 'Email inválido' }
  }
  const toEmail = parsedEmail.data

  try {
    const { png, pdf } = await buildSampleAssets(
      courseId,
      parsedTemplate.data,
      sampleName
    )
    const prefix = `diploma-previews/${courseId}/sample-${Date.now()}`
    const [pngBlob, pdfBlob] = await Promise.all([
      put(`${prefix}/diploma.png`, png, {
        access: 'public',
        contentType: 'image/png',
        addRandomSuffix: true,
      }),
      put(`${prefix}/diploma.pdf`, pdf, {
        access: 'public',
        contentType: 'application/pdf',
        addRandomSuffix: true,
      }),
    ])

    const result = await sendDiplomaEmail({
      to: toEmail,
      studentName: sampleName,
      courseName: courseResult.course.title,
      pngUrl: pngBlob.url,
      pdfUrl: pdfBlob.url,
      courseId,
    })
    if (!result.success) {
      return { success: false, error: result.error ?? 'Error al enviar el email' }
    }
    return { success: true, data: { resendId: result.resendId } }
  } catch (error) {
    console.error('[diploma] sendDiplomaSampleEmailAction error:', error)
    const message =
      error instanceof Error ? error.message : 'Error al enviar el email de muestra'
    return { success: false, error: message }
  }
}
