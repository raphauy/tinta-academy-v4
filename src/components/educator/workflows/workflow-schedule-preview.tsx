'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  TRIGGER_TYPE_ICONS,
  TRIGGER_TYPE_LABELS,
} from '@/lib/constants/workflow'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { WorkflowTriggerType } from '@prisma/client'
import type { SchedulePreviewItem } from '@/services/workflow-execution-service'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface WorkflowSchedulePreviewProps {
  preview: SchedulePreviewItem[]
  className?: string
}

const TRIGGER_COLORS: Record<WorkflowTriggerType, string> = {
  course_start: 'bg-green-500',
  course_end: 'bg-blue-500',
  exam_date: 'bg-purple-500',
  class_date: 'bg-orange-500',
  registration_deadline: 'bg-red-500',
}

function formatScheduledDate(date: Date | null): string {
  if (!date) return 'Fecha no disponible'
  return format(new Date(date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })
}

function getScheduleStatus(scheduledAt: Date | null): {
  icon: React.ReactNode
  label: string
  className: string
} {
  if (!scheduledAt) {
    return {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'Sin fecha',
      className: 'text-muted-foreground',
    }
  }

  const now = new Date()
  if (scheduledAt < now) {
    return {
      icon: <CheckCircle className="h-4 w-4" />,
      label: 'Ya pasó',
      className: 'text-muted-foreground line-through',
    }
  }

  return {
    icon: <Clock className="h-4 w-4" />,
    label: 'Programado',
    className: 'text-foreground',
  }
}

export function WorkflowSchedulePreview({
  preview,
  className,
}: WorkflowSchedulePreviewProps) {
  if (preview.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Calendario de envíos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay pasos en el workflow
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort by scheduledAt (null dates at the end)
  const sortedPreview = [...preview].sort((a, b) => {
    if (!a.scheduledAt && !b.scheduledAt) return 0
    if (!a.scheduledAt) return 1
    if (!b.scheduledAt) return -1
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  })

  // Count future emails
  const futureEmails = sortedPreview.filter(
    (p) => p.scheduledAt && new Date(p.scheduledAt) > new Date()
  ).length

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Calendario de envíos</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {futureEmails} email{futureEmails !== 1 ? 's' : ''} pendiente
            {futureEmails !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {sortedPreview.map((item, index) => {
              const TriggerIcon = TRIGGER_TYPE_ICONS[item.triggerType]
              const status = getScheduleStatus(item.scheduledAt)

              return (
                <div
                  key={item.stepId}
                  className={cn(
                    'relative flex gap-3 pb-3',
                    index < sortedPreview.length - 1 && 'border-b'
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      'mt-1 h-3 w-3 rounded-full shrink-0',
                      TRIGGER_COLORS[item.triggerType]
                    )}
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn('font-medium text-sm truncate', status.className)}
                      >
                        {item.templateName}
                      </p>
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs font-normal"
                      >
                        <TriggerIcon className="h-3 w-3 mr-1" />
                        {TRIGGER_TYPE_LABELS[item.triggerType]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                    <div
                      className={cn('flex items-center gap-1 text-xs', status.className)}
                    >
                      {status.icon}
                      <span>{formatScheduledDate(item.scheduledAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
