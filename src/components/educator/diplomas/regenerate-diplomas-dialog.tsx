'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { regenerateDiplomasAction } from '@/app/educator/courses/[id]/diploma/actions'
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
  totalIssues: number
}

export function RegenerateDiplomasDialog({ courseId, totalIssues }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')
  const [resendEmails, setResendEmails] = useState(false)
  const [progress, setProgress] = useState<CourseDiplomaProgress>(EMPTY_PROGRESS)
  const stoppedRef = useRef(false)

  const closeAndReset = useCallback(() => {
    stoppedRef.current = true
    setOpen(false)
    setPhase('confirm')
    setResendEmails(false)
    setProgress(EMPTY_PROGRESS)
  }, [])

  // Cleanup al desmontar (ej. el usuario navega a otra ruta durante el batch):
  // detiene el polling para evitar setState sobre componente desmontado.
  useEffect(() => {
    return () => {
      stoppedRef.current = true
    }
  }, [])

  const handleRegenerate = () => {
    setPhase('progress')
    stoppedRef.current = false
    setProgress({ ...EMPTY_PROGRESS, total: totalIssues })

    let actionDone = false
    let actionError: string | null = null
    const actionPromise = regenerateDiplomasAction(courseId, { resendEmails })
      .then((result) => {
        actionDone = true
        if (!result.success) actionError = result.error
        else if (result.data) {
          actionError =
            result.data.failed > 0
              ? `${result.data.succeeded} OK · ${result.data.failed} con error`
              : null
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
        else
          toast.success(
            resendEmails
              ? 'Diplomas regenerados y reenviados'
              : 'Diplomas regenerados'
          )
        router.refresh()
        setOpen(false)
        setPhase('confirm')
        setResendEmails(false)
        setProgress(EMPTY_PROGRESS)
        return
      }
      setTimeout(tick, POLL_INTERVAL_MS)
    }

    setTimeout(tick, 600)
    void actionPromise
  }

  // Para la barra usamos el conteo de "no-pending/no-generating" como completados.
  const denominator = Math.max(totalIssues, progress.total)
  const completed =
    denominator > 0
      ? denominator - progress.pending - progress.generating - progress.sending
      : 0
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
          disabled={totalIssues === 0}
          className="cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Regenerar diplomas
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
                Regenerar {totalIssues} diploma
                {totalIssues === 1 ? '' : 's'}
              </DialogTitle>
              <DialogDescription>
                Vamos a regenerar los assets de todas las emisiones usando la
                plantilla actual y refrescando el nombre, la fecha y el email
                desde los datos actuales del estudiante y del curso.
                <span className="mt-2 block">
                  Los emails ya enviados no se reenvían automáticamente: los
                  estudiantes pueden seguir descargando el diploma actualizado
                  desde su panel.
                </span>
                <span className="mt-2 block">
                  Si algún estudiante cambió su email después del primer
                  envío, los próximos reenvíos van a usar el email nuevo.
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Checkbox
                id="resend-emails"
                checked={resendEmails}
                onCheckedChange={(checked) =>
                  setResendEmails(checked === true)
                }
                className="cursor-pointer"
              />
              <Label
                htmlFor="resend-emails"
                className="flex flex-col gap-1 cursor-pointer"
              >
                <span className="font-medium">También reenviar emails</span>
                <span className="text-xs text-muted-foreground">
                  Enviar de nuevo el email del diploma a todos los estudiantes,
                  incluyendo a los que ya lo habían recibido.
                </span>
              </Label>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={closeAndReset}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegenerate}
                className="cursor-pointer"
              >
                {resendEmails ? 'Regenerar y reenviar' : 'Regenerar'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {resendEmails
                  ? 'Regenerando y reenviando…'
                  : 'Regenerando diplomas…'}
              </DialogTitle>
              <DialogDescription>
                Estamos procesando cada diploma. Te aviso cuando termine.
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
