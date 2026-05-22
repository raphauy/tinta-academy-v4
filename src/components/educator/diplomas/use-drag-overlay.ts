'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react'

type UseDragOverlayOptions = {
  /** Ref al contenedor cuyo bounding rect define el sistema de coordenadas. */
  containerRef: RefObject<HTMLElement | null>
  /** Posición actual del overlay en % (0-100). Se lee en pointerDown. */
  currentX: number
  currentY: number
  /** Callback con la nueva posición en % (0-100). */
  onMove: (xPct: number, yPct: number) => void
  /** Optional callback al iniciar el drag. */
  onStart?: () => void
  /** Optional callback al soltar. */
  onEnd?: () => void
  /** Desactiva el drag. */
  disabled?: boolean
}

type DragHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void
}

/**
 * Drag con preservación de offset: al hacer pointerDown se captura el delta
 * entre el cursor y la posición actual del overlay, y se aplica ese delta
 * durante el move. Así el texto no "salta" al cursor en el primer click —
 * sigue al cursor sin discontinuidad.
 *
 * El elemento que reciba estos handlers debe tener `touch-action: none` para
 * evitar que el browser cancele el drag por scroll en mobile.
 */
export function useDragOverlay({
  containerRef,
  currentX,
  currentY,
  onMove,
  onStart,
  onEnd,
  disabled = false,
}: UseDragOverlayOptions): DragHandlers {
  // Refs que reflejan los valores más recientes sin recrear handlers.
  const posRef = useRef({ x: currentX, y: currentY })
  const onMoveRef = useRef(onMove)
  const onEndRef = useRef(onEnd)
  useEffect(() => {
    posRef.current = { x: currentX, y: currentY }
    onMoveRef.current = onMove
    onEndRef.current = onEnd
  })

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (disabled) return
      const container = containerRef.current
      if (!container) return

      e.preventDefault()
      e.stopPropagation()
      const pointerId = e.pointerId
      onStart?.()

      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      // Capturar el snapshot en pointerDown: posición del cursor y posición
      // del overlay. El delta entre cursor inicial y cursor actual se suma
      // a la posición inicial del overlay.
      const startClientX = e.clientX
      const startClientY = e.clientY
      const startOverlayX = posRef.current.x
      const startOverlayY = posRef.current.y

      const handleMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        const dxPct = ((ev.clientX - startClientX) / rect.width) * 100
        const dyPct = ((ev.clientY - startClientY) / rect.height) * 100
        const newX = clamp(startOverlayX + dxPct, 0, 100)
        const newY = clamp(startOverlayY + dyPct, 0, 100)
        onMoveRef.current(newX, newY)
      }

      const handleUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.removeEventListener('pointercancel', handleUp)
        onEndRef.current?.()
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
    },
    [containerRef, disabled, onStart]
  )

  return { onPointerDown }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
