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
  MaterialsSection,
  CourseStatusActions,
} from '@/components/educator'
import { CourseWorkflowsSection } from '@/components/educator/courses/course-workflows-section'

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

  // Fetch materials, tags, workflows, and enrollment count for this course
  const [materials, tags, courseWorkflows, confirmedEnrollments] = await Promise.all([
    getMaterialsByCourse(id),
    getTags(),
    getCourseWorkflows(id),
    getConfirmedEnrollmentCount(id),
  ])

  const hasActiveWorkflows = courseWorkflows.some((cw) => cw.status === 'active')

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

    // Default to presencial form (also handles online for now)
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
            Modifica la informacion de &ldquo;{course.title}&rdquo;.
          </p>
        </div>
        <CourseStatusActions courseId={course.id} status={course.status} />
      </div>

      {renderForm()}

      {/* Materials section - only for existing courses */}
      <MaterialsSection courseId={course.id} materials={materials} />

      {/* Workflows section */}
      <CourseWorkflowsSection
        courseId={course.id}
        courseName={course.title}
        enrolledCount={confirmedEnrollments}
        courseWorkflows={courseWorkflows}
      />
    </div>
  )
}
