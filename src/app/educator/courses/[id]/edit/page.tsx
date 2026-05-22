import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import { getMaterialsByCourse } from '@/services/material-service'
import { getTags } from '@/services/tag-service'
import { getCourseWorkflows } from '@/services/workflow-execution-service'
import { getConfirmedEnrollmentCount } from '@/services/enrollment-service'
import {
  PresencialCourseForm,
  WebinarCourseForm,
  OnlineCourseForm,
  MaterialsSection,
  CourseStatusActions,
} from '@/components/educator'
import { CourseWorkflowsSection } from '@/components/educator/courses/course-workflows-section'
import { getDiplomaTemplateByCourseId } from '@/services/diploma-template-service'
import { getCourseProgress } from '@/services/diploma-service'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileText,
  Loader2,
  MonitorPlay,
  Users,
} from 'lucide-react'
import Link from 'next/link'

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditCoursePageProps) {
  const { id } = await params
  const course = await getCourseById(id)

  if (!course) {
    return { title: 'Editar Curso | Tinta Academy' }
  }

  const modalityLabels: Record<string, string> = {
    presencial: 'Curso Presencial',
    webinar: 'Webinar',
    online: 'Curso Online',
  }

  return {
    title: `Editar: ${course.title} | Tinta Academy`,
    description: `Editar ${modalityLabels[course.modality] ?? 'curso'}`,
  }
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (
    session.user.role !== 'educator' &&
    session.user.role !== 'superadmin'
  ) {
    redirect('/')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/')
  }

  const course = await getCourseById(id)

  if (!course) {
    notFound()
  }

  // Verify ownership
  if (course.educatorId !== educator.id) {
    redirect('/educator/courses')
  }

  // Fetch materials, tags, workflows, enrollment count, and diploma template for this course
  const [materials, tags, courseWorkflows, confirmedEnrollments, diplomaTemplate] = await Promise.all([
    getMaterialsByCourse(id),
    getTags(),
    getCourseWorkflows(id),
    getConfirmedEnrollmentCount(id),
    getDiplomaTemplateByCourseId(id),
  ])

  const hasActiveWorkflows = courseWorkflows.some((cw) => cw.status === 'active')
  const hasDiplomaTemplate = diplomaTemplate !== null

  const diplomaProgress =
    hasDiplomaTemplate && course.type !== 'wset'
      ? await getCourseProgress(id)
      : null

  const diplomaCta = !hasDiplomaTemplate
    ? {
        label: 'Configurar diploma',
        description:
          'Configurá una plantilla para emitir diplomas a los estudiantes que completen el curso.',
      }
    : diplomaProgress && diplomaProgress.generated > 0
      ? {
          label: 'Revisar y enviar diplomas',
          description: `Tenés ${diplomaProgress.generated} diploma${diplomaProgress.generated === 1 ? '' : 's'} listo${diplomaProgress.generated === 1 ? '' : 's'} para revisar y enviar.`,
        }
      : diplomaProgress &&
          (diplomaProgress.sending > 0 ||
            diplomaProgress.pending + diplomaProgress.generating > 0)
        ? {
            label: 'Ver progreso',
            description:
              diplomaProgress.sending > 0
                ? `Enviando ${diplomaProgress.sending} diploma${diplomaProgress.sending === 1 ? '' : 's'}.`
                : `Generando ${diplomaProgress.pending + diplomaProgress.generating} diploma${diplomaProgress.pending + diplomaProgress.generating === 1 ? '' : 's'}.`,
          }
        : diplomaProgress && diplomaProgress.sent > 0
          ? {
              label: 'Gestionar diplomas',
              description: `Ya enviaste ${diplomaProgress.sent} diploma${diplomaProgress.sent === 1 ? '' : 's'} en este curso.${diplomaProgress.failed > 0 ? ` ${diplomaProgress.failed} fallaron.` : ''}`,
            }
          : {
              label: 'Gestionar diplomas',
              description:
                'Plantilla configurada. Emití diplomas a los estudiantes.',
            }

  // Modality labels for display
  const modalityLabels: Record<string, string> = {
    presencial: 'Curso Presencial',
    webinar: 'Webinar',
    online: 'Curso Online',
  }

  // Render the appropriate form based on modality
  const renderForm = () => {
    if (course.modality === 'webinar') {
      return (
        <WebinarCourseForm
          mode="edit"
          course={course}
          initialTags={tags}
        />
      )
    }

    if (course.modality === 'online') {
      return (
        <OnlineCourseForm
          mode="edit"
          course={course}
          initialTags={tags}
        />
      )
    }

    // Default to presencial form
    return (
      <PresencialCourseForm
        mode="edit"
        course={course}
        initialTags={tags}
        hasActiveWorkflows={hasActiveWorkflows}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Editar {modalityLabels[course.modality] ?? 'Curso'}
          </h1>
          <p className="text-muted-foreground">
            Modificá la información de &ldquo;{course.title}&rdquo;.
          </p>
        </div>
        <CourseStatusActions courseId={course.id} status={course.status} />
      </div>

      {renderForm()}

      {/* Module management link for online courses */}
      {course.modality === 'online' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorPlay className="h-5 w-5" />
              Contenido del Curso
            </CardTitle>
            <CardDescription>
              Gestioná los módulos y lecciones con videos de tu curso online.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/educator/courses/${course.id}/modules`}>
                Gestionar Módulos y Lecciones
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Materials section - only for non-online courses */}
      {course.modality !== 'online' && (
        <MaterialsSection courseId={course.id} materials={materials} />
      )}

      {/* Workflows section */}
      <CourseWorkflowsSection
        courseId={course.id}
        courseName={course.title}
        enrolledCount={confirmedEnrollments}
        courseWorkflows={courseWorkflows}
      />

      {/* Diploma section - excluido para WSET (los emite Londres) */}
      {course.type !== 'wset' && (
        <Card className="@container relative overflow-hidden p-0 @[640px]:[--card-h:16rem] @[640px]:h-[var(--card-h)]">
          {/*
            Layout responsive con container queries (mide el ancho del propio
            Card, no del viewport — así no nos rompe el sidebar lateral).

            - Card <640px: SIN thumbnail. Stack vertical natural. Stats grid 2 cols.
            - Card ≥640px: thumbnail derecha full-bleed (aspect-ratio del diploma
              real). Altura card = 16rem (256px). Thumb width = 16rem × ratio
              ≈ 362px. Izquierda reserva ese padding-right.
          */}
          <div
            className="flex h-full flex-col gap-6 py-6 @[640px]:pr-[var(--thumb-w)]"
            style={
              diplomaTemplate
                ? ({
                    '--ratio': (
                      diplomaTemplate.baseImageWidth /
                      diplomaTemplate.baseImageHeight
                    ).toFixed(4),
                    '--thumb-w': 'calc(var(--card-h) * var(--ratio))',
                  } as React.CSSProperties)
                : undefined
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Diploma del curso
              </CardTitle>
              <CardDescription>{diplomaCta.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {diplomaProgress && diplomaProgress.total > 0 ? (
                <DiplomaStatsGrid progress={diplomaProgress} />
              ) : hasDiplomaTemplate ? (
                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                  Plantilla lista. Cuando emitas los primeros diplomas,
                  acá vas a ver el resumen por estado.
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                  Subí la imagen base y posicioná el nombre del alumno
                  para habilitar la emisión de diplomas.
                </div>
              )}
            </CardContent>
            <CardFooter className="mt-auto border-t pt-6">
              <Button asChild className="cursor-pointer">
                <Link href={`/educator/courses/${course.id}/diploma`}>
                  {diplomaCta.label}
                </Link>
              </Button>
            </CardFooter>
          </div>

          {/* Thumbnail full-bleed: anclajes inset-y-0/right-0 le dan altura
              completa del Card; aspect-ratio le da el ancho exacto del diploma.
              Toca top + right + bottom, proporciones perfectas. */}
          {diplomaTemplate && (
            <Link
              href={`/educator/courses/${course.id}/diploma`}
              className="group absolute inset-y-0 right-0 hidden cursor-pointer overflow-hidden bg-muted transition hover:ring-2 hover:ring-primary @[640px]:block"
              style={{
                aspectRatio: `${diplomaTemplate.baseImageWidth} / ${diplomaTemplate.baseImageHeight}`,
              }}
              aria-label="Ver plantilla del diploma"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={diplomaTemplate.baseImageUrl}
                alt="Vista previa de la plantilla del diploma"
                className="block h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </Link>
          )}
        </Card>
      )}
    </div>
  )
}

type DiplomaStatsGridProps = {
  progress: {
    pending: number
    generating: number
    generated: number
    sending: number
    sent: number
    failed: number
    total: number
  }
}

function DiplomaStatsGrid({ progress }: DiplomaStatsGridProps) {
  const inFlight = progress.pending + progress.generating + progress.sending

  const tiles: Array<{
    label: string
    value: number
    Icon: typeof Award
    tone: 'success' | 'info' | 'warning' | 'destructive' | 'muted'
    spin?: boolean
  }> = [
    {
      label: 'Enviados',
      value: progress.sent,
      Icon: CheckCircle2,
      tone: 'success',
    },
  ]
  if (progress.generated > 0) {
    tiles.push({
      label: 'Listos',
      value: progress.generated,
      Icon: FileText,
      tone: 'info',
    })
  }
  if (inFlight > 0) {
    tiles.push({
      label: 'En proceso',
      value: inFlight,
      Icon: Loader2,
      tone: 'warning',
      spin: true,
    })
  }
  if (progress.failed > 0) {
    tiles.push({
      label: 'Fallidos',
      value: progress.failed,
      Icon: AlertCircle,
      tone: 'destructive',
    })
  }
  tiles.push({
    label: 'Total',
    value: progress.total,
    Icon: Users,
    tone: 'muted',
  })

  return (
    // Cada tile tiene su ancho natural (su contenido). flex-wrap acomoda la
    // cantidad de tiles que haya y wrappea cuando no caben. No "estiramos"
    // las tiles para llenar espacio — quedan compactas y consistentes.
    <div className="flex flex-wrap gap-3">
      {tiles.map((t) => (
        <DiplomaStatTile key={t.label} {...t} />
      ))}
    </div>
  )
}

const TONE_CLASSES: Record<
  'success' | 'info' | 'warning' | 'destructive' | 'muted',
  { bg: string; text: string }
> = {
  success: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  info: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  destructive: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
  },
  muted: {
    bg: 'bg-stone-100 dark:bg-stone-800',
    text: 'text-stone-700 dark:text-stone-300',
  },
}

function DiplomaStatTile({
  label,
  value,
  Icon,
  tone,
  spin,
}: {
  label: string
  value: number
  Icon: typeof Award
  tone: 'success' | 'info' | 'warning' | 'destructive' | 'muted'
  spin?: boolean
}) {
  const classes = TONE_CLASSES[tone]
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3">
      <div className={`shrink-0 rounded-md p-2 ${classes.bg} ${classes.text}`}>
        <Icon className={`h-4 w-4 ${spin ? 'animate-spin' : ''}`} />
      </div>
      <div className="flex items-baseline gap-1.5 whitespace-nowrap">
        <span className="text-2xl font-bold leading-none tabular-nums">
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}
