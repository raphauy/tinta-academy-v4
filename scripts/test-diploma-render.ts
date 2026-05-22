/**
 * Script standalone para validar el render del diploma sin DB ni Blob.
 *
 * Uso: pnpm tsx scripts/test-diploma-render.ts
 *
 * Lee docs/enviar-diplomas/Diploma.jpg, le compone el nombre del estudiante
 * (y opcionalmente la fecha) usando un template mock, y escribe los outputs
 * a tmp/diploma-test.{png,pdf} para inspección visual.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { DiplomaTemplate } from '@prisma/client'
import { renderDiploma } from '../src/services/diploma-render-service'

const ROOT = process.cwd()
const BASE_IMAGE_PATH = join(ROOT, 'docs/enviar-diplomas/Diploma.jpg')
const OUT_DIR = join(ROOT, 'tmp')

// Dimensiones reales del Diploma.jpg (confirmadas vía PIL: 1755x1241).
const BASE_WIDTH = 1755
const BASE_HEIGHT = 1241

// Template mock. Las coordenadas son una estimación inicial mirando el diseño
// de Ari; el editor de Fase 2 va a permitir ajustarlas en vivo con drag.
const template: DiplomaTemplate = {
  id: 'test-template',
  courseId: 'test-course',

  baseImageUrl: '',
  baseImageWidth: BASE_WIDTH,
  baseImageHeight: BASE_HEIGHT,

  nameFontFamily: 'Geist',
  nameFontWeight: 700,
  nameFontSize: 7, // % del alto
  nameColor: '#0A0A0A',
  nameX: 46, // % desde izquierda
  nameY: 28, // % desde arriba (zona del nombre)
  nameMaxWidth: 50,
  nameAnchor: 'left',

  // Probamos también con fecha habilitada para validar el segundo overlay.
  dateEnabled: true,
  dateFontFamily: 'Geist',
  dateFontWeight: 500,
  dateFontSize: 2.2,
  dateColor: '#2A2A2A',
  dateX: 46,
  dateY: 40,
  dateMaxWidth: 50,
  dateAnchor: 'left',
  dateFormat: "d 'de' MMMM 'de' yyyy",
  dateMode: 'custom',
  dateCustomValue: new Date('2026-05-28T12:00:00-03:00'),

  createdAt: new Date(),
  updatedAt: new Date(),
}

async function main() {
  console.log('→ Leyendo imagen base:', BASE_IMAGE_PATH)
  const baseImage = readFileSync(BASE_IMAGE_PATH)

  console.log('→ Renderizando diploma para "Lorenzo Musetti"...')
  const { png, pdf } = await renderDiploma({
    baseImage,
    baseImageMime: 'image/jpeg',
    baseImageWidth: BASE_WIDTH,
    baseImageHeight: BASE_HEIGHT,
    template,
    studentName: 'Lorenzo Musetti',
    issuedDate: template.dateCustomValue,
  })

  mkdirSync(OUT_DIR, { recursive: true })
  const pngPath = join(OUT_DIR, 'diploma-test.png')
  const pdfPath = join(OUT_DIR, 'diploma-test.pdf')
  writeFileSync(pngPath, png)
  writeFileSync(pdfPath, pdf)

  console.log(`✓ PNG: ${pngPath} (${(png.length / 1024).toFixed(1)} KB)`)
  console.log(`✓ PDF: ${pdfPath} (${(pdf.length / 1024).toFixed(1)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
