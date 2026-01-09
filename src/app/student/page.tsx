import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentDashboardMetrics } from '@/services/student-service'
import { StudentDashboard } from '@/components/student/student-dashboard'
import { StudentDashboardSkeleton } from '@/components/student/skeletons'

interface StudentDashboardPageProps {
  searchParams: Promise<{ viewAs?: string }>
}

async function DashboardContent({ viewAs }: { viewAs: string | undefined }) {
  const result = await resolveStudentForPage(viewAs)

  if (!result.authorized) {
    // If no student selected and user can view others, they need to select one
    if (result.reason === 'no_student_selected') {
      // The layout will show the selector banner
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecciona un estudiante del selector de arriba para ver su panel.
          </p>
        </div>
      )
    }
    redirect('/')
  }

  const { student } = result
  const metrics = await getStudentDashboardMetrics(student.id)

  const studentName = student.firstName
    ? `${student.firstName} ${student.lastName || ''}`.trim()
    : student.user?.name || 'Estudiante'

  return <StudentDashboard studentName={studentName} metrics={metrics} viewAs={viewAs} />
}

export default async function StudentDashboardPage({
  searchParams,
}: StudentDashboardPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<StudentDashboardSkeleton />}>
      <DashboardContent viewAs={params.viewAs} />
    </Suspense>
  )
}
