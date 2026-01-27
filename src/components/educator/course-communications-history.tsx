'use client'

import { useMemo } from 'react'
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Workflow,
  Eye,
  Calendar,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { CommunicationHistoryItem } from '@/services/email-campaign-service'

interface CourseCommunicationsHistoryProps {
  history: CommunicationHistoryItem[]
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  draft: {
    label: 'Borrador',
    icon: Clock,
    className:
      'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
  },
  scheduled: {
    label: 'Programado',
    icon: Clock,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  },
  sending: {
    label: 'Enviando',
    icon: Send,
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  },
  sent: {
    label: 'Enviado',
    icon: CheckCircle,
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  partially_sent: {
    label: 'Parcial',
    icon: AlertCircle,
    className:
      'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    className:
      'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500',
  },
  pending: {
    label: 'Pendiente',
    icon: Clock,
    className:
      'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400',
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

function calculateRate(total: number, value: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

interface MetricCardProps {
  icon: React.ReactNode
  value: number | string
  label: string
  iconBgClass?: string
}

function MetricCard({ icon, value, label, iconBgClass = 'bg-muted' }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`p-3 rounded-xl ${iconBgClass} shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg md:text-xl font-bold text-foreground break-words leading-tight">{value}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseCommunicationsHistory({
  history,
}: CourseCommunicationsHistoryProps) {
  // Calculate metrics
  const metrics = useMemo(() => {
    const campaigns = history.filter((h) => h.type === 'campaign')
    const workflows = history.filter((h) => h.type === 'workflow')

    const totalSent = history.reduce((sum, h) => sum + h.sentCount, 0)
    const totalDelivered = history.reduce((sum, h) => sum + h.deliveredCount, 0)
    const totalOpened = history.reduce((sum, h) => sum + h.openedCount, 0)

    return {
      totalCampaigns: campaigns.length,
      totalWorkflows: workflows.length,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      openRate: totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0,
    }
  }, [history])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<Mail className="w-5 h-5 text-primary" />}
          value={metrics.totalCampaigns}
          label="Campañas"
          iconBgClass="bg-primary/10"
        />
        <MetricCard
          icon={<Workflow className="w-5 h-5 text-purple-600" />}
          value={metrics.totalWorkflows}
          label="Workflows"
          iconBgClass="bg-purple-100 dark:bg-purple-950/50"
        />
        <MetricCard
          icon={<Send className="w-5 h-5 text-emerald-600" />}
          value={`${metrics.deliveryRate}%`}
          label="Tasa entrega"
          iconBgClass="bg-emerald-100 dark:bg-emerald-950/50"
        />
        <MetricCard
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          value={`${metrics.openRate}%`}
          label="Tasa apertura"
          iconBgClass="bg-blue-100 dark:bg-blue-950/50"
        />
      </div>

      {history.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Tipo
            </div>
            <div className="col-span-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Nombre
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Plantilla
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Métricas
            </div>
            <div className="col-span-1 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estado
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Fecha
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {history.map((item) => {
              const status = statusConfig[item.status] || statusConfig.pending
              const StatusIcon = status.icon

              return (
                <div
                  key={item.id}
                  className="px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                >
                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            item.type === 'campaign'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-purple-100 dark:bg-purple-950/50 text-purple-600'
                          }`}
                        >
                          {item.type === 'campaign' ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <Workflow className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {item.name}
                          </p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {item.templateName}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-3">
                        <span>{item.recipientCount} dest.</span>
                        <span>Entrega: {calculateRate(item.sentCount, item.deliveredCount)}</span>
                        <span>Apertura: {calculateRate(item.deliveredCount, item.openedCount)}</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.type === 'campaign'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-purple-100 dark:bg-purple-950/50 text-purple-600'
                        }`}
                      >
                        {item.type === 'campaign' ? (
                          <Mail className="w-4 h-4" />
                        ) : (
                          <Workflow className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div className="col-span-4 min-w-0">
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {item.type === 'campaign' ? 'Campaña' : 'Workflow'}
                      </p>
                    </div>

                    <div className="col-span-2 text-sm text-stone-600 dark:text-stone-400 truncate">
                      {item.templateName}
                    </div>

                    <div className="col-span-2 text-center">
                      <div className="flex items-center justify-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {calculateRate(item.sentCount, item.deliveredCount)}
                          </p>
                          <p className="text-stone-400">entrega</p>
                        </div>
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-100">
                            {calculateRate(item.deliveredCount, item.openedCount)}
                          </p>
                          <p className="text-stone-400">apertura</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${status.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="col-span-2 text-right text-sm text-stone-500 dark:text-stone-400">
                      {formatDateTime(item.date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin comunicaciones
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            No se han enviado campañas ni workflows para este curso.
          </p>
        </div>
      )}
    </div>
  )
}
