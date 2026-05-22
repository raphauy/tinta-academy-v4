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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Award, MonitorPlay } from 'lucide-react'
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
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex-1 min-w-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Diploma del curso
                </CardTitle>
                <CardDescription>{diplomaCta.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={`/educator/courses/${course.id}/diploma`}>
                    {diplomaCta.label}
                  </Link>
                </Button>
              </CardContent>
            </div>
            {diplomaTemplate && (
              <div className="shrink-0 px-6 pb-6 sm:px-0 sm:pr-6 sm:pt-6">
                <Link
                  href={`/educator/courses/${course.id}/diploma`}
                  className="block cursor-pointer overflow-hidden rounded border bg-muted transition hover:ring-2 hover:ring-primary"
                  aria-label="Ver plantilla del diploma"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={diplomaTemplate.baseImageUrl}
                    alt="Vista previa de la plantilla del diploma"
                    className="block h-28 w-auto object-contain"
                  />
                </Link>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
