import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Send, Clock, CheckCircle2, XCircle, Mail } from 'lucide-react'
import type { EmailCampaignStatus } from '@prisma/client'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCampaignsWithStats } from '@/services/email-campaign-service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const statusConfig: Record<
  EmailCampaignStatus,
  { label: string; icon: typeof Clock; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  draft: { label: 'Borrador', icon: Clock, variant: 'secondary' },
  scheduled: { label: 'Programado', icon: Clock, variant: 'outline' },
  sending: { label: 'Enviando', icon: Send, variant: 'default' },
  sent: { label: 'Enviado', icon: CheckCircle2, variant: 'default' },
  partially_sent: { label: 'Parcial', icon: XCircle, variant: 'destructive' },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'secondary' },
}

export default async function CommunicationsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/login')
  }

  // Get all campaigns and take only the first 10
  const allCampaigns = await getCampaignsWithStats(educator.id)
  const campaigns = allCampaigns.slice(0, 10)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Comunicaciones</h1>
          <p className="text-muted-foreground">
            Gestiona tus campañas de email
          </p>
        </div>
        <Button asChild>
          <Link href="/educator/communications/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva campaña
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Últimas 10 campañas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Send className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No hay campañas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Comienza creando tu primer envío de email
              </p>
              <Button asChild className="mt-4">
                <Link href="/educator/communications/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear campaña
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Plantilla</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Destinatarios</TableHead>
                  <TableHead className="text-right">Entregados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const status = statusConfig[campaign.status]
                  const StatusIcon = status.icon
                  const deliveryRate =
                    campaign.sentCount > 0
                      ? Math.round((campaign.deliveredCount / campaign.sentCount) * 100)
                      : 0

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Link
                          href={`/educator/communications/${campaign.id}`}
                          className="font-medium hover:underline"
                        >
                          {campaign.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.template?.name || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.course?.title || 'Sin curso'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.sentAt
                          ? new Date(campaign.sentAt).toLocaleDateString('es', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : campaign.scheduledAt
                            ? new Date(campaign.scheduledAt).toLocaleDateString('es', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : new Date(campaign.createdAt).toLocaleDateString('es', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.totalRecipients}
                      </TableCell>
                      <TableCell className="text-right">
                        {campaign.deliveredCount > 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            {campaign.deliveredCount} ({deliveryRate}%)
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/educator/communications/history">
            Ver historial completo
          </Link>
        </Button>
      </div>
    </div>
  )
}
