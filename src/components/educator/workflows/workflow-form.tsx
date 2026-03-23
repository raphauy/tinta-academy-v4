'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Mail } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkflowStepCard, type WorkflowStepData } from './workflow-step-card'
import { SendTimePicker } from './send-time-picker'
import { WorkflowTimeline } from './workflow-timeline'
import {
  createWorkflowSchema,
  type CreateWorkflowFormData,
} from '@/lib/validations/workflow'

interface WorkflowFormProps {
  defaultValues?: Partial<
    CreateWorkflowFormData & {
      steps: (WorkflowStepData & { templateName?: string })[]
    }
  >
  templates: { id: string; name: string }[]
  onSubmit: (data: CreateWorkflowFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function WorkflowForm({
  defaultValues,
  templates,
  onSubmit,
  isLoading = false,
  submitLabel = 'Guardar workflow',
}: WorkflowFormProps) {
  const [steps, setSteps] = useState<WorkflowStepData[]>(
    defaultValues?.steps?.map((s) => ({
      id: s.id,
      templateId: s.templateId,
      triggerType: s.triggerType,
      triggerOffset: s.triggerOffset,
      triggerClassIndex: s.triggerClassIndex,
    })) || []
  )

  const [sendAtHour, setSendAtHour] = useState(defaultValues?.sendAtHour ?? 9)
  const [sendAtMinute, setSendAtMinute] = useState(
    defaultValues?.sendAtMinute ?? 0
  )
  const [sendAtTimezone, setSendAtTimezone] = useState(
    defaultValues?.sendAtTimezone ?? 'America/Montevideo'
  )

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateWorkflowFormData>({
    resolver: zodResolver(createWorkflowSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      sendAtHour: defaultValues?.sendAtHour ?? 9,
      sendAtMinute: defaultValues?.sendAtMinute ?? 0,
      sendAtTimezone: defaultValues?.sendAtTimezone ?? 'America/Montevideo',
      steps: defaultValues?.steps ?? [],
    },
  })

  // Sync controlled state with form for validation
  useEffect(() => {
    setValue(
      'steps',
      steps.map((step, index) => ({ ...step, order: index }))
    )
  }, [steps, setValue])

  useEffect(() => {
    setValue('sendAtHour', sendAtHour)
    setValue('sendAtMinute', sendAtMinute)
    setValue('sendAtTimezone', sendAtTimezone)
  }, [sendAtHour, sendAtMinute, sendAtTimezone, setValue])

  const addStep = () => {
    setSteps([
      ...steps,
      {
        templateId: templates[0]?.id ?? '',
        triggerType: 'course_start',
        triggerOffset: -7, // 7 days before by default
        triggerClassIndex: undefined,
      },
    ])
  }

  const updateStep = (index: number, step: WorkflowStepData) => {
    const newSteps = [...steps]
    newSteps[index] = step
    setSteps(newSteps)
  }

  const deleteStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= steps.length) return
    const newSteps = [...steps]
    const [removed] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, removed)
    setSteps(newSteps)
  }

  const onFormSubmit = async (data: CreateWorkflowFormData) => {
    // Merge controlled state with form data
    await onSubmit({
      ...data,
      sendAtHour,
      sendAtMinute,
      sendAtTimezone,
      steps: steps.map((step, index) => ({
        ...step,
        order: index,
      })),
    })
  }

  // Prepare steps with template names for timeline
  const stepsWithNames = steps.map((step) => ({
    ...step,
    templateName: templates.find((t) => t.id === step.templateId)?.name,
  }))

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr,350px]">
        {/* Form fields - left column */}
        <div className="space-y-6">
          {/* Basic info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del workflow</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ej: Bienvenida curso WSET"
                  className="bg-background"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Describe el propósito de este workflow..."
                  className="bg-background resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Send time card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hora de envío</CardTitle>
            </CardHeader>
            <CardContent>
              <SendTimePicker
                hour={sendAtHour}
                minute={sendAtMinute}
                timezone={sendAtTimezone}
                onHourChange={setSendAtHour}
                onMinuteChange={setSendAtMinute}
                onTimezoneChange={setSendAtTimezone}
              />
            </CardContent>
          </Card>

          {/* Steps card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                Pasos del workflow ({steps.length})
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                disabled={templates.length === 0}
              >
                <Plus className="mr-1 h-4 w-4" />
                Agregar paso
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg">
                  <Mail className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    Para crear pasos necesitas plantillas de email.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href="/educator/templates/create">
                      <Plus className="mr-1 h-4 w-4" />
                      Crear plantilla
                    </Link>
                  </Button>
                </div>
              ) : steps.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No hay pasos todavía. Agrega el primer paso para definir
                    cuándo se enviarán los emails.
                  </p>
                </div>
              ) : (
                steps.map((step, index) => (
                  <WorkflowStepCard
                    key={index}
                    index={index}
                    step={step}
                    templates={templates}
                    onChange={(newStep) => updateStep(index, newStep)}
                    onDelete={() => deleteStep(index)}
                    onMoveUp={() => moveStep(index, index - 1)}
                    onMoveDown={() => moveStep(index, index + 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < steps.length - 1}
                  />
                ))
              )}

              {errors.steps && (
                <p className="text-sm text-destructive">
                  {errors.steps.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Submit button */}
          <Button type="submit" disabled={isLoading || steps.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>

        {/* Timeline preview - right column (sticky) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <WorkflowTimeline steps={stepsWithNames} />
        </div>
      </div>
    </form>
  )
}
