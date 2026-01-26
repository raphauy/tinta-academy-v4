import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import { getEnrollmentsByCourse } from '@/services/enrollment-service'
import { getCommunicationsHistoryByCourse } from '@/services/email-campaign-service'
import { StudentListSkeleton } from '@/components/educator'
import { CourseStudentsClient } from './course-students-client'

interface CourseStudentsPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CourseStudentsPageProps) {
  const { id } = await params
  const course = await getCourseById(id)

  return {
    title: course
      ? `Alumnos: ${course.title} | Tinta Academy`
      : 'Alumnos del Curso',
  }
}

async function CourseStudentsContent({ id }: { id: string }) {
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

  // Fetch enrollments and communications history in parallel
  const [enrollments, communicationsHistory] = await Promise.all([
    getEnrollmentsByCourse(id),
    getCommunicationsHistoryByCourse(id),
  ])

  return (
    <CourseStudentsClient
      course={course}
      enrollments={enrollments}
      communicationsHistory={communicationsHistory}
    />
  )
}

export default async function CourseStudentsPage({
  params,
}: CourseStudentsPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<StudentListSkeleton />}>
      <CourseStudentsContent id={id} />
    </Suspense>
  )
}
