'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
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
import { resendDiplomaAction } from '@/app/educator/courses/[id]/diploma/actions'

type Props = {
  courseId: string
  issueId: string
  studentName: string
  emailTo: string
}

export function ResendConfirmationDialog({
  courseId,
  issueId,
  studentName,
  emailTo,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleResend = async () => {
    setSubmitting(true)
    try {
      const result = await resendDiplomaAction(courseId, issueId)
      if (result.success) {
        toast.success(`Diploma reenviado a ${studentName}`)
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
        <Button size="sm" variant="ghost" className="cursor-pointer">
          <Send className="mr-1 h-3.5 w-3.5" />
          Reenviar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reenviar diploma</AlertDialogTitle>
          <AlertDialogDescription>
            Vamos a regenerar el diploma de{' '}
            <span className="font-medium text-foreground">{studentName}</span> y
            enviárselo de nuevo a{' '}
            <span className="font-medium text-foreground">{emailTo}</span>. Si
            cambiaste la plantilla o sus datos, el diploma nuevo va a reflejar
            esos cambios.
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
              void handleResend()
            }}
            disabled={submitting}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reenviando…
              </>
            ) : (
              'Reenviar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
