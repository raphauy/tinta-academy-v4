'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { AdminCourse } from '@/services/course-service'
import type { EducatorWithStats, UpdateEducatorAsAdminInput } from '@/services/educator-service'
import type { Tag } from '@prisma/client'
import { AdminCourses } from '@/components/admin/admin-courses'
import { EducatorDetailDialog } from '@/components/admin/educator-detail-dialog'
import {
  getEducatorDetailAction,
  updateEducatorAction,
} from '@/app/admin/users/educators/actions'

interface AdminCoursesClientProps {
  courses: AdminCourse[]
  tags: Tag[]
}

export function AdminCoursesClient({ courses, tags }: AdminCoursesClientProps) {
  const router = useRouter()

  // Educator dialog state
  const [selectedEducator, setSelectedEducator] = useState<EducatorWithStats | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [isEducatorDialogOpen, setIsEducatorDialogOpen] = useState(false)

  const handleEducatorClick = async (educatorId: string) => {
    // Open dialog immediately with loading state could be added, but for simplicity we fetch first
    const result = await getEducatorDetailAction(educatorId)

    if (result.success) {
      setSelectedEducator(result.data)
      setDialogMode('view')
      setIsEducatorDialogOpen(true)
    } else {
      toast.error(result.error)
    }
  }

  const handleSaveEducator = async (data: UpdateEducatorAsAdminInput) => {
    if (!selectedEducator) return

    const result = await updateEducatorAction(selectedEducator.id, data)

    if (result.success) {
      toast.success('Educador actualizado correctamente')
      setIsEducatorDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <AdminCourses
        courses={courses}
        tags={tags}
        onEducatorClick={handleEducatorClick}
      />

      <EducatorDetailDialog
        educator={selectedEducator}
        mode={dialogMode}
        isOpen={isEducatorDialogOpen}
        onClose={() => setIsEducatorDialogOpen(false)}
        onEdit={() => setDialogMode('edit')}
        onSave={handleSaveEducator}
      />
    </>
  )
}
