'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, Plus, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { CourseDateWarnings } from '@/components/educator/workflows/course-date-warnings'
import { WorkflowSchedulePreview } from '@/components/educator/workflows/workflow-schedule-preview'
import {
  getSchedulePreviewAction,
  assignWorkflowToCourseAction,
} from '@/app/educator/workflows/actions'
import type { DateValidationResult, SchedulePreviewItem } from '@/services/workflow-execution-service'

interface AddWorkflowDialogProps {
  courseId: string
  courseName: string
  enrolledCount: number
  assignedWorkflowIds: string[]
}

interface WorkflowOption {
  id: string
  name: string
  description: string | null
  _count: {
    steps: number
  }
}

export function AddWorkflowDialog({
  courseId,
  courseName,
  enrolledCount,
  assignedWorkflowIds,
}: AddWorkflowDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([])
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [validation, setValidation] = useState<DateValidationResult | null>(null)
  const [preview, setPreview] = useState<SchedulePreviewItem[]>([])
  const [success, setSuccess] = useState(false)
  const [executionsCreated, setExecutionsCreated] = useState(0)

  // Filter out already assigned workflows
  const availableWorkflows = workflows.filter(
    (w) => !assignedWorkflowIds.includes(w.id)
  )

  // Load workflows when dialog opens
  useEffect(() => {
    if (open && workflows.length === 0) {
      let cancelled = false
      queueMicrotask(() => {
        if (!cancelled) setIsLoadingWorkflows(true)
      })

      fetch('/api/educator/workflows')
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return
          if (data.workflows) {
            setWorkflows(data.workflows)
          }
        })
        .catch(() => {
          if (!cancelled) {
            toast.error('Error al cargar workflows')
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoadingWorkflows(false)
          }
        })

      return () => {
        cancelled = true
      }
    }
  }, [open, workflows.length])

  // Load preview when workflow is selected
  useEffect(() => {
    if (selectedWorkflowId) {
      let cancelled = false
      queueMicrotask(() => {
        if (!cancelled) {
          setIsLoadingPreview(true)
          setValidation(null)
          setPreview([])
        }
      })

      getSchedulePreviewAction(selectedWorkflowId, courseId).then((result) => {
        if (cancelled) return
        if (result.success && result.data) {
          setValidation(result.data.validation)
          setPreview(result.data.preview)
        } else if (!result.success) {
          toast.error(result.error || 'Error al cargar vista previa')
        }
        setIsLoadingPreview(false)
      })

      return () => {
        cancelled = true
      }
    } else {
      queueMicrotask(() => {
        setValidation(null)
        setPreview([])
      })
    }
  }, [selectedWorkflowId, courseId])

  const handleAssign = () => {
    if (!selectedWorkflowId) return

    startTransition(async () => {
      const result = await assignWorkflowToCourseAction(
        selectedWorkflowId,
        courseId
      )

      if (result.success) {
        setSuccess(true)
        setExecutionsCreated(result.data?.executionsCreated || 0)
        toast.success('Workflow asignado correctamente')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleClose = () => {
    if (!isPending) {
      setOpen(false)
      // Reset state after dialog closes
      setTimeout(() => {
        setSelectedWorkflowId(null)
        setValidation(null)
        setPreview([])
        setSuccess(false)
        setExecutionsCreated(0)
      }, 200)
    }
  }

  const canAssign =
    selectedWorkflowId && validation?.isValid && !isPending && !success

  // Count future emails
  const futureEmails = preview.filter(
    (p) => p.scheduledAt && new Date(p.scheduledAt) > new Date()
  ).length

  const selectedWorkflow = workflows.find((w) => w.id === selectedWorkflowId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Agregar workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {success ? 'Workflow asignado' : 'Agregar workflow automático'}
          </DialogTitle>
          <DialogDescription>
            {success
              ? 'El workflow ha sido asignado correctamente al curso.'
              : `Selecciona un workflow para agregarlo al curso "${courseName}".`}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">Workflow asignado</p>
              <p className="text-muted-foreground">
                Se han programado {executionsCreated} email
                {executionsCreated !== 1 ? 's' : ''} para los estudiantes
                inscritos.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Workflow Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow</label>
              {isLoadingWorkflows ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableWorkflows.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No hay workflows disponibles.</p>
                  <p className="text-sm">
                    {workflows.length > 0
                      ? 'Todos los workflows activos ya están asignados a este curso.'
                      : 'Crea un workflow primero en la sección de Workflows.'}
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedWorkflowId || ''}
                  onValueChange={(value) => setSelectedWorkflowId(value || null)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un workflow..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWorkflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        <div className="flex items-center gap-2">
                          <span>{workflow.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            {workflow._count.steps}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {selectedWorkflow?.description && (
                <p className="text-sm text-muted-foreground">
                  {selectedWorkflow.description}
                </p>
              )}
            </div>

            {/* Loading Preview */}
            {isLoadingPreview && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Date Warnings */}
            {validation && !validation.isValid && (
              <CourseDateWarnings validation={validation} courseId={courseId} />
            )}

            {/* Schedule Preview */}
            {preview.length > 0 && validation?.isValid && (
              <WorkflowSchedulePreview preview={preview} />
            )}

            {/* Summary */}
            {selectedWorkflowId && validation?.isValid && futureEmails > 0 && (
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                <p>
                  Al asignar este workflow, se programarán{' '}
                  <strong>
                    {futureEmails} email{futureEmails !== 1 ? 's' : ''}
                  </strong>{' '}
                  para cada uno de los{' '}
                  <strong>
                    {enrolledCount} estudiante{enrolledCount !== 1 ? 's' : ''}
                  </strong>{' '}
                  actualmente inscritos.
                </p>
                {enrolledCount > 0 && (
                  <p className="text-muted-foreground mt-1">
                    Total: {futureEmails * enrolledCount} emails a programar.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {success ? (
            <Button onClick={handleClose}>Cerrar</Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button onClick={handleAssign} disabled={!canAssign}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Agregar workflow
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
