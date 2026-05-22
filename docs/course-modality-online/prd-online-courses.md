# PRD: Modalidad Online (E-learning con Videos Grabados)

**Fecha:** 2026-03-23
**Estado:** Draft
**Referencia visual:** `docs/course-modality-online/reference-screenshots/`
**Research de video hosting:** `docs/course-modality-online/video-services-comparison.md`

---

## 1. Visión General

Agregar soporte completo para cursos online grabados en video a la plataforma Tinta Academy. Los cursos online se organizan en **Módulos > Lecciones**, donde cada lección contiene un video, descripción, materiales opcionales y espacio para comentarios. La experiencia del estudiante es un player fullscreen dedicado con sidebar de navegación, similar a plataformas modernas de e-learning.

### Objetivos

- Permitir a los educadores crear y gestionar cursos online con contenido en video
- Ofrecer una experiencia de aprendizaje moderna, atractiva y funcional para los estudiantes
- Soportar cursos gratuitos y pagados con lecciones de preview
- Tracking de progreso automático y manual
- Integrar los cursos online naturalmente en el catálogo existente junto a las otras modalidades

### Fuera de alcance (futuro)

- Certificados al completar el curso
- Analytics del educador (vistas por video, progreso por estudiante)
- Transcripciones de video
- DRM (Digital Rights Management)
- Suscripción/acceso a todos los cursos (cada curso es individual)

---

## 2. Video Hosting: Mux

**Decisión:** Usar **Mux** como servicio de video hosting.

**Razones:**
- Free tier generoso: 100k minutos de delivery/mes y 10 videos almacenados gratis
- Mejor DX del mercado: SDK Node.js oficial (`@mux/mux-node`), componente React oficial (`@mux/mux-player-react`), guías para Next.js
- Encoding instantáneo (JIT): videos disponibles en segundos
- Webhooks bien documentados para flujos de procesamiento
- Upload directo desde browser con `@mux/mux-uploader-react`
- Analytics de reproducción integrados en el player

**Protección de contenido:**
- Signed playback tokens (JWT) con TTL corto generados server-side
- Solo estudiantes con matrícula activa (o lecciones marcadas como preview) obtienen tokens válidos
- Sin DRM en esta fase; los signed tokens son suficientes para la etapa actual

**Dependencias npm:**
- `@mux/mux-node` - SDK server-side
- `@mux/mux-player-react` - Componente React del player
- `@mux/mux-uploader-react` - Componente de upload para educadores

**Variables de entorno:**
- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_SIGNING_KEY_ID` (para signed playback tokens)
- `MUX_SIGNING_KEY_PRIVATE` (para signed playback tokens)
- `MUX_WEBHOOK_SECRET`

---

## 3. Modelo de Datos

### Nuevos modelos

```prisma
model CourseModule {
  id       String @id @default(cuid())
  courseId  String
  title    String
  order    Int    @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course  Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons Lesson[]

  @@index([courseId])
  @@index([order])
}

model Lesson {
  id       String  @id @default(cuid())
  moduleId String
  title    String
  slug     String
  summary  String? @db.Text  // Descripción "About This Video" + "What You'll Learn"
  order    Int     @default(0)

  // Video (Mux)
  muxAssetId    String?   // Mux Asset ID
  muxPlaybackId String?   // Mux Playback ID
  muxUploadId   String?   // Mux Upload ID (durante el proceso de subida)
  videoDuration Int?      // Duración en segundos (se obtiene del webhook de Mux)
  videoStatus   VideoStatus @default(pending) // Estado del procesamiento del video

  // Acceso
  isFree Boolean @default(false) // true = desbloqueada para todos (preview en cursos pagados)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  module    CourseModule      @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  materials LessonMaterial[]
  progress  LessonProgress[]
  comments  LessonComment[]

  @@unique([moduleId, slug])
  @@index([moduleId])
  @@index([order])
}

model LessonMaterial {
  id       String @id @default(cuid())
  lessonId String
  name     String
  url      String
  type     MaterialType // Reusar enum existente: link, image, document, video, other
  order    Int    @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@index([lessonId])
  @@index([order])
}

model LessonProgress {
  id       String @id @default(cuid())
  lessonId String
  studentId String

  progressSeconds Int      @default(0)  // Hasta qué segundo del video llegó
  completed       Boolean  @default(false)
  completedAt     DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lesson  Lesson  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([lessonId, studentId])
  @@index([lessonId])
  @@index([studentId])
}

model LessonComment {
  id       String  @id @default(cuid())
  lessonId String
  userId   String
  parentId String? // null = comentario raíz, con valor = reply

  body String @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lesson  Lesson          @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  user    User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent  LessonComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies LessonComment[] @relation("CommentReplies")

  @@index([lessonId])
  @@index([userId])
  @@index([parentId])
}
```

### Nuevo enum

```prisma
enum VideoStatus {
  pending      // Sin video subido
  uploading    // Upload en progreso
  processing   // Mux está procesando/codificando
  ready        // Video listo para reproducir
  errored      // Error en el procesamiento
}
```

### Modificaciones a modelos existentes

```prisma
// User - agregar relación
model User {
  // ... campos existentes
  lessonComments LessonComment[]
}

// Student - agregar relación
model Student {
  // ... campos existentes
  lessonProgress LessonProgress[]
}

// Course - agregar relación
model Course {
  // ... campos existentes
  modules CourseModule[]
}
```

### Defaults para lecciones desbloqueadas

Cuando un educador crea un curso online pagado:
- La **primera lección del primer módulo** se marca como `isFree: true` por defecto
- El educador puede cambiar esto manualmente para cualquier lección
- En cursos gratuitos (`priceUSD: 0`), todas las lecciones son accesibles sin importar el campo `isFree`

---

## 4. Experiencia del Estudiante

### 4.1 Acceso al curso online

**Flujo de navegación:**

1. **Catálogo/Landing** - Card del curso online en el catálogo, integrada con las otras modalidades
2. **Página de detalle del curso** - Información completa, curriculum visible, botón de compra o acceso
3. **Player fullscreen** - Layout dedicado que ocupa toda la pantalla, separado del shell normal de Tinta Academy

**Reglas de acceso:**
- Curso gratuito: cualquier estudiante registrado accede a todas las lecciones
- Curso pagado sin comprar: solo puede ver las lecciones marcadas como `isFree`; las demás muestran candado
- Curso pagado comprado: acceso completo a todas las lecciones, de por vida

### 4.2 Layout del Player (Desktop)

```
+---------------------------+--------------------------------------------------+
|      SIDEBAR (280px)      |                   MAIN CONTENT                   |
|                           |                                                  |
| [Logo Tinta Academy]      | Título de la Lección              [Mark as Complete]
| Your Progress    12/45    |                  5:30                            |
| [=========>------]        | Módulo > Lección (breadcrumb con dropdowns)       |
| [🔍 Buscar lecciones...] | [Tab Módulo 1] [Tab Módulo 2] [Tab Módulo 3] ... |
|                           |                                                  |
| CONTENIDO DEL CURSO       | +----------------------------------------------+ |
|                           | |                                              | |
| ▼ Módulo 1         3/8   | |              VIDEO PLAYER (Mux)              | |
|   ✅ Lección 1     3:35  | |                                              | |
|   ✅ Lección 2     2:26  | |    Play | 0:00 / 5:30 | Vol | Speed | FS    | |
|   ● Lección 3      8:04  | +----------------------------------------------+ |
|   ○ Lección 4     12:08  |                                                  |
|   🔒 Lección 5    13:10  | ← Previous Lesson              Next Video →      |
|                           |                                                  |
| ▶ Módulo 2         0/12  | [Summary]  [Discussion]  [Transcripts]           |
| ▶ Módulo 3         0/5   |                                                  |
|                           | About This Video                                 |
| [🏠 Volver]              | Lorem ipsum dolor sit amet...                    |
|                           |                                                  |
|                           | What You'll Learn                                |
|                           | • Punto 1                                        |
|                           | • Punto 2                                        |
|                           |                                                  |
|                           | 📎 Materials                                     |
|                           | [📄 Guía PDF] [📄 Slides]                       |
+---------------------------+--------------------------------------------------+
```

### 4.3 Sidebar

**Header del sidebar:**
- Logo de Tinta Academy (link a home)
- Progreso global: "Tu Progreso X/Y" con barra de progreso visual
- Buscador de lecciones (filtra por nombre)

**Lista de módulos:**
- Cada módulo muestra: título, badge con progreso (ej: "3/8"), flecha expandir/colapsar
- Al expandir un módulo se ven sus lecciones:
  - **Check verde** - lección completada
  - **Círculo relleno (activa)** - lección actual
  - **Círculo vacío** - lección pendiente
  - **Candado** - lección bloqueada (PRO/pagada)
  - Debajo del nombre: duración del video (ej: "8:04")
- La lección activa tiene fondo destacado
- Click en una lección navega a ella

**Footer del sidebar:**
- Botón "Volver" que regresa a Tinta Academy (dashboard del estudiante o página del curso)

### 4.4 Header de la lección

- **Título de la lección** + duración
- **Botón "Marcar como completada" / "Completada"** (toggle)
- **Breadcrumb:** Módulo (dropdown con lista de módulos y progreso) > Lección (dropdown con lecciones del módulo actual, numeradas, con estado)
- **Tabs horizontales de módulos** para navegación rápida entre módulos (con scroll horizontal si hay muchos)

### 4.5 Video Player

- Componente `<MuxPlayer />` con signed playback token
- **Controles:** play/pause, barra de progreso, volumen, velocidad (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x), fullscreen
- **Tracking automático de progreso:**
  - `onTimeUpdate` con debounce guarda `progressSeconds` en la DB cada ~15 segundos
  - Cuando el video llega al 90% de su duración, se marca automáticamente como completado
  - El estudiante puede desmarcar/marcar manualmente con el botón del header
- **Lección bloqueada:** en lugar del video, mostrar un overlay con mensaje "Esta lección requiere acceso al curso" y botón de compra

### 4.6 Navegación entre lecciones

- **Botón "Previous Lesson"** - va a la lección anterior (disabled en la primera)
- **Botón "Next Video"** - va a la siguiente lección (disabled en la última)
- La navegación es libre: el estudiante puede saltar a cualquier lección desbloqueada sin restricción de orden

### 4.7 Tabs debajo del video

**Tab Summary:**
- Sección "Acerca de este video" - texto descriptivo de la lección
- Sección "Qué aprenderás" - lista de puntos
- Sección "Materiales" - archivos adjuntos descargables (PDFs, slides, etc.)

**Tab Discussion:**
- Textarea para comentar (con avatar del usuario)
- Lista de comentarios ordenados por más reciente
- Cada comentario: avatar, nombre, fecha relativa, texto, botón Reply
- Replies anidados (un nivel)
- **Notificación por email al educador** cuando un estudiante comenta (no cuando el educador comenta)

**Tab Transcripts:**
- Mensaje placeholder: "Esta funcionalidad estará disponible próximamente"

### 4.8 Mobile

- El sidebar se oculta y se accede mediante un botón **"Navegación"** (ícono hamburguesa) en la parte superior
- Al presionarlo, el sidebar se abre como **drawer/overlay** desde la izquierda (no ocupa el 100% del ancho, se ve el contenido detrás)
- Botón X para cerrar el drawer
- Sin tabs horizontales de módulos en el header (solo breadcrumb)
- Video, botones prev/next y tabs se apilan verticalmente

---

## 5. Página Pública del Curso Online

### 5.1 Card en el catálogo

La card de un curso online en la landing/catálogo debe integrarse con las cards de otros tipos de curso, mostrando:

- Imagen del curso
- Badge de modalidad: "Online" (diferenciado visualmente de "Presencial" y "Webinar")
- Título del curso
- Nombre del educador
- Info resumida: "X módulos · Y lecciones · Z horas de contenido"
- Precio (o "Gratis")
- Estado del curso (enrolling, available, etc.)

### 5.2 Página de detalle del curso

Información completa del curso:

- Imagen/hero del curso
- Título, descripción, educador
- Precio y botón de compra (o "Acceder" si es gratis o ya comprado)
- **Curriculum visible:** lista de módulos con sus lecciones
  - Lecciones de preview marcadas con "Gratis" o "Preview"
  - Lecciones bloqueadas con candado
  - Duración de cada lección
- Info general: total de módulos, lecciones, horas de contenido
- Tags del curso

### 5.3 Transición al player

Cuando el estudiante hace click en "Acceder al curso" o en una lección de preview:
- Se abre el player fullscreen en una ruta dedicada (ej: `/learn/[courseSlug]/[lessonSlug]`)
- El layout es completamente diferente al shell normal de Tinta Academy
- Botón "Volver" en el sidebar para regresar

---

## 6. Panel del Educador

### 6.1 Creación/Edición del curso online

El educador gestiona el curso online desde su panel. La UI debe ser intuitiva y bien trabajada.

**Flujo de creación:**

1. Crear curso (tipo + modalidad online) con datos básicos: título, descripción, imagen, precio, tags
2. Gestionar módulos: crear, reordenar (drag & drop o flechas), editar, eliminar
3. Gestionar lecciones dentro de cada módulo: crear, reordenar, editar, eliminar
4. Para cada lección: subir video, escribir summary, adjuntar materiales, marcar como preview

**Gestión de módulos:**
- Crear módulo con título
- Reordenar módulos
- Editar título del módulo
- Eliminar módulo (con confirmación, elimina todas sus lecciones)

**Gestión de lecciones:**
- Crear lección con título (se genera slug automáticamente)
- **Subir video** usando `<MuxUploader />` con indicador de progreso
- Estados del video visibles: "Sin video", "Subiendo...", "Procesando...", "Listo", "Error"
- Escribir/editar summary (editor de texto)
- Adjuntar materiales (upload a Vercel Blob)
- Toggle "Lección de preview" (`isFree`)
- Reordenar lecciones dentro del módulo
- Eliminar lección (con confirmación)

**Defaults inteligentes:**
- Al crear la primera lección del primer módulo en un curso pagado, se marca automáticamente como `isFree: true`
- El educador puede cambiar esto en cualquier momento

### 6.2 Vista previa

El educador puede previsualizar cómo se ve el curso desde la perspectiva del estudiante (funcionalidad "View as" existente).

---

## 7. Integraciones Técnicas

### 7.1 Mux Webhooks

Endpoint: `/api/webhooks/mux`

Eventos a manejar:

| Evento | Acción |
|---|---|
| `video.asset.ready` | Actualizar `videoStatus` a `ready`, guardar `muxPlaybackId` y `videoDuration` |
| `video.asset.errored` | Actualizar `videoStatus` a `errored` |
| `video.upload.asset_created` | Actualizar `muxAssetId` en la lección |

### 7.2 Signed Playback Tokens

```typescript
// Server action - genera token solo si el estudiante tiene acceso
async function getPlaybackToken(lessonId: string): Promise<string | null> {
  // 1. Verificar que el usuario está autenticado
  // 2. Verificar que la lección existe
  // 3. Si la lección es isFree o el curso es gratuito -> generar token
  // 4. Si el curso es pagado -> verificar enrollment activo -> generar token
  // 5. Token con TTL de 4 horas
}
```

### 7.3 Tracking de progreso

```typescript
// Server action - llamada con debounce desde el player
async function saveProgress(lessonId: string, progressSeconds: number): Promise<void> {
  // 1. Upsert en LessonProgress
  // 2. Si progressSeconds >= 90% de videoDuration -> marcar completed automáticamente
}

// Server action - toggle manual
async function toggleLessonComplete(lessonId: string): Promise<void> {
  // Toggle el campo completed en LessonProgress
}
```

### 7.4 Notificación de comentarios

Cuando un estudiante comenta en una lección:
- Enviar email al educador del curso usando el sistema de email existente (Resend)
- No enviar cuando el educador es quien comenta
- Template de email con: nombre del estudiante, nombre de la lección, texto del comentario, link al comentario

---

## 8. Rutas

### Nuevas rutas

| Ruta | Descripción | Acceso |
|---|---|---|
| `/learn/[courseSlug]` | Redirect a la primera lección (o última vista) | Estudiante matriculado / preview |
| `/learn/[courseSlug]/[lessonSlug]` | Player de la lección | Estudiante matriculado / lección free |
| `/educator/courses/[id]/modules` | Gestión de módulos y lecciones | Educador owner |
| `/api/webhooks/mux` | Webhook de Mux | Público (verificado con secret) |

### Rutas existentes modificadas

| Ruta | Modificación |
|---|---|
| `/cursos/[slug]` | Mostrar curriculum para cursos online |
| `/educator/courses/create` | Agregar opción de curso online |
| `/educator/courses/[id]/edit` | Agregar gestión de módulos/lecciones |

---

## 9. Servicios

### Nuevos servicios

| Servicio | Responsabilidad |
|---|---|
| `mux-service.ts` | Comunicación con Mux API: crear uploads, generar signed tokens, obtener info de assets |
| `lesson-service.ts` | CRUD de módulos y lecciones, reordenamiento, gestión de materiales |
| `lesson-progress-service.ts` | Tracking de progreso, cálculo de progreso global del curso |
| `lesson-comment-service.ts` | CRUD de comentarios, notificaciones al educador |

---

## 10. Fases de Implementación Sugeridas

### Fase 1: Modelo de datos y servicio de video
- Migración Prisma con nuevos modelos
- `mux-service.ts` (upload, webhooks, signed tokens)
- Webhook endpoint `/api/webhooks/mux`
- Configuración de Mux (signing keys, webhook)

### Fase 2: Panel del educador - gestión de contenido
- UI de gestión de módulos y lecciones
- Upload de videos con `<MuxUploader />`
- Editor de summary
- Upload de materiales
- Toggle de lección preview
- Reordenamiento de módulos y lecciones

### Fase 3: Player del estudiante
- Layout fullscreen `/learn/[courseSlug]/[lessonSlug]`
- Sidebar con navegación de módulos/lecciones
- Video player con `<MuxPlayer />`
- Signed playback tokens
- Controles de velocidad
- Navegación prev/next
- Mobile responsive (drawer sidebar)

### Fase 4: Progreso y tabs
- Tracking automático de progreso (onTimeUpdate)
- Toggle manual de completado
- Barra de progreso global
- Tab Summary con materiales descargables
- Tab Discussion (comentarios + replies + notificación email)
- Tab Transcripts (placeholder)

### Fase 5: Integración en catálogo
- Card de curso online en landing/catálogo
- Página de detalle con curriculum visible
- Lecciones de preview accesibles sin compra
- Flujo de compra → acceso al player
- Búsqueda de lecciones en el sidebar

---

## 11. Referencia Visual

Las capturas de la plataforma de referencia (agenticjumpstart.com) están en `docs/course-modality-online/reference-screenshots/`:

| Archivo | Contenido |
|---|---|
| `01-sidebar-modules-summary-tab.png` | Vista general: sidebar con módulos colapsados, video player, tab Summary |
| `02-module-expanded-discussion-tab.png` | Módulo expandido con lecciones, dropdown breadcrumb de módulos, tab Discussion con comentarios |
| `03-lesson-dropdown-transcripts-tab.png` | Dropdown de lecciones numeradas con estados, tab Transcripts |
| `04-lesson-active-summary.png` | Lección activa con botón "Mark as Complete", badges PRO |
| `05-mobile-content-view.png` | Mobile: contenido, video y tabs apilados verticalmente |
| `06-mobile-sidebar-drawer.png` | Mobile: sidebar como drawer overlay desde la izquierda |
