import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentEnrollments } from '@/services/enrollment-service'
import { StudentCourseList } from '@/components/student/student-course-list'
import { StudentCourseListSkeleton } from '@/components/student/skeletons'

interface StudentCoursesPageProps {
  searchParams: Promise<{ viewAs?: string; status?: string }>
}

async function CoursesContent({
  viewAs,
  statusFilter,
}: {
  viewAs: string | undefined
  statusFilter: string | undefined
}) {
  const result = await resolveStudentForPage(viewAs)

  if (!result.authorized) {
    if (result.reason === 'no_student_selected') {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecciona un estudiante del selector de arriba para ver sus cursos.
          </p>
        </div>
      )
    }
    redirect('/')
  }

  const { student } = result

  // Fetch enrollments - only confirmed ones are relevant for the student view
  const enrollments = await getStudentEnrollments(student.id, {
    status: 'confirmed',
  })

  return (
    <StudentCourseList
      enrollments={enrollments}
      currentFilter={statusFilter || 'all'}
      viewAs={viewAs}
    />
  )
}

export default async function StudentCoursesPage({
  searchParams,
}: StudentCoursesPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<StudentCourseListSkeleton />}>
      <CoursesContent viewAs={params.viewAs} statusFilter={params.status} />
    </Suspense>
  )
}
