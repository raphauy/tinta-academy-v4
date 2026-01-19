import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Users,
  Calendar,
  FileText,
  BookOpen,
  Globe,
} from 'lucide-react'
import type { EmailCampaignStatus } from '@prisma/client'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCampaignById } from '@/services/email-campaign-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CampaignStatsCard } from '@/components/educator/communications/campaign-stats-card'
import { CampaignRecipientsTable } from '@/components/educator/communications/campaign-recipients-table'
import { LocalDateTime } from '@/components/shared/local-date-time'
import { CancelCampaignButton } from './cancel-campaign-button'

const statusConfig: Record<
  EmailCampaignStatus,
  {
    label: string
    icon: typeof Clock
    variant: 'default' | 'secondary' | 'outline' | 'destructive'
    description: string
  }
> = {
  draft: {
    label: 'Borrador',
    icon: FileText,
    variant: 'secondary',
    description: 'La campaña aún no ha sido enviada',
  },
  scheduled: {
    label: 'Programado',
    icon: Clock,
    variant: 'outline',
    description: 'La campaña está programada para enviarse',
  },
  sending: {
    label: 'Enviando',
    icon: Send,
    variant: 'default',
    description: 'La campaña se está enviando en este momento',
  },
  sent: {
    label: 'Enviado',
    icon: CheckCircle2,
    variant: 'default',
    description: 'La campaña fue enviada exitosamente',
  },
  partially_sent: {
    label: 'Envío parcial',
    icon: XCircle,
    variant: 'destructive',
    description: 'Algunos emails no pudieron ser enviados',
  },
  cancelled: {
    label: 'Cancelado',
    icon: XCircle,
    variant: 'secondary',
    description: 'La campaña fue cancelada antes de enviarse',
  },
}

interface PageProps {
  params: Promise<{ campaignId: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/login')
  }

  const campaign = await getCampaignById(campaignId, educator.id)

  if (!campaign) {
    notFound()
  }

  const status = statusConfig[campaign.status]
  const StatusIcon = status.icon

  // Determine the primary date to display
  const primaryDate = campaign.sentAt || campaign.scheduledAt || campaign.createdAt
  const dateLabel = campaign.sentAt
    ? 'Enviado el'
    : campaign.scheduledAt
      ? 'Programado para'
      : 'Creado el'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="-ml-2" asChild>
            <Link href="/educator/communications/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al historial
            </Link>
          </Button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="mt-1 text-muted-foreground">{status.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status.variant} className="gap-1.5 px-2.5 py-1">
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </Badge>

            {campaign.course && (
              <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                <BookOpen className="h-3.5 w-3.5" />
                {campaign.course.title}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {campaign.status === 'scheduled' && (
          <CancelCampaignButton
            campaignId={campaign.id}
            campaignName={campaign.name}
          />
        )}
      </div>

      {/* Campaign Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Información del envío
          </CardTitle>
          <CardDescription>
            Detalles de la plantilla y programación de la campaña
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Row 1: Asunto, Enviado el */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Asunto</p>
              <p className="font-medium">{campaign.template.subject}</p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {dateLabel}
              </p>
              <p className="font-medium">
                <LocalDateTime
                  date={primaryDate}
                  formatStr="EEEE d 'de' MMMM 'de' yyyy, HH:mm"
                />
              </p>
            </div>
          </div>

          {/* Row 2: Curso, Plantilla */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Curso</p>
              <p className={campaign.course ? 'font-medium' : 'text-muted-foreground'}>
                {campaign.course?.title || 'Sin curso específico'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Plantilla</p>
              <p className="font-medium">{campaign.template.name}</p>
            </div>
          </div>

          {/* Timezone (only for scheduled campaigns) */}
          {campaign.status === 'scheduled' && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                Zona horaria
              </p>
              <p className="font-medium">{campaign.timezone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Card */}
      <CampaignStatsCard
        totalRecipients={campaign.totalRecipients}
        sentCount={campaign.sentCount}
        deliveredCount={campaign.deliveredCount}
        openedCount={campaign.openedCount}
        clickedCount={campaign.clickedCount}
        failedCount={campaign.failedCount}
      />

      {/* Recipients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Destinatarios
            <Badge variant="secondary" className="ml-1">
              {campaign.recipients.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Estado de entrega individual para cada destinatario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignRecipientsTable recipients={campaign.recipients} />
        </CardContent>
      </Card>
    </div>
  )
}
