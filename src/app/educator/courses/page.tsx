import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getEducatorCourses } from '@/services/course-service'
import { getTags } from '@/services/tag-service'
import { CourseList } from '@/components/educator'

export default async function EducatorCoursesPage() {
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
