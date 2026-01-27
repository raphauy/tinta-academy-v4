'use client'

import {
  Mail,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Calendar,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EmailCampaignStatus } from '@prisma/client'

export type CampaignWithRelations = {
  id: string
  name: string
  status: EmailCampaignStatus
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  failedCount: number
  scheduledAt: Date | null
  sentAt: Date | null
  createdAt: Date
  template: {
    id: string
    name: string
    subject: string
  }
  course: {
    id: string
    title: string
  } | null
  educator: {
    id: string
    name: string
  }
}

interface CommunicationRowProps {
  campaign: CampaignWithRelations
  onViewDetails?: () => void
}

const statusConfig: Record<
  EmailCampaignStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  draft: {
    label: 'Borrador',
    icon: Clock,
    className:
      'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700',
  },
  scheduled: {
    label: 'Programado',
    icon: Clock,
    className:
      'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-900',
  },
  sending: {
    label: 'Enviando',
    icon: Send,
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-900',
  },
  sent: {
    label: 'Enviado',
    icon: CheckCircle,
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
  },
  partially_sent: {
    label: 'Parcial',
    icon: AlertCircle,
    className:
      'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border-orange-200 dark:border-orange-900',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className:
      'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500 border-stone-200 dark:border-stone-700',
  },
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('es-UY', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculateDeliveryRate(sent: number, delivered: number): string {
  if (sent === 0) return '0%'
  return `${Math.round((delivered / sent) * 100)}%`
}

function calculateOpenRate(delivered: number, opened: number): string {
  if (delivered === 0) return '0%'
  return `${Math.round((opened / delivered) * 100)}%`
}

export function CommunicationRow({
  campaign,
  onViewDetails,
}: CommunicationRowProps) {
  const status = statusConfig[campaign.status] || statusConfig.draft
  const StatusIcon = status.icon
  const deliveryRate = calculateDeliveryRate(campaign.sentCount, campaign.deliveredCount)
  const openRate = calculateOpenRate(campaign.deliveredCount, campaign.openedCount)

  return (
    <div className="group px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
      {/* Mobile Layout */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                campaign.status === 'sent'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : campaign.status === 'sending'
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <Button
                variant="link"
                onClick={onViewDetails}
                className="h-auto p-0 font-semibold text-sm text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] text-left truncate max-w-[200px]"
              >
                {campaign.name}
              </Button>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <User className="w-3 h-3" />
                {campaign.educator.name}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border flex-shrink-0 ${status.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400 truncate">
          {campaign.course?.title || 'Sin curso específico'}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
            <span>{campaign.totalRecipients} dest.</span>
            <span>Entrega: {deliveryRate}</span>
            <span>Apertura: {openRate}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onViewDetails}
            className="h-8 w-8 text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-[#143F3B]/10 dark:hover:bg-[#143F3B]/20"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
          <Calendar className="w-3 h-3" />
          {formatDateTime(campaign.createdAt)}
          {campaign.sentAt && (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">
              Enviado: {formatDateTime(campaign.sentAt)}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
        <div className="col-span-3 min-w-0">
          <Button
            variant="link"
            onClick={onViewDetails}
            className="h-auto p-0 font-semibold text-sm text-stone-900 dark:text-stone-100 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] text-left truncate block max-w-full"
          >
            {campaign.name}
          </Button>
          <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
            {campaign.template.subject}
          </p>
        </div>

        <div className="col-span-2">
          <p className="font-medium text-sm text-stone-700 dark:text-stone-300 truncate flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-stone-400" />
            {campaign.educator.name}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
            {campaign.course?.title || 'Sin curso'}
          </p>
        </div>

        <div className="col-span-1 text-center">
          <p className="font-semibold text-sm text-stone-900 dark:text-stone-100">
            {campaign.totalRecipients}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">dest.</p>
        </div>

        <div className="col-span-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <div>
              <p className="font-medium text-sm text-stone-700 dark:text-stone-300">
                {deliveryRate}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">entrega</p>
            </div>
            <div>
              <p className="font-medium text-sm text-stone-700 dark:text-stone-300">
                {openRate}
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">apertura</p>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${status.className}`}
          >
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            {campaign.sentAt
              ? formatDate(campaign.sentAt)
              : campaign.scheduledAt
                ? `Prog: ${formatDateTime(campaign.scheduledAt)}`
                : formatDate(campaign.createdAt)}
          </p>
        </div>

        <div className="col-span-2 flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Ver detalles
          </Button>
        </div>
      </div>
    </div>
  )
}
