import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { PDFDocument } from 'pdf-lib'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'
import type { DiplomaTemplate } from '@prisma/client'
import { autoFitFontSize } from '@/lib/diploma-autofit'

const FONTS_ROOT = join(process.cwd(), 'public/fonts/diplomas')

type SatoriFont = {
  name: string
  data: Buffer
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  style: 'normal' | 'italic'
}

// Cargadas una sola vez al inicializar el módulo. Reusadas entre invocaciones de Fluid Compute.
const FONTS: SatoriFont[] = [
  {
    name: 'Geist',
    data: readFileSync(join(FONTS_ROOT, 'Geist-Regular.ttf')),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Geist',
    data: readFileSync(join(FONTS_ROOT, 'Geist-Medium.ttf')),
    weight: 500,
    style: 'normal',
  },
  {
    name: 'Geist',
    data: readFileSync(join(FONTS_ROOT, 'Geist-Bold.ttf')),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'Playfair Display',
    data: readFileSync(join(FONTS_ROOT, 'PlayfairDisplay-Regular.ttf')),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'Playfair Display',
    data: readFileSync(join(FONTS_ROOT, 'PlayfairDisplay-Bold.ttf')),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'DM Serif Display',
    data: readFileSync(join(FONTS_ROOT, 'DMSerifDisplay-Regular.ttf')),
    weight: 400,
    style: 'normal',
  },
]

const A4_LANDSCAPE_PT = { width: 842, height: 595 } // A4 horizontal en puntos PDF

export type RenderDiplomaInput = {
  baseImage: Buffer
  baseImageMime: 'image/png' | 'image/jpeg'
  baseImageWidth: number
  baseImageHeight: number
  template: DiplomaTemplate
  studentName: string
  /** Si el template no tiene fecha habilitada, pasar `null` */
  issuedDate: Date | null
  /** IANA timezone para formatear la fecha. Default America/Montevideo. */
  timezone?: string
}

export type RenderDiplomaOutput = {
  png: Buffer
  pdf: Buffer
}

/**
 * Renderiza un diploma: compone el nombre (y opcionalmente la fecha) sobre la
 * imagen base usando Satori, convierte el SVG resultante en PNG con Resvg, y
 * envuelve el PNG en un PDF A4 landscape centrado con padding blanco.
 */
export async function renderDiploma(
  input: RenderDiplomaInput
): Promise<RenderDiplomaOutput> {
  const {
    baseImage,
    baseImageMime,
    baseImageWidth,
    baseImageHeight,
    template,
    studentName,
    issuedDate,
    timezone = 'America/Montevideo',
  } = input

  const jsx = buildJsx({
    baseImage,
    baseImageMime,
    baseImageWidth,
    baseImageHeight,
    template,
    studentName,
    issuedDate,
    timezone,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svg = await satori(jsx as any, {
    width: baseImageWidth,
    height: baseImageHeight,
    fonts: FONTS,
  })

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: baseImageWidth },
  })
  const png = Buffer.from(resvg.render().asPng())
  const pdf = await wrapPngInA4Pdf(png)

  return { png, pdf }
}

// ---------- helpers ----------

type JsxBuilderInput = Omit<
  Required<RenderDiplomaInput>,
  'issuedDate'
> & {
  issuedDate: Date | null
}

function buildJsx(input: JsxBuilderInput) {
  const {
    baseImage,
    baseImageMime,
    baseImageWidth,
    baseImageHeight,
    template,
    studentName,
    issuedDate,
    timezone,
  } = input

  const children: unknown[] = []

  // Background: imagen base como data URI
  const dataUri = `data:${baseImageMime};base64,${baseImage.toString('base64')}`
  children.push({
    type: 'img',
    props: {
      src: dataUri,
      width: baseImageWidth,
      height: baseImageHeight,
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${baseImageWidth}px`,
        height: `${baseImageHeight}px`,
      },
    },
  })

  // Overlay nombre (siempre)
  children.push(
    buildTextOverlay({
      text: studentName,
      x: template.nameX,
      y: template.nameY,
      fontFamily: template.nameFontFamily,
      fontWeight: template.nameFontWeight,
      fontSizePct: template.nameFontSize,
      color: template.nameColor,
      maxWidthPct: template.nameMaxWidth,
      anchor: template.nameAnchor,
      canvasWidth: baseImageWidth,
      canvasHeight: baseImageHeight,
    })
  )

  // Overlay fecha (opcional)
  if (
    template.dateEnabled &&
    issuedDate &&
    template.dateFontFamily &&
    template.dateFontWeight !== null &&
    template.dateFontSize !== null &&
    template.dateColor &&
    template.dateX !== null &&
    template.dateY !== null &&
    template.dateMaxWidth !== null &&
    template.dateAnchor &&
    template.dateFormat
  ) {
    const formatted = formatDiplomaDate(issuedDate, template.dateFormat, timezone)
    children.push(
      buildTextOverlay({
        text: formatted,
        x: template.dateX,
        y: template.dateY,
        fontFamily: template.dateFontFamily,
        fontWeight: template.dateFontWeight,
        fontSizePct: template.dateFontSize,
        color: template.dateColor,
        maxWidthPct: template.dateMaxWidth,
        anchor: template.dateAnchor,
        canvasWidth: baseImageWidth,
        canvasHeight: baseImageHeight,
      })
    )
  }

  return {
    type: 'div',
    props: {
      style: {
        position: 'relative',
        display: 'flex',
        width: `${baseImageWidth}px`,
        height: `${baseImageHeight}px`,
      },
      children,
    },
  }
}

type TextOverlayInput = {
  text: string
  x: number // %
  y: number // %
  fontFamily: string
  fontWeight: number
  fontSizePct: number // % del alto
  color: string
  maxWidthPct: number
  anchor: 'left' | 'center' | 'right'
  canvasWidth: number
  canvasHeight: number
}

/** Mínimo permitido al auto-encoger el texto (proporción del fontSize original). */
const AUTOFIT_MIN_SCALE = 0.5

function buildTextOverlay(input: TextOverlayInput) {
  const baseFontSizePx = (input.fontSizePct / 100) * input.canvasHeight
  const maxWidthPx = (input.maxWidthPct / 100) * input.canvasWidth
  const fontSizePx = autoFitFontSize({
    text: input.text,
    baseFontSize: baseFontSizePx,
    fontWeight: input.fontWeight,
    maxWidth: maxWidthPx,
    minScale: AUTOFIT_MIN_SCALE,
  })

  const textAlign: 'left' | 'center' | 'right' = input.anchor
  // Para mantener consistencia con el preview del editor, anclamos el contenedor
  // en la coordenada (x, y) y dejamos que el contenido fluya con textAlign.
  // El maxWidth limita el ancho disponible.
  const translateX =
    input.anchor === 'center'
      ? '-50%'
      : input.anchor === 'right'
        ? '-100%'
        : '0'

  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        top: `${input.y}%`,
        left: `${input.x}%`,
        transform: `translateX(${translateX})`,
        maxWidth: `${input.maxWidthPct}%`,
        display: 'flex',
        fontFamily: input.fontFamily,
        fontWeight: input.fontWeight,
        fontSize: `${fontSizePx}px`,
        lineHeight: 1.1,
        color: input.color,
        textAlign,
        whiteSpace: 'nowrap',
      },
      children: input.text,
    },
  }
}


function formatDiplomaDate(
  date: Date,
  pattern: string,
  timezone: string
): string {
  const zoned = toZonedTime(date, timezone)
  return format(zoned, pattern, { locale: es })
}

async function wrapPngInA4Pdf(png: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([A4_LANDSCAPE_PT.width, A4_LANDSCAPE_PT.height])
  const image = await pdfDoc.embedPng(png)

  const scale = Math.min(
    A4_LANDSCAPE_PT.width / image.width,
    A4_LANDSCAPE_PT.height / image.height
  )
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale

  page.drawImage(image, {
    x: (A4_LANDSCAPE_PT.width - drawWidth) / 2,
    y: (A4_LANDSCAPE_PT.height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  })

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
