import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getAllEducatorsWithStats, getEducatorStats } from '@/services/educator-service'
import { AdminEducatorsClient } from './admin-educators-client'
import { AdminEducatorsSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Educadores - Admin',
}

async function EducatorsContent() {
  const [educators, stats] = await Promise.all([
    getAllEducatorsWithStats(),
    getEducatorStats(),
  ])

  return <AdminEducatorsClient educators={educators} stats={stats} />
}

export default function AdminEducatorsPage() {
  return (
    <Suspense fallback={<AdminEducatorsSkeleton />}>
      <EducatorsContent />
    </Suspense>
  )
}
