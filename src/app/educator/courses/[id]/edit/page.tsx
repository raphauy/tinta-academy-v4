import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import { getMaterialsByCourse } from '@/services/material-service'
import {
  PresencialCourseForm,
  MaterialsSection,
  CourseStatusActions,
} from '@/components/educator'

interface EditCoursePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditCoursePageProps) {
  const { id } = await params
  const course = await getCourseById(id)

  return {
    title: course
      ? `Editar: ${course.title} | Tinta Academy`
      : 'Editar Curso Presencial',
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

  // Fetch materials for this course
  const materials = await getMaterialsByCourse(id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Editar Curso Presencial
          </h1>
          <p className="text-muted-foreground">
            Modifica la informacion del curso &ldquo;{course.title}&rdquo;.
          </p>
        </div>
        <CourseStatusActions courseId={course.id} status={course.status} />
      </div>

      <PresencialCourseForm mode="edit" course={course} />

      {/* Materials section - only for existing courses */}
      <MaterialsSection courseId={course.id} materials={materials} />
    </div>
  )
}
