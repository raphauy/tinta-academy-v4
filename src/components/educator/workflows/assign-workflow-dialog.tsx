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
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { CourseSelector } from './course-selector'
import { CourseDateWarnings } from './course-date-warnings'
import { WorkflowSchedulePreview } from './workflow-schedule-preview'
import {
  getCoursesForAssignmentAction,
  getSchedulePreviewAction,
  assignWorkflowToCourseAction,
} from '@/app/educator/workflows/actions'
import { startOfDay } from 'date-fns'
import type {
  CourseForWorkflow,
  DateValidationResult,
  SchedulePreviewItem,
} from '@/services/workflow-execution-service'

type Course = CourseForWorkflow

interface AssignWorkflowDialogProps {
  workflowId: string
  workflowName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignWorkflowDialog({
  workflowId,
  workflowName,
  open,
  onOpenChange,
}: AssignWorkflowDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [validation, setValidation] = useState<DateValidationResult | null>(null)
  const [preview, setPreview] = useState<SchedulePreviewItem[]>([])
  const [success, setSuccess] = useState(false)
  const [executionsCreated, setExecutionsCreated] = useState(0)

  // Load courses when dialog opens
  useEffect(() => {
    if (open && courses.length === 0) {
      let cancelled = false
      queueMicrotask(() => {
        if (!cancelled) setIsLoadingCourses(true)
      })

      getCoursesForAssignmentAction().then((result) => {
        if (cancelled) return
        if (result.success && result.data) {
          setCourses(result.data)
        } else if (!result.success) {
          toast.error(result.error || 'Error al cargar cursos')
        }
        setIsLoadingCourses(false)
      })

      return () => {
        cancelled = true
      }
    }
  }, [open, courses.length])

  // Load preview when course is selected
  useEffect(() => {
    if (selectedCourse) {
      let cancelled = false
      queueMicrotask(() => {
        if (!cancelled) {
          setIsLoadingPreview(true)
          setValidation(null)
          setPreview([])
        }
      })

      getSchedulePreviewAction(workflowId, selectedCourse.id).then((result) => {
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
  }, [selectedCourse, workflowId])

  const handleAssign = () => {
    if (!selectedCourse) return

    startTransition(async () => {
      const result = await assignWorkflowToCourseAction(
        workflowId,
        selectedCourse.id
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
      onOpenChange(false)
      // Reset state after dialog closes
      setTimeout(() => {
        setSelectedCourse(null)
        setValidation(null)
        setPreview([])
        setSuccess(false)
        setExecutionsCreated(0)
      }, 200)
    }
  }

  const canAssign = selectedCourse && validation?.isValid && !isPending && !success

  // Count future emails (include today as future)
  const today = startOfDay(new Date())
  const futureEmails = preview.filter(
    (p) => p.scheduledAt && new Date(p.scheduledAt) >= today
  ).length

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {success ? 'Workflow asignado' : 'Asignar workflow a curso'}
          </DialogTitle>
          <DialogDescription>
            {success
              ? `El workflow "${workflowName}" ha sido asignado correctamente.`
              : `Selecciona un curso para asignarle el workflow "${workflowName}".`}
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
            {/* Course Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Curso</label>
              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No tienes cursos publicados disponibles.
                  </p>
                </div>
              ) : (
                <CourseSelector
                  courses={courses}
                  selectedCourseId={selectedCourse?.id || null}
                  onSelect={setSelectedCourse}
                  disabled={isPending}
                />
              )}
            </div>

            {/* Loading Preview */}
            {isLoadingPreview && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Date Warnings */}
            {validation && !validation.isValid && selectedCourse && (
              <CourseDateWarnings
                validation={validation}
                courseId={selectedCourse.id}
              />
            )}

            {/* Schedule Preview */}
            {preview.length > 0 && validation?.isValid && (
              <WorkflowSchedulePreview preview={preview} />
            )}

            {/* Summary */}
            {selectedCourse && validation?.isValid && futureEmails > 0 && (
              <div className="rounded-lg bg-muted/50 p-4 text-sm">
                {selectedCourse.enrolledCount === 0 ? (
                  <p className="text-muted-foreground">
                    No hay estudiantes inscritos actualmente. Los emails se programarán
                    automáticamente cuando se inscriban nuevos estudiantes.
                  </p>
                ) : (
                  <>
                    <p>
                      Al asignar este workflow, se programarán{' '}
                      <strong>{futureEmails} email{futureEmails !== 1 ? 's' : ''}</strong>{' '}
                      para cada uno de los{' '}
                      <strong>
                        {selectedCourse.enrolledCount} estudiante
                        {selectedCourse.enrolledCount !== 1 ? 's' : ''}
                      </strong>{' '}
                      actualmente inscritos.
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Total: {futureEmails * selectedCourse.enrolledCount} emails a
                      programar.
                    </p>
                  </>
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
                Asignar workflow
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
