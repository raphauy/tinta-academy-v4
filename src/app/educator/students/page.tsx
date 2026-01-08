import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getEducatorCourses } from '@/services/course-service'
import { getEducatorStudents } from '@/services/enrollment-service'
import { AllStudentsList, AllStudentsListSkeleton } from '@/components/educator'

export const metadata = {
  title: 'Estudiantes | Tinta Academy',
}

async function StudentsContent() {
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

  // Get all courses and enrollments for this educator
  const [courses, enrollments] = await Promise.all([
    getEducatorCourses(educator.id),
    getEducatorStudents(educator.id),
  ])

  // Map courses to simple options for the filter
  const courseOptions = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
  }))

  return <AllStudentsList enrollments={enrollments} courses={courseOptions} />
}

export default function EducatorStudentsPage() {
  return (
    <Suspense fallback={<AllStudentsListSkeleton />}>
      <StudentsContent />
    </Suspense>
  )
}
