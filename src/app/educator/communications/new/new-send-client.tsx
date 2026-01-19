'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  FileText,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
  Circle,
  AlertTriangle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  RecipientSelector,
  type CourseForSelection,
  type StudentForSelection,
  type RecipientValue,
} from '@/components/educator/communications/recipient-selector'
import {
  TemplateSelector,
  type TemplateForSelection,
} from '@/components/educator/communications/template-selector'
import { SendConfirmationDialog } from '@/components/educator/communications/send-confirmation-dialog'
import {
  SchedulePicker,
  type ScheduleValue,
} from '@/components/educator/communications/schedule-picker'
import {
  TemplatePreview,
  NO_COURSE_VARIABLES,
} from '@/components/educator/templates/template-preview'
import { formatInTimezone, getUserTimezone } from '@/lib/timezone-utils'
import { usesCourseVariables } from '@/lib/email/template-variables'
import { sendCampaignAction } from '../actions'

interface NewSendClientProps {
  templates: TemplateForSelection[]
  courses: CourseForSelection[]
  students: StudentForSelection[]
}

type Step = 1 | 2 | 3

const STEPS = [
  {
    number: 1,
    label: 'Destinatarios',
    description: 'Define el nombre y el público de la campaña.',
    icon: Users,
  },
  {
    number: 2,
    label: 'Plantilla',
    description: 'Elige el email que vas a enviar.',
    icon: FileText,
  },
  {
    number: 3,
    label: 'Confirmación',
    description: 'Revisa el envío y programa la fecha.',
    icon: Send,
  },
] as const

export function NewSendClient({
  templates,
  courses,
  students,
}: NewSendClientProps) {
  const router = useRouter()

  // Form state
  const [step, setStep] = useState<Step>(1)
  const [campaignName, setCampaignName] = useState('')
  const [recipients, setRecipients] = useState<RecipientValue>({
    mode: 'course',
    studentIds: [],
  })
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  )
  const [schedule, setSchedule] = useState<ScheduleValue>({
    mode: 'now',
    timezone: getUserTimezone(),
  })

  // Dialog and loading state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Computed values
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null
    return templates.find((t) => t.id === selectedTemplateId) || null
  }, [templates, selectedTemplateId])

  const recipientCount = useMemo(() => {
    if (recipients.mode === 'course' && recipients.courseId) {
      const course = courses.find((c) => c.id === recipients.courseId)
      return course?.studentCount || 0
    }
    return recipients.studentIds.length
  }, [recipients, courses])

  const selectedCourseName = useMemo(() => {
    if (recipients.mode === 'course' && recipients.courseId) {
      const course = courses.find((c) => c.id === recipients.courseId)
      return course?.title || ''
    }
    return ''
  }, [recipients, courses])

  const scheduledAtFormatted = useMemo(() => {
    if (schedule.mode === 'scheduled' && schedule.scheduledAt && schedule.timezone) {
      return formatInTimezone(
        schedule.scheduledAt,
        schedule.timezone,
        "dd/MM/yyyy 'a las' HH:mm"
      )
    }
    return ''
  }, [schedule])

  // Preview variables: use placeholders when no course is selected
  const hasCourseSelected = recipients.mode === 'course' && !!recipients.courseId
  const previewVariables = useMemo(() => {
    return hasCourseSelected ? undefined : NO_COURSE_VARIABLES
  }, [hasCourseSelected])

  // Check if we need to show course variable warning
  const showCourseWarning = useMemo(() => {
    if (!selectedTemplate || hasCourseSelected) return false
    const content = selectedTemplate.subject + ' ' + selectedTemplate.body
    return usesCourseVariables(content)
  }, [selectedTemplate, hasCourseSelected])

  // Validation
  const canProceedFromStep1 = useMemo(() => {
    if (recipients.mode === 'course') {
      return !!recipients.courseId
    }
    return recipients.studentIds.length > 0
  }, [recipients])

  const canProceedFromStep2 = !!selectedTemplateId

  const canSend = campaignName.trim() && canProceedFromStep1 && canProceedFromStep2

  const scheduleSummary = useMemo(() => {
    if (schedule.mode === 'scheduled') {
      return scheduledAtFormatted || 'Programado'
    }
    return 'Enviar ahora'
  }, [schedule.mode, scheduledAtFormatted])

  const recipientSummary = useMemo(() => {
    if (recipients.mode === 'course') {
      return selectedCourseName
        ? `${selectedCourseName} (${recipientCount})`
        : 'Selecciona un curso'
    }
    return `${recipientCount} seleccionados`
  }, [recipients.mode, selectedCourseName, recipientCount])

  // Handlers
  const handleNext = () => {
    if (step < 3) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSendClick = () => {
    if (!canSend) return
    setShowConfirmDialog(true)
  }

  const handleConfirmSend = async () => {
    if (!canSend || !selectedTemplateId) return

    setIsSending(true)

    const result = await sendCampaignAction({
      name: campaignName.trim(),
      templateId: selectedTemplateId,
      recipientMode: recipients.mode,
      courseId: recipients.courseId,
      studentIds: recipients.studentIds,
      scheduledAt: schedule.mode === 'scheduled' ? schedule.scheduledAt : undefined,
      timezone: schedule.timezone,
    })

    setIsSending(false)
    setShowConfirmDialog(false)

    if (result.success) {
      const { campaignId, sent, failed, scheduled } = result.data!

      if (scheduled) {
        toast.success(`Campaña programada para ${scheduledAtFormatted}`)
      } else if (failed === 0) {
        toast.success(`Campaña enviada exitosamente a ${sent} destinatarios`)
      } else {
        toast.warning(
          `Campaña enviada: ${sent} exitosos, ${failed} fallidos`
        )
      }

      // Redirect to campaign detail
      router.push(`/educator/communications/${campaignId}`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">
            Paso {step} de 3
          </span>
          <span className="hidden sm:inline">{STEPS[step - 1].label}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {STEPS.map((s) => {
            const isActive = step === s.number
            const isComplete = step > s.number
            return (
              <div
                key={s.number}
                className={`rounded-lg border p-4 transition-colors ${
                  isActive
                    ? 'border-primary/60 bg-background shadow-sm'
                    : isComplete
                      ? 'border-primary/20 bg-muted/30'
                      : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <s.icon className="h-4 w-4 text-muted-foreground" />
                      )}
                      {s.label}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.number}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-start gap-3 text-base">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {step}
                </span>
                <div>
                  <div className="font-semibold">
                    {step === 1 && 'Destinatarios y nombre'}
                    {step === 2 && 'Seleccionar plantilla'}
                    {step === 3 && 'Revisar y confirmar envío'}
                  </div>
                  <CardDescription>
                    {step === 1 &&
                      'Configura el nombre interno y a quién se enviará.'}
                    {step === 2 &&
                      'Escoge una plantilla y revisa su contenido.'}
                    {step === 3 &&
                      'Define el momento de envío y verifica el resumen.'}
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
                    <div>
                      <Label htmlFor="campaign-name" className="text-sm font-medium">
                        Nombre de la campaña
                      </Label>
                      <Input
                        id="campaign-name"
                        placeholder="Ej: Recordatorio inicio de clases"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="mt-2"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Úsalo para reconocer este envío en el historial.
                      </p>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      <p className="font-medium">Consejo rápido</p>
                      <p className="mt-1 text-muted-foreground">
                        Un nombre claro ayuda a comparar resultados luego.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-3 text-sm font-medium text-muted-foreground">
                      Selección de destinatarios
                    </div>
                    <RecipientSelector
                      courses={courses}
                      students={students}
                      value={recipients}
                      onChange={setRecipients}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <TemplateSelector
                    templates={templates}
                    value={selectedTemplateId}
                    onChange={setSelectedTemplateId}
                  />
                  {showCourseWarning && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>La plantilla usa variables de curso</AlertTitle>
                      <AlertDescription>
                        Selecciona un curso en el paso anterior para evitar campos
                        vacíos.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border bg-muted/10 p-4 lg:col-span-2">
                      <h3 className="mb-4 font-medium">Cuándo enviar</h3>
                      <SchedulePicker value={schedule} onChange={setSchedule} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Vista previa del email</h3>
                    </div>
                    {selectedTemplate ? (
                      <TemplatePreview
                        subject={selectedTemplate.subject}
                        body={selectedTemplate.body}
                        variables={previewVariables}
                      />
                    ) : (
                      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                        Selecciona una plantilla para ver la vista previa
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>

            {step < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && !canProceedFromStep1) ||
                  (step === 2 && !canProceedFromStep2)
                }
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSendClick} disabled={!canSend || isSending}>
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSending
                  ? (schedule.mode === 'scheduled'
                      ? 'Programando...'
                      : 'Enviando...')
                  : (schedule.mode === 'scheduled'
                      ? 'Programar envío'
                      : 'Enviar ahora')}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Resumen de la campaña
                </CardTitle>
                <CardDescription>
                  Se actualiza a medida que completas los pasos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {campaignName.trim() ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Nombre
                    </div>
                    <div className="text-right font-medium">
                      {campaignName || 'Sin nombre'}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {canProceedFromStep1 ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Destinatarios
                    </div>
                    <div className="text-right font-medium">
                      {recipientSummary}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {canProceedFromStep2 ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Plantilla
                    </div>
                    <div className="text-right font-medium">
                      {selectedTemplate?.name || 'Sin seleccionar'}
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Envío
                    </div>
                    <div className="text-right font-medium">{scheduleSummary}</div>
                  </div>
                </div>

                {!canSend && (
                  <Alert>
                    <AlertTitle>Completa los pasos</AlertTitle>
                    <AlertDescription>
                      Revisa que tengas nombre, destinatarios y plantilla antes de
                      enviar.
                    </AlertDescription>
                  </Alert>
                )}

                {showCourseWarning && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Variables de curso detectadas</AlertTitle>
                    <AlertDescription>
                      Selecciona un curso para evitar datos vacíos.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="border-t text-sm text-muted-foreground">
                Avanza paso a paso para un envío más seguro.
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <SendConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        recipientCount={recipientCount}
        templateName={selectedTemplate?.name || ''}
        onConfirm={handleConfirmSend}
        isLoading={isSending}
        scheduledAt={schedule.mode === 'scheduled' ? schedule.scheduledAt : undefined}
        scheduledAtFormatted={scheduledAtFormatted}
      />
    </div>
  )
}
