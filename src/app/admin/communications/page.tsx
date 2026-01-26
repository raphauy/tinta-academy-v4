import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getAllCampaignsForAdmin,
  getAdminCampaignStats,
  getEducatorsWithCampaigns,
} from '@/services/email-campaign-service'
import { AdminCommunicationsClient } from './admin-communications-client'
import { AdminCommunicationsSkeleton } from '@/components/admin/admin-skeletons'

export const metadata: Metadata = {
  title: 'Comunicaciones - Admin',
}

async function CommunicationsContent() {
  const [campaigns, stats, educators] = await Promise.all([
    getAllCampaignsForAdmin(),
    getAdminCampaignStats(),
    getEducatorsWithCampaigns(),
  ])

  return (
    <AdminCommunicationsClient
      campaigns={campaigns}
      stats={stats}
      educators={educators}
    />
  )
}

export default function AdminCommunicationsPage() {
  return (
    <Suspense fallback={<AdminCommunicationsSkeleton />}>
      <CommunicationsContent />
    </Suspense>
  )
}
