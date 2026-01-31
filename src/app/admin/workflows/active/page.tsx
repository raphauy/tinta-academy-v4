import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getAllCourseWorkflowsForAdmin,
  getActiveWorkflowsAdminStats,
} from '@/services/workflow-execution-service'
import { getEducatorsWithWorkflows } from '@/services/workflow-template-service'
import { AdminActiveWorkflowsClient } from './admin-active-workflows-client'
import { AdminWorkflowsSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Workflows - Admin',
}

async function ActiveWorkflowsContent() {
  const [courseWorkflows, stats, educators] = await Promise.all([
    getAllCourseWorkflowsForAdmin(),
    getActiveWorkflowsAdminStats(),
    getEducatorsWithWorkflows(),
  ])

  return (
    <AdminActiveWorkflowsClient
      courseWorkflows={courseWorkflows}
      stats={stats}
      educators={educators}
    />
  )
}

export default function AdminActiveWorkflowsPage() {
  return (
    <Suspense fallback={<AdminWorkflowsSkeleton />}>
      <ActiveWorkflowsContent />
    </Suspense>
  )
}
