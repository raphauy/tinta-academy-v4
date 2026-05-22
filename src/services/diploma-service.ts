import { put } from '@vercel/blob'
import pLimit from 'p-limit'
import { prisma } from '@/lib/prisma'
import type {
  DiplomaIssue,
  DiplomaStatus,
  Student,
  User,
} from '@prisma/client'
import { renderDiploma } from './diploma-render-service'
import { resolveDiplomaDate } from './diploma-template-service'
import { sendDiplomaEmail } from './email-service'

const BATCH_CONCURRENCY = 5
const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutos

// ---------- types ----------

export type CourseDiplomaProgress = {
  pending: number
  generating: number
  generated: number
  sending: number
  sent: number
  failed: number
  total: number
}

export type BatchResult = {
  processed: number
  succeeded: number
  failed: number
}

// Status que se consideran "ya emitidos" a efectos de idempotencia: no se
// regenera ni reenvía sin pedido explícito.
const TERMINAL_STATUSES: DiplomaStatus[] = ['generated', 'sending', 'sent']

// ---------- helpers de curso (batch) ----------

/**
 * Crea DiplomaIssue en estado `pending` para cada Enrollment confirmed del curso
 * que aún no tenga issue. Idempotente: ignora estudiantes con issue existente
 * en estado `generated`, `sending` o `sent`.
 *
 * Lanza si el curso no tiene plantilla de diploma configurada.
 */
export async function createIssuesForCourse(
  courseId: string
): Promise<DiplomaIssue[]> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      diplomaTemplate: true,
      enrollments: {
        where: { status: 'confirmed' },
        include: {
          student: {
            include: {
              user: true,
              diplomaIssues: { where: { courseId } },
            },
          },
        },
      },
    },
  })

  if (!course) {
    throw new Error(`Curso ${courseId} no encontrado`)
  }
  if (!course.diplomaTemplate) {
    throw new Error('El curso no tiene plantilla de diploma configurada')
  }

  const template = course.diplomaTemplate
  const issuedDate = resolveDiplomaDate(course, template)

  const created: DiplomaIssue[] = []

  for (const enrollment of course.enrollments) {
    const existing = enrollment.student.diplomaIssues[0]
    if (existing && TERMINAL_STATUSES.includes(existing.status)) {
      continue
    }
    if (existing) {
      // Issue en `pending` o `failed`: lo devolvemos para reintento sin tocar.
      created.push(existing)
      continue
    }

    const studentName = resolveStudentDisplayName(
      enrollment.student,
      enrollment.student.user
    )
    const issue = await prisma.diplomaIssue.create({
      data: {
        courseId,
        studentId: enrollment.studentId,
        enrollmentId: enrollment.id,
        templateId: template.id,
        studentName,
        issuedDate,
        emailTo: enrollment.student.user.email,
        status: 'pending',
      },
    })
    created.push(issue)
  }

  return created
}

export async function getCourseProgress(
  courseId: string
): Promise<CourseDiplomaProgress> {
  const grouped = await prisma.diplomaIssue.groupBy({
    by: ['status'],
    where: { courseId },
    _count: { _all: true },
  })

  const progress: CourseDiplomaProgress = {
    pending: 0,
    generating: 0,
    generated: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    total: 0,
  }

  for (const row of grouped) {
    progress[row.status] = row._count._all
    progress.total += row._count._all
  }

  return progress
}

// ---------- operaciones por issue ----------

/**
 * Genera PNG y PDF del diploma para una emisión, los sube a Vercel Blob y
 * actualiza el issue. No re-lanza errores: los captura y deja el issue en
 * `failed` con `errorMessage`.
 */
export async function generateAssetsForIssue(issueId: string): Promise<void> {
  const issue = await prisma.diplomaIssue.findUnique({
    where: { id: issueId },
    include: {
      template: true,
    },
  })
  if (!issue) {
    throw new Error(`DiplomaIssue ${issueId} no encontrado`)
  }
  if (TERMINAL_STATUSES.includes(issue.status) && issue.status !== 'generated') {
    // Ya se envió o se está enviando: no tocamos.
    return
  }

  await prisma.diplomaIssue.update({
    where: { id: issueId },
    data: { status: 'generating', errorMessage: null },
  })

  try {
    const baseImage = await fetchBuffer(issue.template.baseImageUrl)
    const baseImageMime = inferImageMime(issue.template.baseImageUrl)

    const { png, pdf } = await renderDiploma({
      baseImage,
      baseImageMime,
      baseImageWidth: issue.template.baseImageWidth,
      baseImageHeight: issue.template.baseImageHeight,
      template: issue.template,
      studentName: issue.studentName,
      issuedDate: issue.template.dateEnabled ? issue.issuedDate : null,
    })

    const [pngBlob, pdfBlob] = await Promise.all([
      put(`diploma-issues/${issueId}/diploma.png`, png, {
        access: 'public',
        contentType: 'image/png',
        allowOverwrite: true,
      }),
      put(`diploma-issues/${issueId}/diploma.pdf`, pdf, {
        access: 'public',
        contentType: 'application/pdf',
        allowOverwrite: true,
      }),
    ])

    await prisma.diplomaIssue.update({
      where: { id: issueId },
      data: {
        status: 'generated',
        pngUrl: pngBlob.url,
        pdfUrl: pdfBlob.url,
        generatedAt: new Date(),
        errorMessage: null,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error desconocido al generar el diploma'
    console.error(`[diploma-service] error generating issue ${issueId}:`, error)
    await prisma.diplomaIssue.update({
      where: { id: issueId },
      data: { status: 'failed', errorMessage: message },
    })
  }
}

/**
 * Envía el diploma por email al estudiante.
 *
 * Solo procesa issues en `generated`. No re-lanza errores: los captura y deja
 * el issue en `failed` con `errorMessage`.
 */
export async function sendEmailForIssue(issueId: string): Promise<void> {
  const issue = await prisma.diplomaIssue.findUnique({
    where: { id: issueId },
    include: { course: { select: { id: true, title: true } } },
  })
  if (!issue) {
    throw new Error(`DiplomaIssue ${issueId} no encontrado`)
  }
  if (issue.status !== 'generated') {
    return
  }
  if (!issue.pngUrl || !issue.pdfUrl) {
    await prisma.diplomaIssue.update({
      where: { id: issueId },
      data: {
        status: 'failed',
        errorMessage: 'Faltan assets PNG/PDF en el issue (regenerar)',
      },
    })
    return
  }

  await prisma.diplomaIssue.update({
    where: { id: issueId },
    data: { status: 'sending', errorMessage: null },
  })

  const result = await sendDiplomaEmail({
    to: issue.emailTo,
    studentName: issue.studentName,
    courseName: issue.course.title,
    pngUrl: issue.pngUrl,
    pdfUrl: issue.pdfUrl,
    courseId: issue.course.id,
  })

  if (!result.success) {
    await prisma.diplomaIssue.update({
      where: { id: issueId },
      data: {
        status: 'failed',
        errorMessage: result.error ?? 'Error desconocido al enviar el email',
      },
    })
    return
  }

  await prisma.diplomaIssue.update({
    where: { id: issueId },
    data: {
      status: 'sent',
      sentAt: new Date(),
      resendId: result.resendId ?? null,
      errorMessage: null,
    },
  })
}

// ---------- orquestación de batch ----------

/**
 * Marca como `failed` los issues que llevan más de 5 minutos en `generating` o
 * `sending`. Se llama al cargar la página para liberar issues huérfanos de
 * crashes o timeouts anteriores. Retorna la cantidad afectada.
 */
export async function cleanupStaleDiplomaIssues(
  courseId: string
): Promise<number> {
  const threshold = new Date(Date.now() - STALE_THRESHOLD_MS)
  const result = await prisma.diplomaIssue.updateMany({
    where: {
      courseId,
      status: { in: ['generating', 'sending'] },
      updatedAt: { lt: threshold },
    },
    data: {
      status: 'failed',
      errorMessage:
        'Timeout o crash en un lote anterior. Volvé a intentar la generación o el envío.',
    },
  })
  return result.count
}

/**
 * Borra los issues `generated` y `failed` del curso (y sus assets en Blob,
 * best-effort). Usado por "Volver al editor" para descartar un lote pendiente.
 * No toca issues en `sent` o `sending`.
 */
export async function discardGeneratedBatch(courseId: string): Promise<number> {
  const { del } = await import('@vercel/blob')
  const issues = await prisma.diplomaIssue.findMany({
    where: { courseId, status: { in: ['generated', 'failed'] } },
    select: { id: true, pngUrl: true, pdfUrl: true },
  })
  if (issues.length === 0) return 0

  await prisma.diplomaIssue.deleteMany({
    where: { id: { in: issues.map((i) => i.id) } },
  })

  const urls = issues
    .flatMap((i) => [i.pngUrl, i.pdfUrl])
    .filter((url): url is string => !!url)
  if (urls.length > 0) {
    await Promise.allSettled(urls.map((url) => del(url))).catch(() => {})
  }
  return issues.length
}

/**
 * Orquesta el batch completo de generación del curso con concurrencia acotada.
 * - Limpia issues colgados.
 * - Crea issues `pending` para enrollments confirmados sin issue (idempotente).
 * - Procesa con concurrencia 5 todos los issues en `pending` o `failed`.
 *
 * Retorna el resumen del batch.
 */
export async function generateBatchForCourse(
  courseId: string
): Promise<BatchResult> {
  await cleanupStaleDiplomaIssues(courseId)
  await createIssuesForCourse(courseId)

  const toProcess = await prisma.diplomaIssue.findMany({
    where: { courseId, status: { in: ['pending', 'failed'] } },
    select: { id: true },
  })

  const limit = pLimit(BATCH_CONCURRENCY)
  let succeeded = 0
  let failed = 0

  await Promise.all(
    toProcess.map((issue) =>
      limit(async () => {
        await generateAssetsForIssue(issue.id)
        const fresh = await prisma.diplomaIssue.findUnique({
          where: { id: issue.id },
          select: { status: true },
        })
        if (fresh?.status === 'generated') succeeded++
        else failed++
      })
    )
  )

  return { processed: toProcess.length, succeeded, failed }
}

/**
 * Orquesta el batch de envío del curso con concurrencia acotada. Itera issues
 * en `generated` y dispara `sendEmailForIssue` para cada uno.
 */
export async function sendBatchForCourse(
  courseId: string
): Promise<BatchResult> {
  await cleanupStaleDiplomaIssues(courseId)

  const toSend = await prisma.diplomaIssue.findMany({
    where: { courseId, status: 'generated' },
    select: { id: true },
  })

  const limit = pLimit(BATCH_CONCURRENCY)
  let succeeded = 0
  let failed = 0

  await Promise.all(
    toSend.map((issue) =>
      limit(async () => {
        await sendEmailForIssue(issue.id)
        const fresh = await prisma.diplomaIssue.findUnique({
          where: { id: issue.id },
          select: { status: true },
        })
        if (fresh?.status === 'sent') succeeded++
        else failed++
      })
    )
  )

  return { processed: toSend.length, succeeded, failed }
}

// ---------- helpers internos ----------

/**
 * Resuelve el texto del nombre que se imprime en el diploma. Tomamos solo el
 * primer nombre y el primer apellido para evitar que nombres compuestos largos
 * desborden la imagen base.
 *
 * Ejemplo: firstName="Gabriela Fabiana", lastName="Perez Alvarez" → "Gabriela Perez".
 */
export function resolveStudentDisplayName(
  student: Pick<Student, 'firstName' | 'lastName'>,
  user: Pick<User, 'name' | 'email'>
): string {
  const first = firstToken(student.firstName)
  const last = firstToken(student.lastName)
  if (first && last) return `${first} ${last}`
  if (first) return first
  if (last) return last
  const fromUser = user.name?.trim()
  if (fromUser) {
    const tokens = fromUser.split(/\s+/).filter(Boolean)
    if (tokens.length >= 2) return `${tokens[0]} ${tokens[tokens.length - 1]}`
    if (tokens.length === 1) return tokens[0]
  }
  return user.email.split('@')[0]
}

function firstToken(value: string | null | undefined): string {
  if (!value) return ''
  return value.trim().split(/\s+/).filter(Boolean)[0] ?? ''
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `No se pudo descargar la imagen base (${response.status} ${response.statusText})`
    )
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

function inferImageMime(url: string): 'image/png' | 'image/jpeg' {
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}
