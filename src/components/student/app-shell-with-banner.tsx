'use client'

import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/shell'
import { ViewAsBanner } from './view-as-banner'
import { IncompleteProfileBanner } from './incomplete-profile-banner'
import type { StudentForSelection } from '@/services/student-service'

interface AppShellWithBannerClientProps {
  children: React.ReactNode
  user: {
    name: string | null | undefined
    email: string | undefined
    image: string | null | undefined
    role: string | undefined
  }
  showBanner: boolean
  availableStudents: StudentForSelection[]
  /** Campos del perfil que el alumno todavia no cargo (vacio si esta completo). */
  missingProfileFields: string[]
}

export function AppShellWithBannerClient({
  children,
  user,
  showBanner,
  availableStudents,
  missingProfileFields,
}: AppShellWithBannerClientProps) {
  const searchParams = useSearchParams()
  const viewAsStudentId = searchParams.get('viewAs')

  // Find current student from available students (only if viewAs is set)
  const currentStudent = viewAsStudentId
    ? availableStudents.find((s) => s.id === viewAsStudentId)
    : null

  const currentStudentForBanner = currentStudent
    ? {
        id: currentStudent.id,
        firstName: currentStudent.firstName,
        lastName: currentStudent.lastName,
        email: currentStudent.user.email,
      }
    : null

  return (
    <AppShell
      variant="student"
      user={user}
      viewAsStudentId={viewAsStudentId ?? undefined}
    >
      {showBanner && (
        <ViewAsBanner
          currentStudent={currentStudentForBanner}
          availableStudents={availableStudents}
          isViewingAs={!!viewAsStudentId}
        />
      )}
      {missingProfileFields.length > 0 && (
        <IncompleteProfileBanner missingFields={missingProfileFields} />
      )}
      {children}
    </AppShell>
  )
}
