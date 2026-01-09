import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentDashboardMetrics } from '@/services/student-service'
import { StudentDashboard } from '@/components/student/student-dashboard'

interface StudentDashboardPageProps {
  searchParams: Promise<{ viewAs?: string }>
}

// Simple skeleton for loading state
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-7 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded" />
      </div>

      {/* Metrics skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>

      {/* Courses skeleton */}
      <div>
        <div className="h-5 w-40 bg-muted rounded mb-3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
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

  return <StudentDashboard studentName={studentName} metrics={metrics} />
}

export default async function StudentDashboardPage({
  searchParams,
}: StudentDashboardPageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent viewAs={params.viewAs} />
    </Suspense>
  )
}
