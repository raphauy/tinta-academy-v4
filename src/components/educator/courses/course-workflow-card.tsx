'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  MoreVertical,
  Pause,
  Play,
  Trash,
  Mail,
  Loader2,
  Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatTriggerDescription } from '@/lib/constants/workflow'
import type { CourseWorkflowStatus, WorkflowTriggerType } from '@prisma/client'
import {
  toggleCourseWorkflowStatusAction,
  removeCourseWorkflowAction,
} from '@/app/educator/workflows/actions'
import { WorkflowDetailDialog } from '@/components/educator/courses/workflow-detail-dialog'

interface Step {
  id: string
  order: number
  triggerType: WorkflowTriggerType
  triggerOffset: number
  triggerClassIndex: number | null
  template: {
    id: string
    name: string
    subject: string
  }
}

interface CourseWorkflowCardProps {
  courseWorkflow: {
    id: string
    status: CourseWorkflowStatus
    createdAt: Date
    workflowTemplate: {
      id: string
      name: string
      description: string | null
      steps: Step[]
    }
    _count: {
      executions: number
    }
  }
}

const STATUS_BADGE: Record<
  CourseWorkflowStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  active: { label: 'Activo', variant: 'default' },
  paused: { label: 'Pausado', variant: 'secondary' },
  completed: { label: 'Completado', variant: 'outline' },
}

export function CourseWorkflowCard({ courseWorkflow }: CourseWorkflowCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  const { workflowTemplate, status, _count } = courseWorkflow
  const statusInfo = STATUS_BADGE[status]

  const handleToggleStatus = () => {
    startTransition(async () => {
      const result = await toggleCourseWorkflowStatusAction(courseWorkflow.id)
      if (result.success) {
        toast.success(
          status === 'active'
            ? 'Workflow pausado'
            : 'Workflow activado'
        )
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      const result = await removeCourseWorkflowAction(courseWorkflow.id)
      setShowDeleteDialog(false)
      if (result.success) {
        toast.success('Workflow eliminado del curso')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDetailDialog(true)}
                  className="font-medium truncate text-left cursor-pointer hover:underline hover:text-primary transition-colors"
                >
                  {workflowTemplate.name}
                </button>
                <Badge variant={statusInfo.variant} className="shrink-0">
                  {statusInfo.label}
                </Badge>
              </div>
              {workflowTemplate.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {workflowTemplate.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {workflowTemplate.steps.length} paso
                  {workflowTemplate.steps.length !== 1 ? 's' : ''}
                </span>
                <span>
                  {_count.executions} ejecucion
                  {_count.executions !== 1 ? 'es' : ''} programada
                  {_count.executions !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </DropdownMenuItem>
                {status !== 'completed' && (
                  <DropdownMenuItem onClick={handleToggleStatus}>
                    {status === 'active' ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Activar
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Steps preview */}
          <div className="mt-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              {workflowTemplate.steps.slice(0, 3).map((step) => (
                <Badge
                  key={step.id}
                  variant="outline"
                  className="text-xs font-normal"
                >
                  {step.template.name}:{' '}
                  {formatTriggerDescription(
                    step.triggerType,
                    step.triggerOffset,
                    step.triggerClassIndex
                  )}
                </Badge>
              ))}
              {workflowTemplate.steps.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{workflowTemplate.steps.length - 3} más
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar workflow del curso</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar el workflow &quot;{workflowTemplate.name}&quot; de
              este curso? Se cancelarán todas las ejecuciones programadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WorkflowDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        courseWorkflowId={courseWorkflow.id}
        workflowName={workflowTemplate.name}
      />
    </>
  )
}
