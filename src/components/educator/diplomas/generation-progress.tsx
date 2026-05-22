'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

type Phase = 'generation' | 'sending'

type Props = {
  courseId: string
  phase: Phase
  initialProgress: CourseDiplomaProgress
}

const POLL_INTERVAL_MS = 2000
// Cap absoluto: 10 min. Protege contra polling infinito si una issue queda
// colgada (ej. crash del backend que dejó issues en `pending` sin procesar).
// En producción esto es load-bearing: cada poll es 1 invocación de función.
const POLL_TIMEOUT_MS = 10 * 60 * 1000
const MAX_POLLS = Math.ceil(POLL_TIMEOUT_MS / POLL_INTERVAL_MS)

export function GenerationProgress({ courseId, phase, initialProgress }: Props) {
  const router = useRouter()
  const [progress, setProgress] = useState(initialProgress)
  const [timedOut, setTimedOut] = useState(false)
  const stoppedRef = useRef(false)

  // Snapshot inicial: para mostrar progreso relativo a este batch específico,
  // no al total absoluto del curso. Sin esto, un curso con issues `sent` de
  // lotes anteriores inicia la barra "avanzada" cuando solo se quiere ver el
  // progreso del envío nuevo.
  const initialNumeratorRef = useRef(
    phase === 'generation' ? initialProgress.generated : initialProgress.sent
  )
  const batchSizeRef = useRef(
    phase === 'generation'
      ? initialProgress.pending +
        initialProgress.generating +
        initialProgress.failed
      : initialProgress.generated + initialProgress.sending
  )

  useEffect(() => {
    stoppedRef.current = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let polls = 0

    const tick = async () => {
      if (stoppedRef.current) return
      polls++
      const data = await fetchProgress(courseId)
      if (stoppedRef.current) return
      if (data) {
        setProgress(data)
        const done =
          phase === 'generation'
            ? data.pending + data.generating === 0
            : data.sending === 0
        if (done) {
          stoppedRef.current = true
          router.refresh()
          return
        }
      }
      if (polls >= MAX_POLLS) {
        // Cap de seguridad: paramos el polling y mostramos un mensaje.
        stoppedRef.current = true
        setTimedOut(true)
        return
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS)
    }

    timer = setTimeout(tick, POLL_INTERVAL_MS)
    return () => {
      stoppedRef.current = true
      if (timer) clearTimeout(timer)
    }
  }, [courseId, phase, router])

  if (timedOut) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <AlertCircle className="h-4 w-4" />
            El proceso está tardando demasiado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Dejamos de consultar el progreso después de 10 minutos. Refrescá
            la página para ver el estado actual de las emisiones.
          </p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="cursor-pointer text-sm font-medium underline"
          >
            Refrescar ahora
          </button>
        </CardContent>
      </Card>
    )
  }

  // Numerador = éxitos puros desde que arrancó este batch (restamos los
  // `generated`/`sent` que ya existían al montar). Si una issue estaba `sent`
  // de un lote anterior, no infla el porcentaje. Si todas fallan en este
  // batch, el bar termina en <100% — semánticamente correcto.
  const rawNumerator =
    phase === 'generation' ? progress.generated : progress.sent
  const numerator = Math.max(0, rawNumerator - initialNumeratorRef.current)

  // Denominador = tamaño fijo del batch capturado al montar. Curva monotónica.
  const denominator = batchSizeRef.current

  const percent =
    denominator > 0 ? Math.min(100, Math.round((numerator / denominator) * 100)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {phase === 'generation'
            ? 'Generando diplomas…'
            : 'Enviando diplomas…'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {numerator} de {denominator}
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

        <p className="text-xs text-muted-foreground">
          Esto puede tardar unos segundos. Si cerrás la pestaña no pasa nada:
          el proceso sigue y cuando vuelvas vas a ver el resultado.
        </p>
      </CardContent>
    </Card>
  )
}
