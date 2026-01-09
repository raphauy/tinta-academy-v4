import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentProfile } from '@/services/student-service'
import { StudentProfile } from '@/components/student/student-profile'

interface StudentProfilePageProps {
  searchParams: Promise<{ viewAs?: string }>
}

// Simple skeleton for loading state
function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      {/* Avatar section skeleton */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
        <div className="h-20 w-20 bg-muted rounded-full" />
        <div>
          <div className="h-5 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>

      {/* Form sections skeleton */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-muted/30 rounded-xl space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

async function ProfileContent({ viewAs }: { viewAs: string | undefined }) {
  const result = await resolveStudentForPage(viewAs)

  if (!result.authorized) {
    if (result.reason === 'no_student_selected') {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Selecciona un estudiante del selector de arriba para ver su perfil.
          </p>
        </div>
      )
    }
    redirect('/')
  }

  const { student } = result
  const profile = await getStudentProfile(student.id)

  if (!profile) {
    redirect('/student')
  }

  // Check if we're in view-as mode (superadmin viewing another student)
  const isViewMode = !!viewAs

  return <StudentProfile profile={profile} readOnly={isViewMode} />
}

export default async function StudentProfilePage({
  searchParams,
}: StudentProfilePageProps) {
  const params = await searchParams

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent viewAs={params.viewAs} />
    </Suspense>
  )
}
