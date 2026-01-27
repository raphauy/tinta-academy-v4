'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TRIGGER_TYPE_ICONS,
  formatTriggerDescription,
} from '@/lib/constants/workflow'
import type { WorkflowTriggerType } from '@prisma/client'
import { cn } from '@/lib/utils'

interface WorkflowStep {
  templateId: string
  templateName?: string
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex?: number
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  className?: string
}

// Colors for different trigger types
const TRIGGER_COLORS: Record<WorkflowTriggerType, string> = {
  course_start: 'bg-green-500',
  course_end: 'bg-blue-500',
  exam_date: 'bg-purple-500',
  class_date: 'bg-orange-500',
  registration_deadline: 'bg-red-500',
}

const TRIGGER_BG_COLORS: Record<WorkflowTriggerType, string> = {
  course_start: 'bg-green-500/10 text-green-700 dark:text-green-400',
  course_end: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  exam_date: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  class_date: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  registration_deadline: 'bg-red-500/10 text-red-700 dark:text-red-400',
}

export function WorkflowTimeline({ steps, className }: WorkflowTimelineProps) {
  if (steps.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">Vista previa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Agrega pasos al workflow para ver la vista previa
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">
          Vista previa ({steps.length} {steps.length === 1 ? 'paso' : 'pasos'})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = TRIGGER_TYPE_ICONS[step.triggerType]
              const color = TRIGGER_COLORS[step.triggerType]
              const bgColor = TRIGGER_BG_COLORS[step.triggerType]

              return (
                <div key={index} className="relative flex gap-4 pl-1">
                  {/* Node */}
                  <div
                    className={cn(
                      'relative z-10 flex items-center justify-center w-7 h-7 rounded-full',
                      color
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div
                      className={cn('rounded-lg p-3 text-sm', bgColor)}
                    >
                      <p className="font-medium">
                        {step.templateName || 'Plantilla sin nombre'}
                      </p>
                      <p className="text-xs mt-1 opacity-80">
                        {formatTriggerDescription(
                          step.triggerType,
                          step.triggerOffset,
                          step.triggerClassIndex
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
