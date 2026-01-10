import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getDashboardMetrics } from '@/services/admin-service'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminDashboardSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Dashboard - Admin',
}

async function DashboardContent() {
  const metrics = await getDashboardMetrics()

  return <AdminDashboard metrics={metrics} />
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
