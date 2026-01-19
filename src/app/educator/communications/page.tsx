import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Send, Clock, CheckCircle2, XCircle } from 'lucide-react'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getRecentCampaigns } from '@/services/email-campaign-service'
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

const statusConfig = {
  draft: { label: 'Borrador', icon: Clock, variant: 'secondary' as const },
  scheduled: { label: 'Programado', icon: Clock, variant: 'outline' as const },
  sending: { label: 'Enviando', icon: Send, variant: 'default' as const },
  sent: { label: 'Enviado', icon: CheckCircle2, variant: 'default' as const },
  partially_sent: { label: 'Parcial', icon: XCircle, variant: 'destructive' as const },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'secondary' as const },
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

  const campaigns = await getRecentCampaigns(educator.id, 10)

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
            Nuevo envío
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campañas recientes</CardTitle>
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
                  <TableHead>Estado</TableHead>
                  <TableHead>Destinatarios</TableHead>
                  <TableHead>Enviados</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const status = statusConfig[campaign.status]
                  const StatusIcon = status.icon

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
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.totalRecipients}</TableCell>
                      <TableCell>
                        {campaign.sentCount}/{campaign.totalRecipients}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.sentAt
                          ? new Date(campaign.sentAt).toLocaleDateString('es')
                          : campaign.scheduledAt
                            ? new Date(campaign.scheduledAt).toLocaleDateString('es')
                            : '-'}
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
