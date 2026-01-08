import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getEducatorCourses } from '@/services/course-service'
import { getTags } from '@/services/tag-service'
import { CourseList, CourseListSkeleton } from '@/components/educator'

async function CoursesContent() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/')
  }

  const [courses, tags] = await Promise.all([
    getEducatorCourses(educator.id),
    getTags()
  ])

  return <CourseList courses={courses} tags={tags} />
}

export default function EducatorCoursesPage() {
  return (
    <Suspense fallback={<CourseListSkeleton />}>
      <CoursesContent />
    </Suspense>
  )
}
