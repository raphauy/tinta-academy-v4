'use client'

import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/shell'
import { ViewAsBanner } from './view-as-banner'
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
}

export function AppShellWithBannerClient({
  children,
  user,
  showBanner,
  availableStudents,
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
      {children}
    </AppShell>
  )
}
