import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Send, Clock, CheckCircle2, XCircle, Plus, History } from 'lucide-react'
import type { EmailCampaignStatus } from '@prisma/client'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCampaignsWithStats } from '@/services/email-campaign-service'
import { getEducatorCourses } from '@/services/course-service'
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
import { CampaignHistoryFilters } from './campaign-history-filters'

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

interface PageProps {
  searchParams: Promise<{
    courseId?: string
    status?: string
  }>
}

export default async function CampaignHistoryPage({ searchParams }: PageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/login')
  }

  const params = await searchParams

  // Parse filters from searchParams
  const filters: {
    courseId?: string
    status?: EmailCampaignStatus
  } = {}

  if (params.courseId && params.courseId !== 'all') {
    filters.courseId = params.courseId
  }

  if (params.status && params.status !== 'all') {
    filters.status = params.status as EmailCampaignStatus
  }

  // Fetch data
  const [campaigns, courses] = await Promise.all([
    getCampaignsWithStats(educator.id, filters),
    getEducatorCourses(educator.id),
  ])

  // Prepare courses for filter dropdown
  const courseOptions = courses.map((c) => ({
    id: c.id,
    title: c.title,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Historial de Campañas</h1>
          <p className="text-muted-foreground">
            Todas tus campañas de email enviadas
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
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Campañas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <CampaignHistoryFilters
            courses={courseOptions}
            currentCourseId={params.courseId}
            currentStatus={params.status}
          />

          {/* Table */}
          {campaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Send className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No hay campañas</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filters.courseId || filters.status
                  ? 'No se encontraron campañas con los filtros seleccionados'
                  : 'Comienza creando tu primer envío de email'}
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
    </div>
  )
}
