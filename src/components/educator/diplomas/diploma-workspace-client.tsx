'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import type { Course, DiplomaIssue, DiplomaTemplate } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ImageBaseUpload, type DiplomaBaseImage } from './image-base-upload'
import { TemplateEditor } from './template-editor'
import { DiplomaGrid } from './diploma-grid'
import { DiplomaIssuesList } from './diploma-issues-list'
import { DiplomaViewToggle, type DiplomaViewMode } from './diploma-view-toggle'
import { EmissionSummary } from './emission-summary'
import { GenerationProgress } from './generation-progress'
import { SendConfirmationDialog } from './send-confirmation-dialog'
import { GenerateDiplomasDialog } from './generate-diplomas-dialog'
import { DiscardBatchDialog } from './discard-batch-dialog'
import { RegenerateDiplomasDialog } from './regenerate-diplomas-dialog'
import { RetryFailedDialog } from './retry-failed-dialog'
import { deleteDiplomaTemplateAction } from '@/app/educator/courses/[id]/diploma/actions'
import type { CourseDiplomaProgress } from '@/services/diploma-service'

type Props = {
  course: Pick<Course, 'id' | 'title' | 'classDates' | 'endDate' | 'startDate'>
  initialTemplate: DiplomaTemplate | null
  issues: DiplomaIssue[]
  enrollmentsPendingCount: number
  sessionEmail: string
}

type UiState =
  | { kind: 'no-template' }
  | { kind: 'no-base-image' }
  | { kind: 'generating' }
  | { kind: 'reviewing' }
  | { kind: 'sending' }
  | { kind: 'idle' }

function deriveUiState(
  template: DiplomaTemplate | null,
  baseImage: DiplomaBaseImage | null,
  issues: DiplomaIssue[]
): UiState {
  if (!template && !baseImage) return { kind: 'no-base-image' }
  if (!template) return { kind: 'no-template' }
  if (issues.some((i) => i.status === 'pending' || i.status === 'generating'))
    return { kind: 'generating' }
  if (issues.some((i) => i.status === 'sending')) return { kind: 'sending' }
  if (issues.some((i) => i.status === 'generated')) return { kind: 'reviewing' }
  return { kind: 'idle' }
}

function buildProgress(issues: DiplomaIssue[]): CourseDiplomaProgress {
  const progress: CourseDiplomaProgress = {
    pending: 0,
    generating: 0,
    generated: 0,
    sending: 0,
    sent: 0,
    failed: 0,
    total: issues.length,
  }
  for (const issue of issues) {
    progress[issue.status] += 1
  }
  return progress
}

export function DiplomaWorkspaceClient({
  course,
  initialTemplate,
  issues,
  enrollmentsPendingCount,
  sessionEmail,
}: Props) {
  const router = useRouter()
  const [baseImage, setBaseImage] = useState<DiplomaBaseImage | null>(
    initialTemplate
      ? {
          url: initialTemplate.baseImageUrl,
          width: initialTemplate.baseImageWidth,
          height: initialTemplate.baseImageHeight,
        }
      : null
  )
  const [deletingTemplate, setDeletingTemplate] = useState(false)
  const [viewMode, setViewMode] = useState<DiplomaViewMode>('table')

  const generatedIssues = issues.filter((i) => i.status === 'generated')
  const failedInBatch = issues.filter((i) => i.status === 'failed')
  const sentOrFailed = issues.filter(
    (i) => i.status === 'sent' || i.status === 'failed'
  )
  const issuesWithAssets = issues.filter((i) => i.pngUrl && i.pdfUrl)
  const state = deriveUiState(initialTemplate, baseImage, issues)
  const progress = buildProgress(issues)

  // ─────────────────────────────────────────────
  // Empty state inicial: subir imagen base
  // ─────────────────────────────────────────────
  if (state.kind === 'no-base-image') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configurar diploma</CardTitle>
          <CardDescription>
            Para empezar, subí la imagen base del diploma. Una vez cargada,
            vas a poder posicionar el nombre del alumno y la fecha sobre ella.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageBaseUpload
            courseId={course.id}
            value={null}
            onChange={(next) => setBaseImage(next)}
          />
        </CardContent>
      </Card>
    )
  }

  const handleDeleteTemplate = async () => {
    setDeletingTemplate(true)
    try {
      const result = await deleteDiplomaTemplateAction(course.id)
      if (result.success) {
        toast.success('Plantilla eliminada')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setDeletingTemplate(false)
    }
  }

  // ─────────────────────────────────────────────
  // Sección "Emitir diplomas" (común a idle y a la zona inferior de otros estados)
  // ─────────────────────────────────────────────
  const renderEmissionBlock = () => {
    // Sin plantilla guardada no podemos emitir: el botón disparaba la action
    // y fallaba en `requireTemplate`, dejando un error silencioso para el
    // educator que aún estaba configurando.
    if (!initialTemplate) return null
    const retries = failedInBatch.length
    const total = enrollmentsPendingCount + retries
    if (total === 0) return null

    const parts: string[] = []
    if (enrollmentsPendingCount > 0) {
      parts.push(
        `${enrollmentsPendingCount} nuev${enrollmentsPendingCount === 1 ? 'o' : 'os'}`
      )
    }
    if (retries > 0) {
      parts.push(
        `${retries} reintento${retries === 1 ? '' : 's'} de fallidos`
      )
    }
    const detail = parts.length > 0 ? ` (${parts.join(', ')})` : ''

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Emitir diplomas</CardTitle>
          <CardDescription>
            {total} diploma{total === 1 ? '' : 's'} para procesar{detail}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateDiplomasDialog
            courseId={course.id}
            newCount={enrollmentsPendingCount}
            retryCount={retries}
          />
        </CardContent>
      </Card>
    )
  }

  // ─────────────────────────────────────────────
  // Estados de batch en curso
  // ─────────────────────────────────────────────
  if (state.kind === 'generating' || state.kind === 'sending') {
    return (
      <div className="space-y-6">
        <GenerationProgress
          courseId={course.id}
          phase={state.kind === 'generating' ? 'generation' : 'sending'}
          initialProgress={progress}
        />
        {sentOrFailed.length > 0 && (
          <EmissionSummary issues={sentOrFailed} />
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // Estado reviewing: grid + acciones
  // ─────────────────────────────────────────────
  if (state.kind === 'reviewing') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Diplomas listos para revisar
            </CardTitle>
            <CardDescription>
              Revisá cada diploma haciendo click para ampliar. Si querés
              ajustar algo, podés volver al editor y descartar este lote.
              {failedInBatch.length > 0 && (
                <span className="ml-1 text-destructive">
                  {failedInBatch.length} fallaron al generarse.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DiplomaGrid issues={generatedIssues} />

            <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
              <DiscardBatchDialog
                courseId={course.id}
                totalToDiscard={generatedIssues.length + failedInBatch.length}
              />

              <SendConfirmationDialog
                courseId={course.id}
                recipients={generatedIssues}
              />
            </div>
          </CardContent>
        </Card>

        {sentOrFailed.length > 0 && (
          <EmissionSummary issues={sentOrFailed} />
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // Estados idle / no-template: editor visible + bloque emisión + resumen
  // ─────────────────────────────────────────────
  const hasInvalidatableBatch =
    generatedIssues.length + failedInBatch.length > 0
  const showEditor = state.kind === 'no-template' || state.kind === 'idle'

  // Sección de fase 4: tabla / galería de emisiones existentes + acciones globales.
  const hasIssuesToShow = issues.length > 0 && state.kind === 'idle'

  return (
    <div className="space-y-6">
      {renderEmissionBlock()}

      {hasIssuesToShow ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Emisiones del curso</CardTitle>
                <CardDescription>
                  {issues.length} emisión{issues.length === 1 ? '' : 'es'} en
                  total · {progress.sent} enviada
                  {progress.sent === 1 ? '' : 's'}
                  {failedInBatch.length > 0
                    ? ` · ${failedInBatch.length} fallida${
                        failedInBatch.length === 1 ? '' : 's'
                      }`
                    : ''}
                  .
                </CardDescription>
              </div>
              <DiplomaViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewMode === 'gallery' ? (
              <DiplomaGrid issues={issuesWithAssets} includeAllWithAssets />
            ) : (
              <DiplomaIssuesList courseId={course.id} issues={issues} />
            )}

            <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
              {/* "Reintentar fallidos" regenera + envía email. Solo tiene
                  sentido si ya hubo alguna emisión exitosa: si nunca hubo
                  `sent` y solo hay `failed`, el educator debería usar
                  "Generar diplomas para revisar" (arriba), no este botón. */}
              {progress.sent > 0 && failedInBatch.length > 0 && (
                <RetryFailedDialog
                  courseId={course.id}
                  failedCount={failedInBatch.length}
                />
              )}
              <RegenerateDiplomasDialog
                courseId={course.id}
                totalIssues={issues.length}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        sentOrFailed.length > 0 && <EmissionSummary issues={sentOrFailed} />
      )}

      {showEditor &&
        (state.kind === 'no-template' ? (
          <TemplateEditor
            course={course}
            initialTemplate={initialTemplate}
            initialBaseImage={baseImage!}
            hasInvalidatableBatch={hasInvalidatableBatch}
            sessionEmail={sessionEmail}
          />
        ) : (
          <Accordion type="single" collapsible>
            <AccordionItem value="editor">
              <AccordionTrigger className="text-sm">
                Editar plantilla del diploma
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 space-y-4">
                  <TemplateEditor
                    course={course}
                    initialTemplate={initialTemplate}
                    initialBaseImage={baseImage!}
                    hasInvalidatableBatch={hasInvalidatableBatch}
                    sessionEmail={sessionEmail}
                  />
                  {initialTemplate && (
                    <div className="flex justify-end border-t pt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar plantilla
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              ¿Eliminar la plantilla?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esto borra la configuración y la imagen base de
                              este curso. Si ya emitiste diplomas, la
                              eliminación va a fallar.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deletingTemplate}>
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.preventDefault()
                                void handleDeleteTemplate()
                              }}
                              disabled={deletingTemplate}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingTemplate ? 'Eliminando…' : 'Eliminar'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
    </div>
  )
}
