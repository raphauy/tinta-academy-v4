'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, UserMinus, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  excludeDiplomaIssueAction,
  restoreDiplomaIssueAction,
} from '@/app/educator/courses/[id]/diploma/actions'

type ExcludeProps = {
  courseId: string
  issueId: string
  studentName: string
  /** Frena la propagación del click (las tarjetas de la galería abren el zoom). */
  stopPropagation?: boolean
}

export function ExcludeIssueDialog({
  courseId,
  issueId,
  studentName,
  stopPropagation = false,
}: ExcludeProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleExclude = async () => {
    setSubmitting(true)
    try {
      const result = await excludeDiplomaIssueAction(courseId, issueId)
      if (result.success) {
        toast.success(`${studentName} no va a recibir el diploma`)
        router.refresh()
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (submitting) return
        setOpen(next)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer text-muted-foreground hover:text-destructive"
          onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
        >
          <UserMinus className="mr-1 h-3.5 w-3.5" />
          No enviar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Sacar a {studentName} del envío?
          </AlertDialogTitle>
          <AlertDialogDescription>
            No va a recibir el diploma por email ni lo va a ver en su panel.
            Su inscripción y su compra no se tocan. Podés volver a incluirlo
            cuando quieras desde la tabla de emisiones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={submitting}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              void handleExclude()
            }}
            disabled={submitting}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sacando…
              </>
            ) : (
              'Sacar del envío'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

type RestoreProps = {
  courseId: string
  issueId: string
  studentName: string
}

/**
 * Reincorporar es reversible e inofensivo, así que no pedimos confirmación.
 * Puede tardar unos segundos: si el diploma quedó con un diseño viejo mientras
 * estuvo excluido, la action lo regenera antes de devolverlo al flujo.
 */
export function RestoreIssueButton({
  courseId,
  issueId,
  studentName,
}: RestoreProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleRestore = async () => {
    setSubmitting(true)
    try {
      const result = await restoreDiplomaIssueAction(courseId, issueId)
      if (result.success) {
        toast.success(
          result.data?.regenerated
            ? `${studentName} vuelve a la lista de envío (su diploma se rehizo con la plantilla actual)`
            : `${studentName} vuelve a la lista de envío`
        )
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => void handleRestore()}
      disabled={submitting}
      className="cursor-pointer disabled:cursor-not-allowed"
    >
      {submitting ? (
        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
      ) : (
        <UserPlus className="mr-1 h-3.5 w-3.5" />
      )}
      Volver a incluir
    </Button>
  )
}
