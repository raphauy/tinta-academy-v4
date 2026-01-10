import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getAllStudentsWithStats, getStudentStats } from '@/services/student-service'
import { AdminStudentsClient } from './admin-students-client'
import { AdminStudentsSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Estudiantes - Admin',
}

async function StudentsContent() {
  const [students, stats] = await Promise.all([
    getAllStudentsWithStats(),
    getStudentStats(),
  ])

  return <AdminStudentsClient students={students} stats={stats} />
}

export default function AdminStudentsPage() {
  return (
    <Suspense fallback={<AdminStudentsSkeleton />}>
      <StudentsContent />
    </Suspense>
  )
}
