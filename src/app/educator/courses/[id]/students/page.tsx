import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import { getEnrollmentsByCourse } from '@/services/enrollment-service'
import { StudentList } from '@/components/educator/student-list'

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

export default async function CourseStudentsPage({
  params,
}: CourseStudentsPageProps) {
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

  // Fetch enrollments for this course
  const enrollments = await getEnrollmentsByCourse(id)

  return <StudentList course={course} enrollments={enrollments} />
}
