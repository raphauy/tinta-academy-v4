import {
  Users,
  Send,
  CheckCircle,
  Eye,
  MousePointerClick,
  XCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CampaignStatsCardProps {
  totalRecipients: number
  sentCount: number
  deliveredCount: number
  openedCount: number
  clickedCount: number
  failedCount: number
}

function formatPercentage(count: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((count / total) * 100)}%`
}

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: number
  percentage?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

function StatItem({ icon, label, value, percentage, variant = 'default' }: StatItemProps) {
  const variantStyles = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    destructive: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`${variantStyles[variant]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">
          {value}
          {percentage && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              ({percentage})
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

export function CampaignStatsCard({
  totalRecipients,
  sentCount,
  deliveredCount,
  openedCount,
  clickedCount,
  failedCount,
}: CampaignStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estadísticas de envío</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatItem
            icon={<Users className="h-5 w-5" />}
            label="Destinatarios"
            value={totalRecipients}
          />
          <StatItem
            icon={<Send className="h-5 w-5" />}
            label="Enviados"
            value={sentCount}
            percentage={formatPercentage(sentCount, totalRecipients)}
          />
          <StatItem
            icon={<CheckCircle className="h-5 w-5" />}
            label="Entregados"
            value={deliveredCount}
            percentage={formatPercentage(deliveredCount, sentCount)}
            variant="success"
          />
          <StatItem
            icon={<Eye className="h-5 w-5" />}
            label="Abiertos"
            value={openedCount}
            percentage={formatPercentage(openedCount, deliveredCount)}
            variant="success"
          />
          <StatItem
            icon={<MousePointerClick className="h-5 w-5" />}
            label="Clicks"
            value={clickedCount}
            percentage={formatPercentage(clickedCount, openedCount)}
            variant="success"
          />
          <StatItem
            icon={<XCircle className="h-5 w-5" />}
            label="Fallidos"
            value={failedCount}
            percentage={formatPercentage(failedCount, totalRecipients)}
            variant="destructive"
          />
        </div>
      </CardContent>
    </Card>
  )
}
