import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getAllCoursesForAdmin } from '@/services/course-service'
import { getTags } from '@/services/tag-service'
import { AdminCoursesClient } from './admin-courses-client'
import { AdminCoursesSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Cursos - Admin',
}

async function CoursesContent() {
  const [courses, tags] = await Promise.all([
    getAllCoursesForAdmin(),
    getTags()
  ])

  return <AdminCoursesClient courses={courses} tags={tags} />
}

export default function AdminCoursesPage() {
  return (
    <Suspense fallback={<AdminCoursesSkeleton />}>
      <CoursesContent />
    </Suspense>
  )
}
