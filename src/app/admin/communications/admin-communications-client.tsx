'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AdminCommunications } from '@/components/admin/admin-communications'
import { CampaignDetailDialog } from '@/components/admin/campaign-detail-dialog'
import { getAdminCampaignDetailAction } from './actions'
import type { CampaignWithRelations } from '@/components/admin/communication-row'

interface AdminCommunicationsStats {
  totalCampaigns: number
  campaignsThisMonth: number
  deliveryRate: number
  openRate: number
}

interface EducatorOption {
  id: string
  name: string
  _count: {
    emailCampaigns: number
  }
}

interface AdminCommunicationsClientProps {
  campaigns: CampaignWithRelations[]
  stats: AdminCommunicationsStats
  educators: EducatorOption[]
}

export function AdminCommunicationsClient({
  campaigns,
  stats,
  educators,
}: AdminCommunicationsClientProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [campaignDetail, setCampaignDetail] = useState<
    NonNullable<Extract<Awaited<ReturnType<typeof getAdminCampaignDetailAction>>, { success: true }>['data']> | null
  >(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  const handleViewDetails = async (campaignId: string) => {
    setIsDetailOpen(true)
    setIsLoadingDetail(true)

    const result = await getAdminCampaignDetailAction(campaignId)

    if (result.success) {
      setCampaignDetail(result.data ?? null)
    } else {
      toast.error(result.error)
    }

    setIsLoadingDetail(false)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setCampaignDetail(null)
  }

  return (
    <>
      <AdminCommunications
        campaigns={campaigns}
        stats={stats}
        educators={educators}
        onViewDetails={handleViewDetails}
      />

      <CampaignDetailDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseDetail()
        }}
        campaign={campaignDetail}
        isLoading={isLoadingDetail}
      />
    </>
  )
}
