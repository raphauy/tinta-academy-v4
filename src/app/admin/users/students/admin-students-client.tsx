'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { StudentWithStats, StudentStats } from '@/services/student-service'
import { AdminStudents } from '@/components/admin/admin-students'
import { StudentDetailDialog } from '@/components/admin/student-detail-dialog'
import { updateStudentAction } from './actions'

interface AdminStudentsClientProps {
  students: StudentWithStats[]
  stats: StudentStats
}

export function AdminStudentsClient({ students, stats }: AdminStudentsClientProps) {
  const router = useRouter()
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null)
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleView = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      setSelectedStudent(student)
      setDialogMode('view')
      setIsDialogOpen(true)
    }
  }

  const handleEdit = (studentId: string) => {
    const student = students.find((s) => s.id === studentId)
    if (student) {
      setSelectedStudent(student)
      setDialogMode('edit')
      setIsDialogOpen(true)
    }
  }

  const handleSave = async (data: Parameters<typeof updateStudentAction>[1]) => {
    if (!selectedStudent) return

    const result = await updateStudentAction(selectedStudent.id, data)

    if (result.success) {
      toast.success('Estudiante actualizado correctamente')
      setIsDialogOpen(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <AdminStudents
        students={students}
        stats={stats}
        onView={handleView}
        onEdit={handleEdit}
      />

      <StudentDetailDialog
        student={selectedStudent}
        mode={dialogMode}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onEdit={() => setDialogMode('edit')}
        onSave={handleSave}
      />
    </>
  )
}
