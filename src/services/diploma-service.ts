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
 * Buffer + mime de la imagen base precargados, para compartir entre todas las
 * emisiones de un mismo batch y evitar fetches redundantes a Vercel Blob (que
 * rate-limitea al mismo asset bajo concurrencia alta).
 */
type PreparedBaseImage = {
  baseImage: Buffer
  baseImageMime: 'image/png' | 'image/jpeg'
}

/**
 * Descarga la imagen base de la plantilla del curso una sola vez. Pensado
 * para llamarse al arrancar un batch y pasar el buffer a cada issue.
 */
async function prepareBaseImageForCourse(
  courseId: string
): Promise<PreparedBaseImage> {
  const template = await prisma.diplomaTemplate.findUnique({
    where: { courseId },
    select: { baseImageUrl: true },
  })
  if (!template) {
    throw new Error('El curso no tiene plantilla de diploma configurada')
  }
  const baseImage = await fetchBuffer(template.baseImageUrl)
  const baseImageMime = inferImageMime(template.baseImageUrl)
  return { baseImage, baseImageMime }
}

/**
 * Genera PNG y PDF del diploma para una emisión, los sube a Vercel Blob y
 * actualiza el issue. No re-lanza errores: los captura y deja el issue en
 * `failed` con `errorMessage`.
 *
 * Si recibe `preparedBase`, reusa esa descarga. Si no, descarga la imagen
 * base sola (caso de regeneración individual).
 */
export async function generateAssetsForIssue(
  issueId: string,
  preparedBase?: PreparedBaseImage
): Promise<void> {
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
    const baseImage =
      preparedBase?.baseImage ?? (await fetchBuffer(issue.template.baseImageUrl))
    const baseImageMime =
      preparedBase?.baseImageMime ?? inferImageMime(issue.template.baseImageUrl)

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
 * Marca como `failed` las issues huérfanas que llevan más de 5 minutos sin
 * progresar (en `pending`, `generating` o `sending`). Se llama al cargar la
 * página y al inicio de cada batch para liberar issues colgadas por crashes
 * o timeouts. Retorna la cantidad afectada.
 *
 * Crítico para evitar que la UI quede poleando indefinidamente issues que
 * nunca van a procesarse — cada poll en producción es una invocación.
 */
export async function cleanupStaleDiplomaIssues(
  courseId: string
): Promise<number> {
  const threshold = new Date(Date.now() - STALE_THRESHOLD_MS)
  const result = await prisma.diplomaIssue.updateMany({
    where: {
      courseId,
      status: { in: ['pending', 'generating', 'sending'] },
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

  if (toProcess.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  // Descargamos la imagen base una sola vez para evitar rate-limit de Vercel
  // Blob cuando hay muchas emisiones generándose en paralelo contra el mismo
  // asset. Si esa descarga falla, marcamos todas las issues como `failed`
  // antes de propagar el error — así la UI no queda atascada poleando issues
  // `pending` que nunca van a procesarse.
  let preparedBase: PreparedBaseImage
  try {
    preparedBase = await prepareBaseImageForCourse(courseId)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error al descargar la imagen base'
    await prisma.diplomaIssue.updateMany({
      where: { id: { in: toProcess.map((i) => i.id) } },
      data: { status: 'failed', errorMessage: message },
    })
    throw error
  }

  const limit = pLimit(BATCH_CONCURRENCY)
  let succeeded = 0
  let failed = 0

  await Promise.all(
    toProcess.map((issue) =>
      limit(async () => {
        await generateAssetsForIssue(issue.id, preparedBase)
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

// ---------- regeneración / reenvío / reintento ----------

/**
 * Re-resuelve `studentName`, `issuedDate` y `emailTo` desde Student/User/Course/Template
 * y persiste los nuevos valores en la DiplomaIssue. Se llama antes de cada
 * regeneración para reflejar cambios de perfil del estudiante o de fechas del curso.
 */
export async function refreshIssueSnapshot(issueId: string): Promise<void> {
  const issue = await prisma.diplomaIssue.findUnique({
    where: { id: issueId },
    include: {
      student: { include: { user: true } },
      course: true,
      template: true,
    },
  })
  if (!issue) {
    throw new Error(`DiplomaIssue ${issueId} no encontrado`)
  }

  const studentName = resolveStudentDisplayName(issue.student, issue.student.user)
  const issuedDate = resolveDiplomaDate(issue.course, issue.template)
  const emailTo = issue.student.user.email

  await prisma.diplomaIssue.update({
    where: { id: issueId },
    data: { studentName, issuedDate, emailTo },
  })
}

/**
 * Regenera los assets PNG/PDF del diploma, refrescando primero el snapshot.
 * A diferencia de `generateAssetsForIssue`, fuerza el render aunque la issue
 * esté en estado terminal. Los paths en Blob se sobrescriben con
 * `allowOverwrite: true`, así que las URLs ya distribuidas siguen siendo
 * válidas pero apuntan al asset nuevo.
 *
 * Si recibe `preparedBase`, reusa esa descarga (para batches grandes).
 */
export async function regenerateIssueAssets(
  issueId: string,
  preparedBase?: PreparedBaseImage
): Promise<void> {
  await refreshIssueSnapshot(issueId)

  const issue = await prisma.diplomaIssue.findUnique({
    where: { id: issueId },
    include: { template: true },
  })
  if (!issue) {
    throw new Error(`DiplomaIssue ${issueId} no encontrado`)
  }

  await prisma.diplomaIssue.update({
    where: { id: issueId },
    data: { status: 'generating', errorMessage: null },
  })

  try {
    const baseImage =
      preparedBase?.baseImage ?? (await fetchBuffer(issue.template.baseImageUrl))
    const baseImageMime =
      preparedBase?.baseImageMime ?? inferImageMime(issue.template.baseImageUrl)

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
      error instanceof Error
        ? error.message
        : 'Error desconocido al regenerar el diploma'
    console.error(`[diploma-service] error regenerating issue ${issueId}:`, error)
    await prisma.diplomaIssue.update({
      where: { id: issueId },
      data: { status: 'failed', errorMessage: message },
    })
  }
}

/**
 * Reenvía un diploma a un estudiante puntual: regenera el asset y envía el
 * email. Es la acción detrás de "Reenviar" en la fila de la tabla.
 *
 * Si recibe `preparedBase`, reusa esa descarga (para batches grandes como
 * `retryFailedForCourse`).
 */
export async function resendDiploma(
  issueId: string,
  preparedBase?: PreparedBaseImage
): Promise<void> {
  await regenerateIssueAssets(issueId, preparedBase)
  // sendEmailForIssue ignora la issue si no quedó en `generated` (p.ej. falló el render).
  await sendEmailForIssue(issueId)
}

/**
 * Regenera assets de todas las DiplomaIssue del curso usando la plantilla
 * actual. Si `resendEmails=true`, también dispara el envío.
 *
 * Cuando `resendEmails=false`, las issues que estaban en `sent` antes de la
 * regeneración vuelven a quedar en `sent` (el asset cambió pero el email
 * original ya entregado se respeta).
 */
export async function regenerateBatchForCourse(
  courseId: string,
  options: { resendEmails: boolean }
): Promise<BatchResult> {
  await cleanupStaleDiplomaIssues(courseId)

  const issues = await prisma.diplomaIssue.findMany({
    where: { courseId },
    select: { id: true, status: true },
  })

  if (issues.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let preparedBase: PreparedBaseImage
  try {
    preparedBase = await prepareBaseImageForCourse(courseId)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error al descargar la imagen base'
    // Crítico: no tocar issues `sent` — el email ya fue entregado al estudiante
    // y los assets en Blob siguen siendo válidos. Marcar como `failed` por un
    // transient de la imagen base sería una regresión visible (el estudiante
    // sigue viendo su diploma OK, el educator percibe que "se rompió todo").
    await prisma.diplomaIssue.updateMany({
      where: {
        id: { in: issues.map((i) => i.id) },
        status: { notIn: ['sent'] },
      },
      data: { status: 'failed', errorMessage: message },
    })
    throw error
  }

  const limit = pLimit(BATCH_CONCURRENCY)
  let succeeded = 0
  let failed = 0

  await Promise.all(
    issues.map((issue) =>
      limit(async () => {
        const wasSent = issue.status === 'sent'
        await regenerateIssueAssets(issue.id, preparedBase)

        if (options.resendEmails) {
          await sendEmailForIssue(issue.id)
        } else if (wasSent) {
          const after = await prisma.diplomaIssue.findUnique({
            where: { id: issue.id },
            select: { status: true },
          })
          if (after?.status === 'generated') {
            await prisma.diplomaIssue.update({
              where: { id: issue.id },
              data: { status: 'sent' },
            })
          }
        }

        const fresh = await prisma.diplomaIssue.findUnique({
          where: { id: issue.id },
          select: { status: true },
        })

        if (options.resendEmails) {
          if (fresh?.status === 'sent') succeeded++
          else failed++
        } else {
          if (fresh?.status === 'generated' || fresh?.status === 'sent') succeeded++
          else failed++
        }
      })
    )
  )

  return { processed: issues.length, succeeded, failed }
}

/**
 * Reintenta todas las issues del curso con `status = failed`: regenera el
 * asset y envía el email.
 */
export async function retryFailedForCourse(
  courseId: string
): Promise<BatchResult> {
  await cleanupStaleDiplomaIssues(courseId)

  const issues = await prisma.diplomaIssue.findMany({
    where: { courseId, status: 'failed' },
    select: { id: true },
  })

  if (issues.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let preparedBase: PreparedBaseImage
  try {
    preparedBase = await prepareBaseImageForCourse(courseId)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error al descargar la imagen base'
    await prisma.diplomaIssue.updateMany({
      where: { id: { in: issues.map((i) => i.id) } },
      data: { status: 'failed', errorMessage: message },
    })
    throw error
  }

  const limit = pLimit(BATCH_CONCURRENCY)
  let succeeded = 0
  let failed = 0

  await Promise.all(
    issues.map((issue) =>
      limit(async () => {
        await resendDiploma(issue.id, preparedBase)
        const fresh = await prisma.diplomaIssue.findUnique({
          where: { id: issue.id },
          select: { status: true },
        })
        if (fresh?.status === 'sent') succeeded++
        else failed++
      })
    )
  )

  return { processed: issues.length, succeeded, failed }
}

// ---------- queries para panel student ----------

export type DiplomaIssueForStudent = {
  id: string
  courseId: string
  courseTitle: string
  courseSlug: string
  studentName: string
  issuedDate: Date
  pngUrl: string
  pdfUrl: string
  sentAt: Date | null
  generatedAt: Date | null
}

/**
 * Lista todas las emisiones de diploma del estudiante con assets disponibles
 * (pngUrl y pdfUrl no null). Ordenadas por fecha de envío descendente.
 */
export async function getDiplomaIssuesByStudent(
  studentId: string
): Promise<DiplomaIssueForStudent[]> {
  const issues = await prisma.diplomaIssue.findMany({
    where: {
      studentId,
      pngUrl: { not: null },
      pdfUrl: { not: null },
    },
    include: {
      course: { select: { id: true, title: true, slug: true } },
    },
    orderBy: [{ sentAt: 'desc' }, { generatedAt: 'desc' }],
  })

  return issues.map((i) => ({
    id: i.id,
    courseId: i.course.id,
    courseTitle: i.course.title,
    courseSlug: i.course.slug,
    studentName: i.studentName,
    issuedDate: i.issuedDate,
    pngUrl: i.pngUrl!,
    pdfUrl: i.pdfUrl!,
    sentAt: i.sentAt,
    generatedAt: i.generatedAt,
  }))
}

/**
 * Obtiene la emisión de diploma para un par (curso, estudiante). Devuelve
 * null si no existe o si no tiene assets aún.
 */
export async function getDiplomaIssueByCourseAndStudent(
  courseId: string,
  studentId: string
): Promise<DiplomaIssueForStudent | null> {
  const issue = await prisma.diplomaIssue.findUnique({
    where: { courseId_studentId: { courseId, studentId } },
    include: {
      course: { select: { id: true, title: true, slug: true } },
    },
  })
  if (!issue || !issue.pngUrl || !issue.pdfUrl) return null
  return {
    id: issue.id,
    courseId: issue.course.id,
    courseTitle: issue.course.title,
    courseSlug: issue.course.slug,
    studentName: issue.studentName,
    issuedDate: issue.issuedDate,
    pngUrl: issue.pngUrl,
    pdfUrl: issue.pdfUrl,
    sentAt: issue.sentAt,
    generatedAt: issue.generatedAt,
  }
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
  // Reintentos con backoff: el CDN de Vercel Blob a veces devuelve 403/5xx
  // transient bajo carga o en edge cold-start. Tres intentos cubren la
  // mayoría de esos casos sin volver el flujo lento en el camino feliz.
  const delays = [0, 500, 1500]
  let lastError: Error | null = null
  for (const delay of delays) {
    if (delay > 0) await new Promise((r) => setTimeout(r, delay))
    try {
      const response = await fetch(url, { cache: 'no-store' })
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        return Buffer.from(arrayBuffer)
      }
      lastError = new Error(
        `No se pudo descargar la imagen base (${response.status} ${response.statusText})`
      )
      // Solo reintentamos en errores transient (403/408/429/5xx). Para 404
      // u otros 4xx no transient, fallamos rápido.
      if (
        response.status !== 403 &&
        response.status !== 408 &&
        response.status !== 429 &&
        response.status < 500
      ) {
        throw lastError
      }
    } catch (err) {
      lastError =
        err instanceof Error
          ? err
          : new Error('Error de red al descargar la imagen base')
    }
  }
  throw lastError ?? new Error('No se pudo descargar la imagen base')
}

function inferImageMime(url: string): 'image/png' | 'image/jpeg' {
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.png')) return 'image/png'
  return 'image/jpeg'
}
