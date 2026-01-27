'use client'

import { useState, useTransition, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Calendar,
  BookOpen,
} from 'lucide-react'
import { formatTriggerDescription } from '@/lib/constants/workflow'
import { getWorkflowExecutionsAction } from '@/app/admin/workflows/actions'
import type { AdminExecutionWithDetails } from '@/services/workflow-execution-service'

interface AdminWorkflowExecutionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowId: string
  workflowName: string
}

export function AdminWorkflowExecutionsDialog({
  open,
  onOpenChange,
  workflowId,
  workflowName,
}: AdminWorkflowExecutionsDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg px-6">
        <SheetHeader>
          <SheetTitle>{workflowName}</SheetTitle>
          <SheetDescription>
            Detalle global de ejecuciones del workflow
          </SheetDescription>
        </SheetHeader>

        {open && (
          <AdminWorkflowExecutionsContent
            key={workflowId}
            workflowId={workflowId}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

interface AdminWorkflowExecutionsContentProps {
  workflowId: string
}

function AdminWorkflowExecutionsContent({
  workflowId,
}: AdminWorkflowExecutionsContentProps) {
  const [isPending, startTransition] = useTransition()
  const [data, setData] = useState<{
    pending: AdminExecutionWithDetails[]
    history: AdminExecutionWithDetails[]
    stats: { pending: number; sent: number; failed: number }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    startTransition(async () => {
      const result = await getWorkflowExecutionsAction(workflowId)
      if (result.success && result.data) {
        setData(result.data)
      } else if (!result.success) {
        setError(result.error)
      }
    })
  }, [workflowId])

  const formatStudentName = (student: {
    firstName: string | null
    lastName: string | null
  }) => {
    const name = [student.firstName, student.lastName].filter(Boolean).join(' ')
    return name || 'Sin nombre'
  }

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "d 'de' MMMM, HH:mm", { locale: es })
  }

  return (
    <div className="mt-6">
      {/* Stats Summary */}
      {isPending ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-amber-500 mb-1" />
            <span className="text-2xl font-bold">{data.stats.pending}</span>
            <span className="text-xs text-muted-foreground">Pendientes</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-2xl font-bold">{data.stats.sent}</span>
            <span className="text-xs text-muted-foreground">Enviados</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <XCircle className="h-5 w-5 text-destructive mb-1" />
            <span className="text-2xl font-bold">{data.stats.failed}</span>
            <span className="text-xs text-muted-foreground">Fallidos</span>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pending" className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Programados
            {data && data.stats.pending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {data.stats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Mail className="h-4 w-4" />
            Historial
            {data && data.stats.sent + data.stats.failed > 0 && (
              <Badge variant="secondary" className="ml-1">
                {data.stats.sent + data.stats.failed}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            {isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : data?.pending && data.pending.length > 0 ? (
              <div className="space-y-3">
                {data.pending.map((execution) => (
                  <AdminExecutionCard
                    key={execution.id}
                    execution={execution}
                    type="pending"
                    formatStudentName={formatStudentName}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={Clock} message="No hay emails programados" />
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <ScrollArea className="h-[400px] pr-4">
            {isPending ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : data?.history && data.history.length > 0 ? (
              <div className="space-y-3">
                {data.history.map((execution) => (
                  <AdminExecutionCard
                    key={execution.id}
                    execution={execution}
                    type="history"
                    formatStudentName={formatStudentName}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={Mail} message="No hay emails enviados" />
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AdminExecutionCardProps {
  execution: AdminExecutionWithDetails
  type: 'pending' | 'history'
  formatStudentName: (student: {
    firstName: string | null
    lastName: string | null
  }) => string
  formatDate: (date: Date | string) => string
}

function AdminExecutionCard({
  execution,
  type,
  formatStudentName,
  formatDate,
}: AdminExecutionCardProps) {
  const { workflowStep, student, courseWorkflow } = execution

  return (
    <div className="p-3 rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">
            {workflowStep.template.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {formatTriggerDescription(
              workflowStep.triggerType,
              workflowStep.triggerOffset,
              workflowStep.triggerClassIndex
            )}
          </p>
        </div>
        {type === 'history' && (
          <Badge
            variant={
              ['sent', 'delivered', 'opened', 'clicked'].includes(
                execution.status
              )
                ? 'default'
                : 'destructive'
            }
            className="shrink-0"
          >
            {['sent', 'delivered', 'opened', 'clicked'].includes(
              execution.status
            )
              ? 'Enviado'
              : 'Fallido'}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" />
          {formatStudentName(student)}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {courseWorkflow.course.title}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {type === 'pending'
            ? formatDate(execution.scheduledAt)
            : execution.sentAt
              ? formatDate(execution.sentAt)
              : formatDate(execution.scheduledAt)}
        </span>
      </div>

      {execution.status === 'failed' && execution.errorMessage && (
        <p className="mt-2 text-xs text-destructive">
          Error: {execution.errorMessage}
        </p>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  message: string
}

function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <Icon className="h-12 w-12 mb-4 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
