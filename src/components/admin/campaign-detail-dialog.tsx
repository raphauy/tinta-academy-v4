'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mail,
  User,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Users,
  Eye,
  MousePointer,
  Loader2,
} from 'lucide-react'
import type { EmailCampaignStatus, EmailDeliveryStatus } from '@prisma/client'

type CampaignDetail = {
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
  timezone: string
  template: {
    id: string
    name: string
    subject: string
    body: string
  }
  course: {
    id: string
    title: string
  } | null
  educator: {
    id: string
    name: string
  }
  recipients: Array<{
    id: string
    email: string
    status: EmailDeliveryStatus
    sentAt: Date | null
    deliveredAt: Date | null
    openedAt: Date | null
    clickedAt: Date | null
    errorMessage: string | null
    student: {
      id: string
      firstName: string | null
      lastName: string | null
      user: {
        email: string
      }
    } | null
    user: {
      name: string | null
    } | null
  }>
}

interface CampaignDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: CampaignDetail | null
  isLoading?: boolean
}

const statusConfig: Record<
  EmailCampaignStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  draft: {
    label: 'Borrador',
    icon: Clock,
    className:
      'bg-stone-50 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  },
  scheduled: {
    label: 'Programado',
    icon: Clock,
    className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
  sending: {
    label: 'Enviando',
    icon: Send,
    className:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  },
  sent: {
    label: 'Enviado',
    icon: CheckCircle,
    className:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  partially_sent: {
    label: 'Parcialmente Enviado',
    icon: AlertCircle,
    className:
      'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className:
      'bg-stone-50 text-stone-500 dark:bg-stone-800 dark:text-stone-500',
  },
}

const recipientStatusConfig: Record<
  EmailDeliveryStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pendiente',
    className: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  },
  sending: {
    label: 'Enviando',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  },
  sent: {
    label: 'Enviado',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
  delivered: {
    label: 'Entregado',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  opened: {
    label: 'Abierto',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  },
  clicked: {
    label: 'Clic',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400',
  },
  bounced: {
    label: 'Rebotado',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  },
  failed: {
    label: 'Fallido',
    className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  },
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('es-UY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculateRate(total: number, value: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

export function CampaignDetailDialog({
  open,
  onOpenChange,
  campaign,
  isLoading,
}: CampaignDetailDialogProps) {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Cargando detalles de campaña</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            <p className="mt-4 text-sm text-stone-500">Cargando detalles...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!campaign) return null

  const status = statusConfig[campaign.status] || statusConfig.draft
  const StatusIcon = status.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                campaign.status === 'sent'
                  ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                  : campaign.status === 'sending'
                    ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
              }`}
            >
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>{campaign.name}</DialogTitle>
              <DialogDescription>
                Creada el {formatDate(campaign.createdAt)}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full max-h-[60vh]">
            <div className="space-y-6 pr-4">
              <div className="flex items-center justify-between py-3 px-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${status.className}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
                <span className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {campaign.totalRecipients} destinatarios
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Send className="w-4 h-4 text-stone-400" />
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {campaign.sentCount}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">Enviados</p>
                </div>
                <div className="text-center p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {calculateRate(campaign.sentCount, campaign.deliveredCount)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">Entregados</p>
                </div>
                <div className="text-center p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {calculateRate(campaign.deliveredCount, campaign.openedCount)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">Aperturas</p>
                </div>
                <div className="text-center p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MousePointer className="w-4 h-4 text-indigo-500" />
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {calculateRate(campaign.openedCount, campaign.clickedCount)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">Clics</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Educador
                    </p>
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {campaign.educator.name}
                    </p>
                  </div>
                </div>

                {campaign.course && (
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-stone-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Curso
                      </p>
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {campaign.course.title}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-stone-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Plantilla / Asunto
                    </p>
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      {campaign.template.name}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {campaign.template.subject}
                    </p>
                  </div>
                </div>

                {campaign.sentAt && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Enviado
                      </p>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatDate(campaign.sentAt)}
                      </p>
                    </div>
                  </div>
                )}

                {campaign.scheduledAt && campaign.status === 'scheduled' && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Programado para
                      </p>
                      <p className="font-medium text-blue-600 dark:text-blue-400">
                        {formatDate(campaign.scheduledAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {campaign.recipients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-stone-400" />
                    <h4 className="font-medium text-stone-900 dark:text-stone-100">
                      Destinatarios ({campaign.recipients.length})
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {campaign.recipients.slice(0, 20).map((recipient) => {
                      const recipientStatus =
                        recipientStatusConfig[recipient.status] ||
                        recipientStatusConfig.pending
                      const displayName = [
                        recipient.student?.firstName,
                        recipient.student?.lastName,
                      ]
                        .filter(Boolean)
                        .join(' ') || recipient.user?.name || recipient.email

                      return (
                        <div
                          key={recipient.id}
                          className="flex items-center justify-between py-2 px-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                              {displayName}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                              {recipient.email}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${recipientStatus.className}`}
                          >
                            {recipientStatus.label}
                          </span>
                        </div>
                      )
                    })}
                    {campaign.recipients.length > 20 && (
                      <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-2">
                        ... y {campaign.recipients.length - 20} más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
