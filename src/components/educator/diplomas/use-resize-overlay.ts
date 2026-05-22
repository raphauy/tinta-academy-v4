'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'

export type ResizeDirection = 'se'

// Factores de sensibilidad: multiplican el delta del cursor (en % del container)
// antes de aplicarlo a fontSize/maxWidth. Valores < 1 hacen el resize más suave,
// > 1 más brusco. Calibrados para que mover el cursor ~100 px en un container
// de tamaño normal produzca un cambio perceptible pero controlable.
const FONT_SIZE_SENSITIVITY = 0.25
const MAX_WIDTH_SENSITIVITY = 0.6

type UseResizeOverlayOptions = {
  containerRef: RefObject<HTMLElement | null>
  /** Valores actuales del overlay (en %). */
  currentFontSize: number
  currentMaxWidth: number
  /** Callback con los nuevos valores. */
  onResize: (next: { fontSize: number; maxWidth: number }) => void
  disabled?: boolean
  /**
   * Qué dimensión afecta este handle:
   * - 'both' (default): cambia ancho con dx y fontSize con dy (esquina SE).
   * - 'width': solo cambia ancho con dx (borde E).
   * - 'fontSize': solo cambia fontSize con dy (borde S).
   */
  dimension?: 'both' | 'width' | 'fontSize'
  /** Mínimos/máximos coherentes con la validación zod. */
  fontSizeMin?: number
  fontSizeMax?: number
  maxWidthMin?: number
  maxWidthMax?: number
}

type ResizeHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
}

/**
 * Resize del overlay del texto. La dirección define qué dimensiones cambia:
 * - 'e' (borde derecho): solo `maxWidth` (dx → ancho).
 * - 's' (borde inferior): solo `fontSize` (dy → tamaño).
 * - 'se' (esquina inferior derecha): ambos.
 *
 * X/Y del overlay no se modifican; el texto crece desde su anchor actual
 * hacia abajo-derecha.
 */
export function useResizeOverlay({
  containerRef,
  currentFontSize,
  currentMaxWidth,
  onResize,
  disabled = false,
  dimension = 'both',
  fontSizeMin = 1,
  fontSizeMax = 25,
  maxWidthMin = 1,
  maxWidthMax = 100,
}: UseResizeOverlayOptions): ResizeHandlers {
  const valuesRef = useRef({
    fontSize: currentFontSize,
    maxWidth: currentMaxWidth,
  })
  const onResizeRef = useRef(onResize)
  useEffect(() => {
    valuesRef.current = {
      fontSize: currentFontSize,
      maxWidth: currentMaxWidth,
    }
    onResizeRef.current = onResize
  })

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return
      const container = containerRef.current
      if (!container) return

      e.preventDefault()
      e.stopPropagation()
      const pointerId = e.pointerId

      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      const startClientX = e.clientX
      const startClientY = e.clientY
      const startFontSize = valuesRef.current.fontSize
      const startMaxWidth = valuesRef.current.maxWidth

      const handleMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        const dxPct = ((ev.clientX - startClientX) / rect.width) * 100
        const dyPct = ((ev.clientY - startClientY) / rect.height) * 100

        const affectsWidth = dimension === 'both' || dimension === 'width'
        const affectsFont = dimension === 'both' || dimension === 'fontSize'

        const nextMaxWidth = affectsWidth
          ? clamp(
              startMaxWidth + dxPct * MAX_WIDTH_SENSITIVITY,
              maxWidthMin,
              maxWidthMax
            )
          : startMaxWidth
        const nextFontSize = affectsFont
          ? clamp(
              startFontSize + dyPct * FONT_SIZE_SENSITIVITY,
              fontSizeMin,
              fontSizeMax
            )
          : startFontSize

        onResizeRef.current({
          fontSize: round2(nextFontSize),
          maxWidth: round2(nextMaxWidth),
        })
      }

      const handleUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
    },
    [
      containerRef,
      disabled,
      dimension,
      fontSizeMin,
      fontSizeMax,
      maxWidthMin,
      maxWidthMax,
    ]
  )

  return { onPointerDown }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function round2(n: number): number {
  return Math.round(n * 10) / 10
}
