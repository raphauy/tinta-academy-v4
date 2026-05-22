'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useDragOverlay } from './use-drag-overlay'
import { useResizeOverlay } from './use-resize-overlay'

/**
 * Subset de DiplomaTemplate que necesita el preview. Permite alimentarlo
 * tanto desde un Template persistido como desde el form state durante la
 * edición.
 */
export type DiplomaPreviewConfig = {
  nameFontFamily: string
  nameFontWeight: number
  nameFontSize: number // % del alto
  nameColor: string
  nameX: number // %
  nameY: number // %
  nameMaxWidth: number // %
  nameAnchor: 'left' | 'center' | 'right'

  dateEnabled: boolean
  dateFontFamily?: string | null
  dateFontWeight?: number | null
  dateFontSize?: number | null
  dateColor?: string | null
  dateX?: number | null
  dateY?: number | null
  dateMaxWidth?: number | null
  dateAnchor?: 'left' | 'center' | 'right' | null
  dateFormat?: string | null
}

export type ResizePayload = { fontSize: number; maxWidth: number }

type Props = {
  baseImageUrl: string
  baseImageWidth: number
  baseImageHeight: number
  config: DiplomaPreviewConfig
  sampleName: string
  sampleDate: Date | null
  /** Si true, los overlays se pueden arrastrar y redimensionar. */
  draggable?: boolean
  onMoveName?: (x: number, y: number) => void
  onMoveDate?: (x: number, y: number) => void
  onResizeName?: (next: ResizePayload) => void
  onResizeDate?: (next: ResizePayload) => void
  className?: string
  timezone?: string
}

export function DiplomaPreview({
  baseImageUrl,
  baseImageWidth,
  baseImageHeight,
  config,
  sampleName,
  sampleDate,
  draggable = false,
  onMoveName,
  onMoveDate,
  onResizeName,
  onResizeDate,
  className,
  timezone = 'America/Montevideo',
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const containerSize = useElementSize(containerRef)

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full bg-muted overflow-hidden rounded-md border',
        className
      )}
      style={{
        aspectRatio: `${baseImageWidth} / ${baseImageHeight}`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={baseImageUrl}
        alt="Plantilla del diploma"
        className="absolute inset-0 h-full w-full select-none pointer-events-none"
        draggable={false}
      />

      <TextOverlay
        text={sampleName}
        x={config.nameX}
        y={config.nameY}
        fontFamily={config.nameFontFamily}
        fontWeight={config.nameFontWeight}
        fontSizePct={config.nameFontSize}
        color={config.nameColor}
        maxWidthPct={config.nameMaxWidth}
        anchor={config.nameAnchor}
        containerHeight={containerSize.height}
        draggable={draggable && Boolean(onMoveName)}
        resizable={draggable && Boolean(onResizeName)}
        containerRef={containerRef}
        onMove={onMoveName}
        onResize={onResizeName}
      />

      {config.dateEnabled &&
        sampleDate &&
        config.dateX !== null &&
        config.dateX !== undefined &&
        config.dateY !== null &&
        config.dateY !== undefined &&
        config.dateFontFamily &&
        config.dateFontWeight !== null &&
        config.dateFontWeight !== undefined &&
        config.dateFontSize !== null &&
        config.dateFontSize !== undefined &&
        config.dateColor &&
        config.dateMaxWidth !== null &&
        config.dateMaxWidth !== undefined &&
        config.dateAnchor &&
        config.dateFormat && (
          <TextOverlay
            text={formatDate(sampleDate, config.dateFormat, timezone)}
            x={config.dateX}
            y={config.dateY}
            fontFamily={config.dateFontFamily}
            fontWeight={config.dateFontWeight}
            fontSizePct={config.dateFontSize}
            color={config.dateColor}
            maxWidthPct={config.dateMaxWidth}
            anchor={config.dateAnchor}
            containerHeight={containerSize.height}
            draggable={draggable && Boolean(onMoveDate)}
            resizable={draggable && Boolean(onResizeDate)}
            containerRef={containerRef}
            onMove={onMoveDate}
            onResize={onResizeDate}
          />
        )}
    </div>
  )
}

function useElementSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ width: el.offsetWidth, height: el.offsetHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

type TextOverlayProps = {
  text: string
  x: number
  y: number
  fontFamily: string
  fontWeight: number
  fontSizePct: number
  color: string
  maxWidthPct: number
  anchor: 'left' | 'center' | 'right'
  containerHeight: number
  draggable: boolean
  resizable: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
  onMove?: (x: number, y: number) => void
  onResize?: (next: ResizePayload) => void
}

function TextOverlay({
  text,
  x,
  y,
  fontFamily,
  fontWeight,
  fontSizePct,
  color,
  maxWidthPct,
  anchor,
  containerHeight,
  draggable,
  resizable,
  containerRef,
  onMove,
  onResize,
}: TextOverlayProps) {
  const dragHandlers = useDragOverlay({
    containerRef,
    currentX: x,
    currentY: y,
    onMove: (nx, ny) => onMove?.(nx, ny),
    disabled: !draggable || !onMove,
  })

  // El cálculo de translateX debe matchear el del render Satori para que
  // el preview sea pixel-consistente con el output final.
  const translateX =
    anchor === 'center' ? '-50%' : anchor === 'right' ? '-100%' : '0'
  const textAlign: 'left' | 'center' | 'right' = anchor

  // Mostramos el font-size tal cual lo configura el educator (sin autofit) para
  // que el input de "Tamaño %" tenga efecto inmediato en el preview. Si el texto
  // excede el ancho disponible, se ve recortado por `overflow: hidden` y el
  // educator nota que debe agrandar el ancho. El render Satori del server sí
  // aplica autofit como red de seguridad para que el output final siempre entre.
  const fontSizePx = (fontSizePct / 100) * containerHeight

  return (
    <div
      onPointerDown={draggable ? dragHandlers.onPointerDown : undefined}
      style={{
        position: 'absolute',
        top: `${y}%`,
        left: `${x}%`,
        transform: `translateX(${translateX})`,
        width: `${maxWidthPct}%`,
        fontFamily: fontFamilyToCss(fontFamily),
        fontWeight,
        fontSize: `${fontSizePx}px`,
        lineHeight: 1.1,
        color,
        textAlign,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        cursor: draggable ? 'move' : 'default',
        touchAction: draggable ? 'none' : 'auto',
        userSelect: 'none',
        outline: draggable ? '1px dashed rgba(0,0,0,0.2)' : 'none',
        outlineOffset: '2px',
      }}
    >
      {text}

      {resizable && onResize && (
        <ResizeHandle
          containerRef={containerRef}
          currentFontSize={fontSizePct}
          currentMaxWidth={maxWidthPct}
          onResize={onResize}
        />
      )}
    </div>
  )
}

type ResizeHandleProps = {
  containerRef: React.RefObject<HTMLDivElement | null>
  currentFontSize: number
  currentMaxWidth: number
  onResize: (next: ResizePayload) => void
}

function ResizeHandle({
  containerRef,
  currentFontSize,
  currentMaxWidth,
  onResize,
}: ResizeHandleProps) {
  const handlers = useResizeOverlay({
    containerRef,
    currentFontSize,
    currentMaxWidth,
    onResize,
    dimension: 'width',
  })

  return (
    <span
      onPointerDown={handlers.onPointerDown}
      role="presentation"
      aria-label="Ajustar ancho disponible"
      style={{
        position: 'absolute',
        right: -6,
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'ew-resize',
        touchAction: 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 12,
          height: 12,
          borderRadius: 3,
          background: '#ffffff',
          border: '1.5px solid rgba(0,0,0,0.55)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      />
    </span>
  )
}

function fontFamilyToCss(name: string): string {
  const isSerif =
    name.toLowerCase().includes('playfair') || name.toLowerCase().includes('serif')
  return `"${name}", ${isSerif ? 'serif' : 'sans-serif'}`
}

function formatDate(date: Date, pattern: string, timezone: string): string {
  try {
    const zoned = toZonedTime(date, timezone)
    return format(zoned, pattern, { locale: es })
  } catch {
    return ''
  }
}
