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
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { TemplatePreview } from '@/components/educator/templates/template-preview'
import { formatInTimezone, getUserTimezone } from '@/lib/timezone-utils'
import { sendCampaignAction } from '../actions'

interface NewSendClientProps {
  templates: TemplateForSelection[]
  courses: CourseForSelection[]
  students: StudentForSelection[]
}

type Step = 1 | 2 | 3

const STEPS = [
  { number: 1, label: 'Destinatarios', icon: Users },
  { number: 2, label: 'Plantilla', icon: FileText },
  { number: 3, label: 'Revisar y enviar', icon: Send },
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

  // Validation
  const canProceedFromStep1 = useMemo(() => {
    if (recipients.mode === 'course') {
      return !!recipients.courseId
    }
    return recipients.studentIds.length > 0
  }, [recipients])

  const canProceedFromStep2 = !!selectedTemplateId

  const canSend = campaignName.trim() && canProceedFromStep1 && canProceedFromStep2

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
    <div className="space-y-6">
      {/* Campaign name input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nombre de la campaña</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Label htmlFor="campaign-name" className="sr-only">
              Nombre de la campaña
            </Label>
            <Input
              id="campaign-name"
              placeholder="Ej: Recordatorio inicio de clases"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
            <p className="mt-1.5 text-sm text-muted-foreground">
              Un nombre descriptivo para identificar este envío
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s, idx) => (
          <div key={s.number} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                step === s.number
                  ? 'bg-primary text-primary-foreground'
                  : step > s.number
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > s.number ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <s.icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.number}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px w-8 ${
                  step > s.number ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && (
              <>
                <Users className="h-5 w-5" />
                Seleccionar destinatarios
              </>
            )}
            {step === 2 && (
              <>
                <FileText className="h-5 w-5" />
                Seleccionar plantilla
              </>
            )}
            {step === 3 && (
              <>
                <Send className="h-5 w-5" />
                Revisar y enviar
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Recipients */}
          {step === 1 && (
            <RecipientSelector
              courses={courses}
              students={students}
              value={recipients}
              onChange={setRecipients}
            />
          )}

          {/* Step 2: Template */}
          {step === 2 && (
            <TemplateSelector
              templates={templates}
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
            />
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Schedule picker */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-medium">Cuándo enviar</h3>
                <SchedulePicker value={schedule} onChange={setSchedule} />
              </div>

              {/* Summary */}
              <div className="rounded-lg border p-4">
                <h3 className="mb-4 font-medium">Resumen del envío</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Nombre:</dt>
                    <dd className="font-medium">
                      {campaignName || '(sin nombre)'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Destinatarios:</dt>
                    <dd>
                      <Badge variant="secondary">
                        {recipientCount}{' '}
                        {recipientCount === 1 ? 'estudiante' : 'estudiantes'}
                      </Badge>
                    </dd>
                  </div>
                  {recipients.mode === 'course' && selectedCourseName && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Curso:</dt>
                      <dd className="font-medium">{selectedCourseName}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Plantilla:</dt>
                    <dd className="font-medium">
                      {selectedTemplate?.name || '(ninguna)'}
                    </dd>
                  </div>
                  {schedule.mode === 'scheduled' && scheduledAtFormatted && (
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Programado:</dt>
                      <dd className="font-medium">{scheduledAtFormatted}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Template preview */}
              {selectedTemplate && (
                <div>
                  <h3 className="mb-3 font-medium">Vista previa del email</h3>
                  <TemplatePreview
                    subject={selectedTemplate.subject}
                    body={selectedTemplate.body}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
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
          <Button onClick={handleSendClick} disabled={!canSend}>
            <Send className="mr-2 h-4 w-4" />
            {schedule.mode === 'scheduled' ? 'Programar envío' : 'Enviar ahora'}
          </Button>
        )}
      </div>

      {/* Confirmation dialog */}
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
