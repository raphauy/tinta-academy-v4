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
} from 'lucide-react'

import { formatInTimezone } from '@/lib/timezone-utils'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCampaignById } from '@/services/email-campaign-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statusConfig = {
  draft: { label: 'Borrador', icon: Clock, variant: 'secondary' as const },
  scheduled: { label: 'Programado', icon: Clock, variant: 'outline' as const },
  sending: { label: 'Enviando', icon: Send, variant: 'default' as const },
  sent: { label: 'Enviado', icon: CheckCircle2, variant: 'default' as const },
  partially_sent: {
    label: 'Parcial',
    icon: XCircle,
    variant: 'destructive' as const,
  },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'secondary' as const },
}

const recipientStatusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  sending: { label: 'Enviando', variant: 'outline' as const },
  sent: { label: 'Enviado', variant: 'default' as const },
  delivered: { label: 'Entregado', variant: 'default' as const },
  opened: { label: 'Abierto', variant: 'default' as const },
  clicked: { label: 'Click', variant: 'default' as const },
  bounced: { label: 'Rebotado', variant: 'destructive' as const },
  failed: { label: 'Fallido', variant: 'destructive' as const },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/educator/communications">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
          </div>
          <div className="ml-10 flex items-center gap-3">
            <Badge variant={status.variant} className="gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
            {campaign.course && (
              <span className="text-sm text-muted-foreground">
                Curso: {campaign.course.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Destinatarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.totalRecipients}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enviados</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.sentCount}</div>
            <p className="text-xs text-muted-foreground">
              {campaign.totalRecipients > 0
                ? `${Math.round((campaign.sentCount / campaign.totalRecipients) * 100)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fallidos</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.failedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fecha</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {campaign.sentAt
                ? formatInTimezone(
                    campaign.sentAt,
                    campaign.timezone,
                    "d MMM yyyy, HH:mm"
                  )
                : campaign.scheduledAt
                  ? `Programado: ${formatInTimezone(
                      campaign.scheduledAt,
                      campaign.timezone,
                      "d MMM, HH:mm"
                    )}`
                  : 'Sin fecha'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Plantilla utilizada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="font-medium">Nombre:</dt>
              <dd className="text-muted-foreground">{campaign.template.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium">Asunto:</dt>
              <dd className="text-muted-foreground">{campaign.template.subject}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Recipients table */}
      <Card>
        <CardHeader>
          <CardTitle>Destinatarios ({campaign.recipients.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {campaign.recipients.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No hay destinatarios
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign.recipients.map((recipient) => {
                  const recipientStatus = recipientStatusConfig[recipient.status]
                  const studentName = [
                    recipient.student.firstName,
                    recipient.student.lastName,
                  ]
                    .filter(Boolean)
                    .join(' ') || recipient.email

                  return (
                    <TableRow key={recipient.id}>
                      <TableCell className="font-medium">{studentName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {recipient.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={recipientStatus.variant}>
                          {recipientStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {recipient.sentAt
                          ? new Date(recipient.sentAt).toLocaleTimeString('es', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-destructive">
                        {recipient.errorMessage || '-'}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
