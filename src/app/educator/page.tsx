import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId, getEducatorDashboardMetrics } from '@/services/educator-service'
import { EducatorDashboard } from '@/components/educator'

export default async function EducatorDashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    // User is logged in but doesn't have an educator profile
    // This shouldn't happen normally, but handle gracefully
    redirect('/')
  }

  const metrics = await getEducatorDashboardMetrics(educator.id)

  // Get educator display name from user relation or fallback to user session
  const educatorName = educator.user?.name || session.user.name || 'Educador'

  return (
    <EducatorDashboard
      educatorName={educatorName}
      metrics={metrics}
    />
  )
}
