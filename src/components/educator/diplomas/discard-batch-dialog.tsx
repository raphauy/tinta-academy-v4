'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { discardGeneratedBatchAction } from '@/app/educator/courses/[id]/diploma/actions'

type Phase = 'confirm' | 'discarding'

type Props = {
  courseId: string
  totalToDiscard: number
}

export function DiscardBatchDialog({ courseId, totalToDiscard }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')

  const closeAndReset = useCallback(() => {
    setOpen(false)
    setPhase('confirm')
  }, [])

  const handleDiscard = async () => {
    setPhase('discarding')
    const result = await discardGeneratedBatchAction(courseId)
    if (result.success) {
      toast.success('Lote descartado. Podés ajustar la plantilla.')
      router.refresh()
      closeAndReset()
    } else {
      toast.error(result.error)
      setPhase('confirm')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (phase === 'discarding') return
        if (next) setOpen(true)
        else closeAndReset()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Undo2 className="mr-2 h-4 w-4" />
          Volver al editor
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={phase !== 'discarding'}
        onEscapeKeyDown={(e) => {
          if (phase === 'discarding') e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (phase === 'discarding') e.preventDefault()
        }}
      >
        {phase === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle>Descartar el lote</DialogTitle>
              <DialogDescription>
                Esto borra los {totalToDiscard} diploma
                {totalToDiscard === 1 ? '' : 's'} generado
                {totalToDiscard === 1 ? '' : 's'} para que puedas ajustar la
                plantilla y volver a generar. Los diplomas ya enviados no se
                tocan.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={closeAndReset}>
                Cancelar
              </Button>
              <Button
                onClick={handleDiscard}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Descartar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Descartando…
              </DialogTitle>
              <DialogDescription>
                Estamos eliminando los diplomas generados. Te aviso cuando
                termine.
              </DialogDescription>
            </DialogHeader>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
