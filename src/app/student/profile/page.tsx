import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { resolveStudentForPage } from '@/lib/view-as'
import { getStudentProfile } from '@/services/student-service'
import { StudentProfile } from '@/components/student/student-profile'
import { StudentProfileSkeleton } from '@/components/student/skeletons'

interface StudentProfilePageProps {
  searchParams: Promise<{ viewAs?: string }>
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
    <Suspense fallback={<StudentProfileSkeleton />}>
      <ProfileContent viewAs={params.viewAs} />
    </Suspense>
  )
}
