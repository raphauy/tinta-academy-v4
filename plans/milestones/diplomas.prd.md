# PRD: Sistema de Diplomas

## Resumen Ejecutivo

Este milestone implementa la generación y entrega de diplomas de finalización para los cursos no-WSET de Tinta Academy. El educador configura una plantilla por curso (imagen base + posición de variables) y dispara manualmente la generación y el envío por email a los estudiantes inscriptos. El estudiante recibe el diploma por email y también puede descargarlo desde su panel.

Caso de uso disparador: el taller **"Uruguay en vinos"** del jueves 28 de mayo de 2026; Gabi quiere enviar los diplomas el día siguiente al taller.

---

## Objetivos

- Permitir a los educadores configurar y emitir diplomas profesionales sin intervención manual de diseño por estudiante.
- Respetar el diseño visual de Ari (imagen base completa, nosotros componemos solo nombre y fecha).
- Dejar base reutilizable para futuras extensiones (aprobación, asistencia, verificación pública por QR).

---

## Alcance

### Incluido (v1)

- CRUD de **plantilla de diploma** (1 por curso): imagen base + configuración de variables.
- **Variables soportadas**: nombre del estudiante (obligatorio) y fecha (opcional).
- **Editor del educador** con drag-to-reposition de overlays sobre preview + inputs numéricos de precisión.
- **Generación** de diploma por estudiante en PNG (Satori + resvg) y PDF (pdf-lib, A4 landscape).
- **Flujo de envío de 2 pasos**: generar para revisar → confirmar y enviar.
- **Envío por email** (Resend + React Email) con PDF adjunto, PNG embebido inline y link al panel.
- **Descarga desde el panel del estudiante** (sección en `/student/courses/[id]` + card en `/student`).
- **Idempotencia**: solo envía a estudiantes sin emisión previa.
- **Reenvío individual** por fila desde la lista de emisiones del educator.
- **Regeneración explícita** mediante botón si el educator edita la plantilla después de la primera emisión.

### Excluido (v1, para futuro)

- Cursos WSET (los emite WSET London).
- Diplomas condicionados a aprobación de examen o asistencia.
- Disparo automático vía workflow (course_end + offset).
- Generación dinámica de QR por diploma con página de verificación pública.
- Upload de fuentes custom por el educador (solo set fijo).
- Variables adicionales (título del curso, horas, firma) más allá de nombre y fecha.
- Edición masiva de plantillas entre cursos (clonar/duplicar).

---

## Stack técnico

| Pieza | Tecnología |
|---|---|
| Render de imagen | `satori` + `@resvg/resvg-js` (SVG → PNG) |
| PDF | `pdf-lib` (envuelve el PNG en A4 landscape) |
| Storage de plantilla y assets generados | Vercel Blob |
| Fuentes | Set fijo precargado en `public/fonts/diplomas/` (incluye Geist) |
| Email | Resend + React Email |
| Compute | Vercel Fluid Compute Pro (timeout 800s, suficiente para batches MVP ~20-100 estudiantes) |

**Por qué Satori + resvg** (alternativas evaluadas: `sharp` composite, `@vercel/og`, PDF templating): permite preview en navegador HTML/CSS pixel-perfect al render server-side (mejor UX para configurar posición), comparte stack mental con `onmind-marketing`, y deja path claro para variables adicionales en el futuro.

---

## Modelos de Datos

### Nuevas tablas en Prisma

```prisma
// ==========================================
// PLANTILLA DEL DIPLOMA (por curso)
// ==========================================

model DiplomaTemplate {
  id               String   @id @default(cuid())

  courseId         String   @unique
  course           Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  // Imagen base (Vercel Blob)
  baseImageUrl     String
  baseImageWidth   Int      // pixels reales (para escalar el preview)
  baseImageHeight  Int

  // Configuración del nombre (siempre activo)
  nameFontFamily   String   @default("Geist")
  nameFontWeight   Int      @default(700)
  nameFontSize     Float    // % del alto de la imagen base (DPI-independent)
  nameColor        String   @default("#0A0A0A")
  nameX            Float    // % horizontal (0-100)
  nameY            Float    // % vertical (0-100)
  nameMaxWidth     Float    @default(50) // % del ancho — auto-shrink si excede
  nameAnchor       String   @default("left") // left | center | right (v1 = "left")

  // Configuración de la fecha (opcional)
  dateEnabled      Boolean  @default(false)
  dateFontFamily   String?
  dateFontWeight   Int?
  dateFontSize     Float?
  dateColor        String?
  dateX            Float?
  dateY            Float?
  dateFormat       String?  @default("d 'de' MMMM 'de' yyyy") // date-fns
  dateMode         DiplomaDateMode @default(last_class)
  dateCustomValue  DateTime?  // usado si dateMode = custom

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  // Relations
  issues           DiplomaIssue[]

  @@index([courseId])
}

// ==========================================
// EMISIÓN DEL DIPLOMA (1 por curso+estudiante)
// ==========================================

model DiplomaIssue {
  id           String   @id @default(cuid())

  courseId     String
  course       Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)

  studentId    String
  student      Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)

  enrollmentId String
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])

  templateId   String
  template     DiplomaTemplate @relation(fields: [templateId], references: [id])

  // Snapshot congelado al momento de generar
  studentName  String   // ej. "Juan López"
  issuedDate   DateTime // fecha que figura en el diploma (resuelta al generar)
  emailTo      String   // email destino al momento de envío

  // Assets en Vercel Blob (se sobreescriben si se regenera)
  pngUrl       String?
  pdfUrl       String?

  // Estado
  status       DiplomaStatus @default(pending)
  errorMessage String?

  // Tracking de envío
  resendId     String?
  generatedAt  DateTime?
  sentAt       DateTime?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([courseId, studentId])
  @@index([courseId])
  @@index([studentId])
  @@index([enrollmentId])
  @@index([templateId])
  @@index([status])
  @@index([resendId])
}

enum DiplomaStatus {
  pending      // creado, sin asset todavía
  generating   // generando PNG/PDF
  generated    // assets en Blob, sin enviar
  sending      // enviando por Resend
  sent         // enviado OK
  failed       // error en generación o envío (ver errorMessage)
}

enum DiplomaDateMode {
  last_class   // max(classDates) → endDate → startDate
  custom       // usa dateCustomValue
}
```

### Relaciones agregadas en modelos existentes

```prisma
model Course {
  // ...
  diplomaTemplate DiplomaTemplate?
  diplomaIssues   DiplomaIssue[]
}

model Student {
  // ...
  diplomaIssues DiplomaIssue[]
}

model Enrollment {
  // ...
  diplomaIssues DiplomaIssue[]  // 0..1, garantizado por @@unique en DiplomaIssue
}
```

---

## Reglas de negocio

### Elegibilidad

- **Cursos elegibles**: `CourseType` ∈ {`taller`, `cata`, `curso`, `experiencia`}. Se excluye `wset`.
- **Modalidades**: todas (`presencial`, `online`, `webinar`).
- **Estudiantes elegibles**: aquellos con `Enrollment.status = confirmed` en el curso al momento del disparo.
- Un curso sin `DiplomaTemplate` no muestra ninguna acción de diploma (ni al educator ni al student).

### Resolución de la fecha

- `dateMode = last_class`: `issuedDate = max(course.classDates)` → fallback `course.endDate` → fallback `course.startDate`.
- `dateMode = custom`: `issuedDate = template.dateCustomValue`.
- La fecha es **la misma para todos los estudiantes** de un mismo curso. Se resuelve al generar y se snapshotea en cada `DiplomaIssue.issuedDate`.
- Si al guardar plantilla con `last_class` el curso no tiene ninguna fecha cargada (`classDates`, `endDate`, `startDate` todos vacíos), el formulario rechaza el guardado con error: *"Configurá las fechas del curso primero o elegí una fecha personalizada"*.

### Snapshot e inmutabilidad

- `DiplomaIssue.studentName` y `DiplomaIssue.issuedDate` se snapshotean al generar el diploma por primera vez.
- Cualquier **regeneración explícita** posterior (acción "Reenviar" por fila, "Regenerar diplomas" global, o "Reintentar fallidos") **re-resuelve** `studentName` (regla del glosario) y `issuedDate` (`resolveDiplomaDate`) desde Student/User/Course en ese momento, y actualiza los valores en `DiplomaIssue`. El email ya entregado no se modifica retroactivamente.
- Si el educator edita la `DiplomaTemplate` después de emisiones, los assets en Blob **no se regeneran** automáticamente. Aparece botón explícito **"Regenerar diplomas"** en la lista (regenera assets para todos los issues del curso, opcionalmente reenvía).

### Idempotencia del envío

- El botón principal **"Enviar diplomas"** procesa solo estudiantes elegibles que aún no tienen `DiplomaIssue` con `status` ∈ {`generated`, `sending`, `sent`}.
- Si entra un nuevo enrollment confirmado después del primer envío, el botón lo incluye en una segunda ronda.
- El reenvío individual (botón "Reenviar" por fila) regenera y reenvía a un único estudiante.

### Errores

- Cada `DiplomaIssue` es independiente. Si la generación o envío de uno falla, queda con `status = failed` + `errorMessage`, y el batch continúa.
- La lista de emisiones del educator muestra los `failed` con CTA **"Reintentar"** que vuelve a intentar solo los fallidos.

---

## Permisos y roles

| Acción | superadmin | educator dueño | otro educator | student |
|---|---|---|---|---|
| Configurar plantilla del curso | ✅ | ✅ | ❌ | ❌ |
| Disparar generación / envío | ✅ | ✅ | ❌ | ❌ |
| Reenviar / regenerar | ✅ | ✅ | ❌ | ❌ |
| Ver lista de emisiones | ✅ | ✅ | ❌ | ❌ |
| Descargar su propio diploma | ✅ (si aplica) | ❌ | ❌ | ✅ |

El middleware `src/proxy.ts` ya cubre la separación de paneles por rol. La autorización fina (`educator dueño`) la valida cada server action contra `course.educatorId`.

---

## Flujos principales

### Flujo 1 — Configurar plantilla (educator)

1. En el detalle del curso (`/educator/courses/[id]/edit` o pestaña dedicada), nueva sección **"Diploma"**.
2. Si no hay `DiplomaTemplate`: botón **"Configurar diploma"**.
3. Editor (ver sección UX más abajo):
   - Upload de imagen base a Vercel Blob.
   - Drag de overlays sobre preview + inputs numéricos.
   - Selección de fuente desde set fijo + tamaño (slider) + color (picker).
   - Toggle de fecha + modo (`last_class` / `custom`) + formato.
4. Guardar valida que la fecha sea resoluble si `dateMode = last_class`.

### Flujo 2 — Generar para revisar (educator)

1. Botón **"Generar diplomas para revisar"** (solo aparece si existe plantilla y hay enrollments confirmados pendientes).
2. Modal de confirmación: *"Se generarán N diplomas. Puede tardar X-Y segundos."*
3. Server action arranca: crea `DiplomaIssue` con `status = pending` para cada estudiante, dispara loop de generación (status pasa por `generating → generated`).
4. La UI polea cada 2s un endpoint que devuelve `{ pending, generating, generated, failed, total }` y dibuja progress bar.
5. Al terminar: **grid de thumbnails** con los N diplomas. Educator puede:
   - Click en un thumbnail → vista ampliada.
   - "Volver al editor" → descarta el lote (borra `DiplomaIssue` con status ∈ {`generated`, `failed`}, vuelve al editor para ajustar).
   - "Confirmar y enviar".

### Flujo 3 — Enviar emails (educator)

1. Botón **"Confirmar y enviar"** desde el grid.
2. Modal con lista de destinatarios.
3. Server action itera: por cada `DiplomaIssue` con `status = generated`: `sending → sent` (o `failed` con `errorMessage`).
4. Progress bar análogo al flujo 2.
5. Resumen final con éxitos / fallos + botón **"Reintentar fallidos"**.

### Flujo 4 — Estudiante recibe y descarga

1. Email entra a la inbox del estudiante con asunto *"¡Tu diploma de [Curso] está listo!"*.
2. Body breve y cálido: saludo + 1 párrafo de felicitación + PNG embebido inline + CTA **"Descargar PDF"** (apunta a Blob URL) + link al panel.
3. PDF adjunto.
4. En `/student`: card destacada *"Tu diploma de X está listo"* (se muestra si hay `DiplomaIssue.sent` reciente).
5. En `/student/courses/[id]`: sección **"Tu diploma"** con botones de descarga PNG y PDF.

### Flujo 5 — Reenvío individual / regeneración (educator)

- En la lista de emisiones del curso, cada fila tiene acciones:
  - **Reenviar** (solo si `status = sent` o `failed`): regenera asset y reenvía.
  - **Descargar PNG / PDF** (si hay asset).
  - **Reintentar** (si `status = failed`): vuelve a intentar la última etapa fallida.
- Botón global **"Regenerar diplomas"** sobreescribe los assets de todas las emisiones del curso (no reenvía emails salvo confirmación adicional).

---

## UX del editor de plantilla

Layout 2 columnas:

```
┌─────────────────────────────┬───────────────────────────────┐
│                             │  IMAGEN BASE                  │
│                             │  [Subir / Cambiar]            │
│   PREVIEW (clickeable,      │                               │
│   drag-and-drop de los      │  NOMBRE DEL ALUMNO            │
│   overlays "nombre" y       │  Fuente: [Geist Bold ▼]       │
│   "fecha")                  │  Tamaño: [────●──] (% alto)   │
│                             │  Color:  [⬛ #0A0A0A]          │
│   Nombre de muestra:        │  Pos X:  45 %   Pos Y: 28 %   │
│   [Juan López           ]   │  Ancho máx: 50 %              │
│                             │                               │
│                             │  FECHA                        │
│                             │  ☐ Mostrar                    │
│                             │  Fuente / tamaño / color / xy │
│                             │  Modo: ● Última clase         │
│                             │        ○ Personalizada [📅]   │
│                             │  Formato: [d 'de' MMM yyyy ▼] │
│                             │                               │
│                             │  [Guardar plantilla]          │
└─────────────────────────────┴───────────────────────────────┘
```

- Coordenadas y tamaño de fuente en **% de la imagen base** para independencia de DPI.
- El preview usa el mismo CSS que el render Satori para mantener fidelidad.
- Fuentes precargadas: **Geist** (incluida sí o sí, matchea el diseño de Ari), más 2-3 fuentes adicionales para variedad (TBD en fase 1: probablemente Playfair Display y DM Serif Display).
- Nombre de muestra ingresable para probar nombres largos.

---

## Email del diploma

- **Asunto**: `¡Tu diploma de [Curso] está listo!`
- **Tono**: cálido y breve.
- **Estructura**:
  1. Saludo personalizado (*"Hola Juan,"*).
  2. Un párrafo de felicitación referenciando el curso.
  3. Diploma PNG embebido inline (centrado, ancho ~600px).
  4. CTA: **"Descargar PDF"** → link a `pdfUrl` en Blob.
  5. Link de fallback al panel del estudiante.
  6. Firma de Tinta Academy.
- **Adjuntos**: PDF.
- Plantilla nueva en `src/components/emails/diploma-ready.tsx`.
- Header reutiliza `email-header.tsx` existente.

---

## Consideraciones técnicas

### Performance y timeouts

- Vercel Fluid Compute Pro: 800s de timeout, suficiente para batches MVP.
- Estimación: ~1-2s por diploma (descarga imagen base + render Satori + Resvg + upload Blob).
- Para Uruguay en vinos (~20 estudiantes): ~30-40s generación + ~10s envío = bajo el límite con margen.
- Server actions de generación/envío ejecutan en una sola Function invocation. Si la cantidad supera lo razonable (~200), una fase futura puede pasarlo a Vercel Queues.
- El cliente polea status cada 2s contra `getCourseDiplomaProgress(courseId)`.

### Almacenamiento

- Imagen base: `diploma-templates/{courseId}/base.{ext}` en Blob.
- Assets generados: `diploma-issues/{issueId}/diploma.png` y `diploma-issues/{issueId}/diploma.pdf`.
- Regenerar sobrescribe los mismos paths.

### Fuentes

- Bajadas a `public/fonts/diplomas/`. Versionadas en repo.
- Cargadas server-side con `fs.readFileSync` al inicializar el render service (cacheable in-memory entre invocaciones de Fluid Compute).

### Validaciones (zod)

- `diplomaTemplateSchema`: imagen subida con dimensiones reales > 0, coordenadas en [0, 100], maxWidth en (0, 100], color hex válido, fontSize > 0, fontFamily ∈ set permitido.
- Si `dateEnabled = true`: todos los campos `date*` son requeridos. Si `dateMode = custom`: `dateCustomValue` requerido.

---

## Capa de Servicios

Nuevos archivos en `src/services/`:

- **`diploma-template-service.ts`**: CRUD de `DiplomaTemplate` (upsert, get por curso, delete). Resolución de fecha (`resolveDiplomaDate(course, template)`).
- **`diploma-render-service.ts`**: render del PNG con Satori + resvg y envoltura PDF con pdf-lib. Carga de fuentes en memoria. Sin acceso a Prisma.
- **`diploma-service.ts`**: orquestación del flujo. Crea `DiplomaIssue` para enrollments elegibles, dispara render por issue, sube assets a Blob, dispara envío vía `email-service`, actualiza estados. Punto único de mutación de `DiplomaIssue`.

---

## Server Actions (educator)

Ubicación: `src/app/educator/courses/[id]/diploma/actions.ts`.

Todas devuelven `ActionResult<T>`. Verifican `educatorId` del curso contra session.

- `upsertDiplomaTemplateAction(courseId, data)` — crear/actualizar plantilla.
- `uploadDiplomaBaseImageAction(courseId, formData)` — subir imagen base a Blob.
- `deleteDiplomaTemplateAction(courseId)` — eliminar plantilla (también borra emisiones si no hay enviadas; si hay, bloquea).
- `generateDiplomasAction(courseId)` — generar para todos los enrollments confirmados sin issue previa.
- `sendDiplomasAction(courseId)` — envía emails para issues con `status = generated`.
- `regenerateDiplomasAction(courseId)` — regenera assets de todas las issues existentes del curso.
- `resendDiplomaAction(issueId)` — reenvía 1 issue.
- `retryFailedDiplomasAction(courseId)` — reintenta fallidos.
- `getDiplomaProgressAction(courseId)` — counts por status para polling.

---

## Páginas y componentes (UI)

### Educator

- `src/app/educator/courses/[id]/diploma/page.tsx` — vista principal (template editor + lista de emisiones + acciones).
- `src/components/educator/diplomas/template-editor.tsx` — editor con preview drag-and-drop.
- `src/components/educator/diplomas/diploma-preview.tsx` — preview compartido entre editor y grid.
- `src/components/educator/diplomas/diploma-issues-list.tsx` — tabla de emisiones con acciones por fila.
- `src/components/educator/diplomas/generation-progress.tsx` — progress bar con polling.

### Student

- Modificación de `src/app/student/courses/[id]/page.tsx` (o componente correspondiente) — sección "Tu diploma" con descargas.
- Modificación de `src/components/student/student-dashboard.tsx` — card destacada cuando hay emisión reciente.

### Emails

- `src/components/emails/diploma-ready.tsx` — plantilla React Email.

---

## Fases tentativas

1. **Fase 1 — Fundamentos**: schema Prisma + migración, fuentes en `public/fonts/diplomas/`, validaciones zod, glosario.
2. **Fase 2 — Servicios de render**: `diploma-render-service` (Satori + resvg + pdf-lib) probado standalone con script.
3. **Fase 3 — Servicios de orquestación**: `diploma-template-service` + `diploma-service` (sin UI todavía).
4. **Fase 4 — Editor de plantilla (educator)**: server actions de template + UI del editor con drag + upload Blob + preview.
5. **Fase 5 — Flujo generar y revisar**: server actions de generación + grid de thumbnails + progress bar con polling.
6. **Fase 6 — Flujo enviar emails**: template React Email + integración Resend + server action de envío + resumen final.
7. **Fase 7 — Panel student + reenvíos**: sección curso + card dashboard + reenvíos individuales + regenerar.

---

## Glosario

Ver `docs/glosario.md` sección **Diplomas** para definiciones canónicas de:
- Diploma
- Plantilla de diploma (`DiplomaTemplate`)
- Emisión de diploma (`DiplomaIssue`)
- Variables del diploma
- Fecha de última clase
- Cursos elegibles
- Inscripción confirmada
