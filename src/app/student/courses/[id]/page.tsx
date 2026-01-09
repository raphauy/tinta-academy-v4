import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentEnrollmentByCourse } from '@/services/enrollment-service'
import { StudentCourseDetail } from '@/components/student/student-course-detail'

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

// Simple skeleton for loading state
function CourseDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-10 w-32 bg-muted rounded" />

      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-6 w-24 bg-muted rounded-full" />
        </div>
        <div className="h-9 w-3/4 bg-muted rounded" />
        <div className="h-5 w-48 bg-muted rounded" />
      </div>

      {/* Event details card skeleton */}
      <div className="h-48 bg-muted rounded-xl" />

      {/* Materials section skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
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
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetailContent courseId={id} viewAs={viewAs} />
    </Suspense>
  )
}
