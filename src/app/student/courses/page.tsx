import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentEnrollments } from '@/services/enrollment-service'
import { StudentCourseList } from '@/components/student/student-course-list'

interface StudentCoursesPageProps {
  searchParams: Promise<{ viewAs?: string; status?: string }>
}

// Simple skeleton for loading state
function CoursesListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-32 bg-muted rounded mb-2" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded" />
      </div>

      {/* Filter chips skeleton */}
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-muted rounded-full" />
        ))}
      </div>

      {/* Course list skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  )
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
    <Suspense fallback={<CoursesListSkeleton />}>
      <CoursesContent viewAs={params.viewAs} statusFilter={params.status} />
    </Suspense>
  )
}
