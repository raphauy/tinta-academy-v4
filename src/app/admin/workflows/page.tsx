import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getAllWorkflowsForAdmin,
  getAdminWorkflowStats,
  getEducatorsWithWorkflows,
} from '@/services/workflow-template-service'
import { AdminWorkflowsClient } from './admin-workflows-client'
import { AdminWorkflowsSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'WF Templates - Admin',
}

async function WorkflowsContent() {
  const [workflows, stats, educators] = await Promise.all([
    getAllWorkflowsForAdmin(),
    getAdminWorkflowStats(),
    getEducatorsWithWorkflows(),
  ])

  return (
    <AdminWorkflowsClient
      workflows={workflows}
      stats={stats}
      educators={educators}
    />
  )
}

export default function AdminWorkflowsPage() {
  return (
    <Suspense fallback={<AdminWorkflowsSkeleton />}>
      <WorkflowsContent />
    </Suspense>
  )
}
