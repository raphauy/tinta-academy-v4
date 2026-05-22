'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, RotateCcw } from 'lucide-react'
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
import { retryFailedDiplomasAction } from '@/app/educator/courses/[id]/diploma/actions'
import type { CourseDiplomaProgress } from '@/services/diploma-service'

async function fetchProgress(
  courseId: string
): Promise<CourseDiplomaProgress | null> {
  try {
    const res = await fetch(
      `/api/educator/courses/${courseId}/diploma/progress`,
      { cache: 'no-store' }
    )
    if (!res.ok) return null
    return (await res.json()) as CourseDiplomaProgress
  } catch {
    return null
  }
}

const POLL_INTERVAL_MS = 2000

const EMPTY_PROGRESS: CourseDiplomaProgress = {
  pending: 0,
  generating: 0,
  generated: 0,
  sending: 0,
  sent: 0,
  failed: 0,
  total: 0,
}

type Phase = 'confirm' | 'progress'

type Props = {
  courseId: string
  failedCount: number
}

export function RetryFailedDialog({ courseId, failedCount }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')
  const [progress, setProgress] = useState<CourseDiplomaProgress>(EMPTY_PROGRESS)
  const stoppedRef = useRef(false)

  const closeAndReset = useCallback(() => {
    stoppedRef.current = true
    setOpen(false)
    setPhase('confirm')
    setProgress(EMPTY_PROGRESS)
  }, [])

  // Cleanup al desmontar (ej. el usuario navega a otra ruta durante el batch):
  // detiene el polling para evitar setState sobre componente desmontado.
  useEffect(() => {
    return () => {
      stoppedRef.current = true
    }
  }, [])

  const handleRetry = () => {
    setPhase('progress')
    stoppedRef.current = false
    setProgress({ ...EMPTY_PROGRESS, failed: failedCount, total: failedCount })

    let actionDone = false
    let actionError: string | null = null
    let actionSummary: string | null = null
    const actionPromise = retryFailedDiplomasAction(courseId)
      .then((result) => {
        actionDone = true
        if (!result.success) actionError = result.error
        else if (result.data) {
          actionSummary = `${result.data.succeeded} OK · ${result.data.failed} con error`
        }
      })
      .catch((err) => {
        actionDone = true
        actionError = err instanceof Error ? err.message : 'Error inesperado'
      })

    const tick = async () => {
      if (stoppedRef.current) return
      const data = await fetchProgress(courseId)
      if (stoppedRef.current) return
      if (data) setProgress(data)

      if (actionDone) {
        stoppedRef.current = true
        if (actionError) toast.error(actionError)
        else if (actionSummary) toast.success(actionSummary)
        else toast.success('Reintento completado')
        router.refresh()
        setOpen(false)
        setPhase('confirm')
        setProgress(EMPTY_PROGRESS)
        return
      }
      setTimeout(tick, POLL_INTERVAL_MS)
    }

    setTimeout(tick, 600)
    void actionPromise
  }

  const denominator = Math.max(failedCount, 1)
  // Para "reintentar fallidos" lo más fiel es contar cuántos quedan en `failed`
  // todavía: bajan a medida que se procesan.
  const remaining = Math.min(progress.failed, denominator)
  const completed = denominator - remaining
  const percent =
    denominator > 0
      ? Math.min(100, Math.round((completed / denominator) * 100))
      : 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (phase === 'progress') return
        if (next) setOpen(true)
        else closeAndReset()
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={failedCount === 0}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reintentar fallidos ({failedCount})
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={phase !== 'progress'}
        onEscapeKeyDown={(e) => {
          if (phase === 'progress') e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (phase === 'progress') e.preventDefault()
        }}
      >
        {phase === 'confirm' ? (
          <>
            <DialogHeader>
              <DialogTitle>
                Reintentar {failedCount} emisión
                {failedCount === 1 ? '' : 'es'} fallida
                {failedCount === 1 ? '' : 's'}
              </DialogTitle>
              <DialogDescription>
                Vamos a regenerar cada diploma fallido y enviarlo por email. Si
                el problema fue temporal (un error de red, un email rechazado
                puntualmente), debería quedar en estado enviado.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={closeAndReset}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button onClick={handleRetry} className="cursor-pointer">
                Reintentar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Reintentando…
              </DialogTitle>
              <DialogDescription>
                Procesando cada diploma fallido. Te aviso cuando termine.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {completed} de {denominator}
                </span>
                <span className="font-medium">{percent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
