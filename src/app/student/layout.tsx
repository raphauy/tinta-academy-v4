import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { ViewAsProvider } from '@/components/student/view-as-context'
import { AppShellWithBannerClient } from '@/components/student/app-shell-with-banner'
import { getAllStudents } from '@/services/student-service'
import { getEducatorStudents } from '@/services/enrollment-service'
import { getEducatorByUserId } from '@/services/educator-service'
import type { StudentForSelection } from '@/services/student-service'

interface StudentLayoutProps {
  children: React.ReactNode
}

export default async function StudentLayout({ children }: StudentLayoutProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { role } = session.user

  // Allow student, superadmin, and educator
  if (role !== 'student' && role !== 'superadmin' && role !== 'educator') {
    redirect('/')
  }

  // Determine if we should show the view-as banner
  const canViewOthers = role === 'superadmin' || role === 'educator'

  let availableStudents: StudentForSelection[] = []

  if (canViewOthers) {
    // Fetch available students based on role
    if (role === 'superadmin') {
      availableStudents = await getAllStudents()
    } else if (role === 'educator') {
      const educator = await getEducatorByUserId(session.user.id)
      if (educator) {
        const students = await getEducatorStudents(educator.id)
        availableStudents = students.map((s) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          user: {
            id: s.user.email, // Use email as pseudo-id
            email: s.user.email,
            name: s.user.name,
          },
        }))
      }
    }
  }

  const showBanner = canViewOthers && availableStudents.length > 0

  return (
    <Suspense fallback={null}>
      <ViewAsProvider>
        <AppShellWithBannerClient
          user={{
            name: session.user.name,
            email: session.user.email ?? undefined,
            image: session.user.image,
            role: session.user.role,
          }}
          showBanner={showBanner}
          availableStudents={availableStudents}
        >
          {children}
        </AppShellWithBannerClient>
      </ViewAsProvider>
    </Suspense>
  )
}
