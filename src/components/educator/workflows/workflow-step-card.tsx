'use client'

import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  formatTriggerDescription,
  TRIGGER_TYPE_OPTIONS,
} from '@/lib/constants/workflow'
import type { WorkflowTriggerType } from '@prisma/client'
import { useState } from 'react'

export interface WorkflowStepData {
  templateId: string
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex?: number
}

interface WorkflowStepCardProps {
  index: number
  step: WorkflowStepData
  templates: { id: string; name: string }[]
  onChange: (step: WorkflowStepData) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
}

export function WorkflowStepCard({
  index,
  step,
  templates,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: WorkflowStepCardProps) {
  const [isOpen, setIsOpen] = useState(true)

  const selectedTemplate = templates.find((t) => t.id === step.templateId)

  // Determine timing mode: same_day, before, or after
  const absOffset = Math.abs(step.triggerOffset)
  const timingMode =
    step.triggerOffset === 0
      ? 'same_day'
      : step.triggerOffset < 0
        ? 'before'
        : 'after'

  const handleChange = (updates: Partial<WorkflowStepData>) => {
    onChange({ ...step, ...updates })
  }

  const handleOffsetValueChange = (value: number) => {
    const newOffset = timingMode === 'before' ? -Math.abs(value) : Math.abs(value)
    handleChange({ triggerOffset: newOffset })
  }

  const handleTimingModeChange = (mode: 'same_day' | 'before' | 'after') => {
    if (mode === 'same_day') {
      handleChange({ triggerOffset: 0 })
    } else if (mode === 'before') {
      // Default to 7 days before if coming from same_day
      handleChange({ triggerOffset: absOffset === 0 ? -7 : -absOffset })
    } else {
      // Default to 1 day after if coming from same_day
      handleChange({ triggerOffset: absOffset === 0 ? 1 : absOffset })
    }
  }

  return (
    <Card className="relative">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b">
          {/* Reorder controls */}
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              disabled={!canMoveUp}
              onClick={onMoveUp}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              disabled={!canMoveDown}
              onClick={onMoveDown}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>

          {/* Step number */}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {index + 1}
          </div>

          {/* Summary */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {selectedTemplate?.name || 'Sin plantilla'}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatTriggerDescription(
                step.triggerType,
                step.triggerOffset,
                step.triggerClassIndex
              )}
            </p>
          </div>

          {/* Actions */}
          <CollapsibleTrigger asChild>
            <Button type="button" variant="ghost" size="sm">
              {isOpen ? 'Colapsar' : 'Expandir'}
            </Button>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <CollapsibleContent>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              {/* Plantilla */}
              <div className="space-y-1 min-w-[180px] flex-1">
                <Label className="text-xs text-muted-foreground">
                  Plantilla
                </Label>
                <Select
                  value={step.templateId}
                  onValueChange={(v) => handleChange({ templateId: v })}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {templates.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No hay plantillas. Crea una primero en Plantillas de Email.
                  </p>
                )}
              </div>

              {/* Grupo trigger - siempre juntos */}
              <div className="flex gap-4 shrink-0">
                {/* Días - solo visible si no es "el mismo día" */}
                {timingMode !== 'same_day' && (
                  <div className="space-y-1 w-[70px]">
                    <Label className="text-xs text-muted-foreground">
                      Días
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={absOffset}
                      onChange={(e) =>
                        handleOffsetValueChange(parseInt(e.target.value, 10) || 1)
                      }
                      className="bg-background"
                    />
                  </div>
                )}

                {/* Momento */}
                <div className="space-y-1 w-[145px]">
                  <Label className="text-xs text-muted-foreground">
                    Momento
                  </Label>
                  <Select
                    value={timingMode}
                    onValueChange={(v) =>
                      handleTimingModeChange(v as 'same_day' | 'before' | 'after')
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="same_day">el mismo día de</SelectItem>
                      <SelectItem value="before">antes de</SelectItem>
                      <SelectItem value="after">después de</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Evento */}
                <div className="space-y-1 w-[180px]">
                  <Label className="text-xs text-muted-foreground">
                    Evento
                  </Label>
                  <Select
                    value={step.triggerType}
                    onValueChange={(v) =>
                      handleChange({ triggerType: v as WorkflowTriggerType })
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIGGER_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clase # (solo para class_date) */}
                {step.triggerType === 'class_date' && (
                  <div className="space-y-1 w-[70px]">
                    <Label className="text-xs text-muted-foreground">
                      Clase #
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={step.triggerClassIndex || ''}
                      onChange={(e) => {
                        const value = e.target.value
                          ? parseInt(e.target.value, 10)
                          : undefined
                        handleChange({ triggerClassIndex: value })
                      }}
                      placeholder="1"
                      className="bg-background"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
