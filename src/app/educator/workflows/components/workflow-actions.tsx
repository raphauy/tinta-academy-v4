'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Pencil,
  Copy,
  Trash,
  Loader2,
  Power,
  PowerOff,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  deleteWorkflowAction,
  duplicateWorkflowAction,
  toggleWorkflowActiveAction,
} from '../actions'

interface WorkflowActionsProps {
  workflowId: string
  workflowName: string
  isActive: boolean
  coursesCount: number
}

export function WorkflowActions({
  workflowId,
  workflowName,
  isActive,
  coursesCount,
}: WorkflowActionsProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDuplicate = async () => {
    setIsDuplicating(true)
    const result = await duplicateWorkflowAction(workflowId)
    setIsDuplicating(false)

    if (result.success) {
      toast.success('Workflow duplicado correctamente')
    } else {
      toast.error(result.error)
    }
  }

  const handleToggleActive = async () => {
    setIsToggling(true)
    const result = await toggleWorkflowActiveAction(workflowId)
    setIsToggling(false)

    if (result.success) {
      toast.success(
        isActive ? 'Workflow desactivado' : 'Workflow activado'
      )
    } else {
      toast.error(result.error)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteWorkflowAction(workflowId)
    setIsDeleting(false)
    setShowDeleteDialog(false)

    if (result.success) {
      toast.success('Workflow eliminado correctamente')
    } else {
      toast.error(result.error)
    }
  }

  const isLoading = isDuplicating || isToggling

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Acciones</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/educator/workflows/${workflowId}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
            {isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
            disabled={coursesCount > 0}
          >
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar workflow</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar &quot;{workflowName}&quot;? Esta acción
              no se puede deshacer.
              {coursesCount > 0 && (
                <span className="block mt-2 text-destructive">
                  Este workflow está siendo usado en {coursesCount}{' '}
                  {coursesCount === 1 ? 'curso' : 'cursos'} y no puede ser
                  eliminado.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || coursesCount > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
