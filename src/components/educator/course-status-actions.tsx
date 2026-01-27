'use client'

import { CourseStatusSelector } from './course-status-selector'
import type { CourseStatus } from '@prisma/client'

interface CourseStatusActionsProps {
  courseId: string
  status: CourseStatus
}

export function CourseStatusActions({
  courseId,
  status,
}: CourseStatusActionsProps) {
  return <CourseStatusSelector courseId={courseId} status={status} />
}
