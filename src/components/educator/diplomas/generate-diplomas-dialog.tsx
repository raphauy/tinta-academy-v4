'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Sparkles } from 'lucide-react'
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
import { generateDiplomasAction } from '@/app/educator/courses/[id]/diploma/actions'
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

type Phase = 'confirm' | 'progress'

type Props = {
  courseId: string
  newCount: number
  retryCount: number
}

const EMPTY_PROGRESS: CourseDiplomaProgress = {
  pending: 0,
  generating: 0,
  generated: 0,
  sending: 0,
  sent: 0,
  failed: 0,
  total: 0,
}

export function GenerateDiplomasDialog({
  courseId,
  newCount,
  retryCount,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('confirm')
  const [progress, setProgress] = useState<CourseDiplomaProgress>(EMPTY_PROGRESS)
  const stoppedRef = useRef(false)

  const total = newCount + retryCount

  const closeAndReset = useCallback(() => {
    stoppedRef.current = true
    setOpen(false)
    setPhase('confirm')
    setProgress(EMPTY_PROGRESS)
  }, [])

  const handleGenerate = () => {
    setPhase('progress')
    stoppedRef.current = false

    // Pre-cargar contadores con el total conocido para evitar el salto
    // "0 → total" mientras llega el primer poll.
    setProgress({
      pending: total,
      generating: 0,
      generated: 0,
      sending: 0,
      sent: 0,
      failed: 0,
      total,
    })

    // La action es la fuente de verdad para "ya terminó". El polling solo
    // refleja progreso intermedio en la barra. Evitamos cerrar el modal por
    // condiciones derivadas del polling, que pueden dispararse antes de tiempo
    // en flujos retry-only (todos los issues pre-existentes en `failed`).
    let actionDone = false
    let actionError: string | null = null
    const actionPromise = generateDiplomasAction(courseId)
      .then((result) => {
        actionDone = true
        if (!result.success) actionError = result.error
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
        router.refresh()
        setOpen(false)
        setPhase('confirm')
        setProgress(EMPTY_PROGRESS)
        return
      }
      setTimeout(tick, POLL_INTERVAL_MS)
    }

    // Pequeño delay inicial para que la action alcance a crear los issues.
    setTimeout(tick, 600)
    // Aseguramos que el modal cierre incluso si el polling falla siempre.
    void actionPromise
  }

  const denominator = Math.max(
    total,
    progress.pending +
      progress.generating +
      progress.generated +
      progress.failed
  )
  const completed = progress.generated + progress.failed
  const percent =
    denominator > 0
      ? Math.min(100, Math.round((completed / denominator) * 100))
      : 0

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Bloquear cierre mientras está procesando.
        if (phase === 'progress') return
        if (next) setOpen(true)
        else closeAndReset()
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={total === 0}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generar diplomas para revisar
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
                Generar {total} diploma{total === 1 ? '' : 's'}
              </DialogTitle>
              <DialogDescription>
                Vamos a preparar el diploma de cada estudiante. Puede tardar
                entre {Math.max(5, Math.round(total * 1.5))} y{' '}
                {Math.max(10, total * 3)} segundos. Después vas a poder
                revisarlos antes de enviarlos por email.
                {retryCount > 0 && (
                  <span className="mt-2 block text-foreground">
                    {newCount} nuev{newCount === 1 ? 'o' : 'os'} ·{' '}
                    {retryCount} reintento{retryCount === 1 ? '' : 's'} de
                    fallidos
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={closeAndReset}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate}>Generar</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Generando diplomas…
              </DialogTitle>
              <DialogDescription>
                Estamos preparando cada diploma. Te aviso cuando termine.
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

