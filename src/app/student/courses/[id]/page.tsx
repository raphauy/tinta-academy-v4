import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentEnrollmentByCourse } from '@/services/enrollment-service'
import { StudentCourseDetail } from '@/components/student/student-course-detail'
import { StudentCourseDetailSkeleton } from '@/components/student/skeletons'

interface StudentCourseDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ viewAs?: string }>
}

export async function generateMetadata({ params }: StudentCourseDetailPageProps) {
  const { id } = await params
  return {
    title: `Curso - Panel de Estudiante`,
    description: `Detalle del curso ${id}`,
  }
}

async function CourseDetailContent({
  courseId,
  viewAs,
}: {
  courseId: string
  viewAs: string | undefined
}) {
  const result = await resolveStudentForPage(viewAs)

  if (!result.authorized) {
    if (result.reason === 'no_student_selected') {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecciona un estudiante del selector de arriba para ver el detalle del curso.
          </p>
        </div>
      )
    }
    redirect('/')
  }

  const { student } = result

  // Fetch the student's enrollment in this specific course
  const enrollment = await getStudentEnrollmentByCourse(student.id, courseId)

  // If no enrollment found, student is not enrolled in this course
  if (!enrollment) {
    notFound()
  }

  // Only show confirmed enrollments
  if (enrollment.status !== 'confirmed') {
    redirect(viewAs ? `/student/courses?viewAs=${viewAs}` : '/student/courses')
  }

  return <StudentCourseDetail enrollment={enrollment} viewAs={viewAs} />
}

export default async function StudentCourseDetailPage({
  params,
  searchParams,
}: StudentCourseDetailPageProps) {
  const { id } = await params
  const { viewAs } = await searchParams

  return (
    <Suspense fallback={<StudentCourseDetailSkeleton />}>
      <CourseDetailContent courseId={id} viewAs={viewAs} />
    </Suspense>
  )
}
