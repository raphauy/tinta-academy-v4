'use client'

import type { AdminCourse } from '@/services/course-service'
import type { Tag } from '@prisma/client'
import { AdminCourses } from '@/components/admin/admin-courses'

interface AdminCoursesClientProps {
  courses: AdminCourse[]
  tags: Tag[]
}

export function AdminCoursesClient({ courses, tags }: AdminCoursesClientProps) {
  return <AdminCourses courses={courses} tags={tags} />
}
