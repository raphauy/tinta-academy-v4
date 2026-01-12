# PRD: Sistema de Comunicaciones por Email

## Resumen Ejecutivo

Este milestone implementa un sistema completo de comunicaciones por email para Tinta Academy, permitiendo a los educadores enviar emails manuales y automatizados a sus estudiantes. El sistema incluye:

1. **Gestión de plantillas** con editor rich text y variables dinámicas
2. **Emails manuales** con selección flexible de destinatarios y programación
3. **Workflows automatizados** basados en fechas del curso
4. **Historial y tracking** de todos los emails enviados

---

## Objetivos

- Permitir comunicación personalizada y profesional con estudiantes
- Automatizar comunicaciones recurrentes (bienvenida, recordatorios, seguimiento)
- Mantener consistencia visual con los emails transaccionales existentes
- Proveer visibilidad del historial de comunicaciones

---

## Alcance

### Incluido
- CRUD de plantillas de email con editor rich text
- Envío manual de emails a estudiantes seleccionados o por curso
- Programación de emails para fecha/hora específica
- Creación y gestión de workflow templates
- Asignación de workflows a cursos
- Ejecución automática de workflows via Vercel Cron
- Tracking de apertura y clicks via webhook de Resend
- Historial de emails en panel de educador (por curso) y admin (global)

### Excluido
- Emails disparados por inscripción (ya existe como transaccional)
- Editor visual drag-and-drop de estructura del email
- A/B testing
- Segmentación avanzada de audiencias

---

## Modelos de Datos

### Nuevas tablas en Prisma

```prisma
// ==========================================
// PLANTILLAS DE EMAIL
// ==========================================

model EmailTemplate {
  id          String   @id @default(cuid())
  name        String
  subject     String
  body        String   @db.Text  // HTML del rich text editor

  educatorId  String
  educator    Educator @relation(fields: [educatorId], references: [id])

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  campaigns      EmailCampaign[]
  workflowSteps  WorkflowStep[]

  @@index([educatorId])
}

// ==========================================
// CAMPAÑAS DE EMAIL (envíos manuales)
// ==========================================

model EmailCampaign {
  id          String   @id @default(cuid())
  name        String   // Descripción interna del envío

  templateId  String
  template    EmailTemplate @relation(fields: [templateId], references: [id])

  educatorId  String
  educator    Educator @relation(fields: [educatorId], references: [id])

  // Opcional: si el envío es a todos los estudiantes de un curso
  courseId    String?
  course      Course?  @relation(fields: [courseId], references: [id])

  // Programación
  scheduledAt DateTime?  // null = envío inmediato
  timezone    String     // Timezone del usuario que programó (ej: "America/Montevideo")

  status      EmailCampaignStatus @default(draft)

  // Estadísticas agregadas (actualizadas por webhook)
  totalRecipients  Int @default(0)
  sentCount        Int @default(0)
  deliveredCount   Int @default(0)
  openedCount      Int @default(0)
  clickedCount     Int @default(0)
  failedCount      Int @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sentAt      DateTime?

  // Relations
  recipients  EmailRecipient[]

  @@index([educatorId])
  @@index([courseId])
  @@index([status])
  @@index([scheduledAt])
}

enum EmailCampaignStatus {
  draft           // Borrador, no enviado
  scheduled       // Programado para envío futuro
  sending         // En proceso de envío
  sent            // Enviado completamente
  partially_sent  // Enviado con algunos fallos
  cancelled       // Cancelado antes de enviar
}

model EmailRecipient {
  id          String   @id @default(cuid())

  campaignId  String
  campaign    EmailCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)

  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])

  // Email destino (guardado para histórico, puede cambiar en Student)
  email       String

  // Estado individual
  status      EmailDeliveryStatus @default(pending)

  // Tracking
  resendId    String?  // ID del email en Resend para tracking
  sentAt      DateTime?
  deliveredAt DateTime?
  openedAt    DateTime?
  clickedAt   DateTime?

  // Error info si falló
  errorMessage String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([campaignId, studentId])
  @@index([campaignId])
  @@index([studentId])
  @@index([status])
  @@index([resendId])
}

enum EmailDeliveryStatus {
  pending     // Pendiente de envío
  sending     // En proceso
  sent        // Enviado a Resend
  delivered   // Confirmado entregado
  opened      // Abierto por destinatario
  clicked     // Click en algún link
  bounced     // Rebotado
  failed      // Error en envío
}

// ==========================================
// WORKFLOWS (automatización)
// ==========================================

model WorkflowTemplate {
  id          String   @id @default(cuid())
  name        String   // Ej: "Workflow WSET Nivel 1"
  description String?

  educatorId  String
  educator    Educator @relation(fields: [educatorId], references: [id])

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  steps           WorkflowStep[]
  courseWorkflows CourseWorkflow[]

  @@index([educatorId])
  @@index([isActive])
}

model WorkflowStep {
  id                  String   @id @default(cuid())

  workflowTemplateId  String
  workflowTemplate    WorkflowTemplate @relation(fields: [workflowTemplateId], references: [id], onDelete: Cascade)

  templateId          String
  template            EmailTemplate @relation(fields: [templateId], references: [id])

  // Configuración del trigger
  triggerType         WorkflowTriggerType
  triggerOffset       Int      // Días: negativo = antes, positivo = después, 0 = el mismo día
  triggerClassIndex   Int?     // Solo si triggerType = class_date (1-indexed)

  // Orden dentro del workflow (para UI)
  order               Int      @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  executions          WorkflowExecution[]

  @@index([workflowTemplateId])
  @@index([templateId])
}

enum WorkflowTriggerType {
  course_start          // Relativo a startDate del curso
  course_end            // Relativo a endDate del curso
  exam_date             // Relativo a examDate del curso
  class_date            // Relativo a una clase específica (classDates[triggerClassIndex-1])
  registration_deadline // Relativo a registrationDeadline del curso
}

model CourseWorkflow {
  id                  String   @id @default(cuid())

  courseId            String
  course              Course   @relation(fields: [courseId], references: [id])

  workflowTemplateId  String
  workflowTemplate    WorkflowTemplate @relation(fields: [workflowTemplateId], references: [id])

  status              CourseWorkflowStatus @default(active)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations
  executions          WorkflowExecution[]

  @@unique([courseId, workflowTemplateId])
  @@index([courseId])
  @@index([workflowTemplateId])
  @@index([status])
}

enum CourseWorkflowStatus {
  active      // Ejecutando normalmente
  paused      // Pausado temporalmente
  completed   // Todas las ejecuciones terminadas
}

model WorkflowExecution {
  id                String   @id @default(cuid())

  courseWorkflowId  String
  courseWorkflow    CourseWorkflow @relation(fields: [courseWorkflowId], references: [id], onDelete: Cascade)

  workflowStepId    String
  workflowStep      WorkflowStep @relation(fields: [workflowStepId], references: [id])

  studentId         String
  student           Student  @relation(fields: [studentId], references: [id])

  enrollmentId      String
  enrollment        Enrollment @relation(fields: [enrollmentId], references: [id])

  // Email destino (guardado para histórico)
  email             String

  // Cuándo debe ejecutarse
  scheduledAt       DateTime

  // Estado
  status            EmailDeliveryStatus @default(pending)

  // Tracking
  resendId          String?
  sentAt            DateTime?
  deliveredAt       DateTime?
  openedAt          DateTime?
  clickedAt         DateTime?

  errorMessage      String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([courseWorkflowId, workflowStepId, studentId])
  @@index([courseWorkflowId])
  @@index([workflowStepId])
  @@index([studentId])
  @@index([enrollmentId])
  @@index([scheduledAt])
  @@index([status])
  @@index([resendId])
}
```

### Modificaciones a modelos existentes

```prisma
// Agregar relaciones a modelos existentes

model Educator {
  // ... campos existentes ...
  emailTemplates    EmailTemplate[]
  emailCampaigns    EmailCampaign[]
  workflowTemplates WorkflowTemplate[]
}

model Student {
  // ... campos existentes ...
  emailRecipients      EmailRecipient[]
  workflowExecutions   WorkflowExecution[]
}

model Course {
  // ... campos existentes ...
  emailCampaigns    EmailCampaign[]
  courseWorkflows   CourseWorkflow[]
}

model Enrollment {
  // ... campos existentes ...
  workflowExecutions WorkflowExecution[]
}
```

---

## Variables de Plantilla

Variables disponibles para usar en subject y body de las plantillas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{studentName}}` | Nombre completo del estudiante | "María García" |
| `{{studentFirstName}}` | Primer nombre del estudiante | "María" |
| `{{studentEmail}}` | Email del estudiante | "maria@example.com" |
| `{{courseName}}` | Nombre del curso | "WSET Nivel 1 en Vinos" |
| `{{courseStartDate}}` | Fecha de inicio formateada | "15 de marzo de 2025" |
| `{{courseEndDate}}` | Fecha de fin formateada | "20 de marzo de 2025" |
| `{{examDate}}` | Fecha del examen formateada | "20 de marzo de 2025" |
| `{{educatorName}}` | Nombre del educador | "Gabriela Zimmer" |
| `{{courseUrl}}` | Link al curso en el portal | "https://academy.tinta.wine/student/courses/abc123" |

---

## Funcionalidades Detalladas

### 1. Gestión de Plantillas (`/educator/templates`)

**Lista de plantillas**
- Tabla con: nombre, asunto, fecha de creación, acciones (editar, duplicar, eliminar)
- Búsqueda por nombre
- Botón "Crear plantilla"

**Crear/Editar plantilla**
- Campo: Nombre (interno, para identificar)
- Campo: Asunto (con soporte para variables)
- Editor rich text para el cuerpo:
  - Toolbar: negrita, cursiva, listas, links
  - Insertar variables desde dropdown/botones
  - Preview en tiempo real (panel lateral o modal)
- El HTML generado se renderiza dentro del layout base de react-email existente

**Eliminar plantilla**
- Confirmar con dialog
- No permitir si está en uso en workflows activos

### 2. Emails Manuales (`/educator/communications`)

**Página principal - Nuevo envío**
- Paso 1: Seleccionar destinatarios
  - Opción A: "Todos los estudiantes de un curso" → selector de curso
  - Opción B: "Selección personalizada" →
    - Filtros: por curso, por estado de enrollment
    - Búsqueda por nombre/email
    - Tabla con checkboxes para selección
    - Mostrar contador de seleccionados
- Paso 2: Seleccionar plantilla (dropdown con preview)
- Paso 3: Programación
  - "Enviar ahora" (default)
  - "Programar para..." → DateTimePicker con timezone del navegador
- Paso 4: Revisión y confirmación
  - Preview del email con datos de ejemplo
  - Lista de destinatarios
  - Botón "Enviar" / "Programar"

**Historial de envíos** (`/educator/communications/history`)
- Tabla con: nombre, plantilla, destinatarios, fecha, estado, estadísticas
- Filtros: por curso, por estado, por fecha
- Click en fila → detalle de campaña

**Detalle de campaña** (`/educator/communications/[campaignId]`)
- Info general: nombre, plantilla, fecha de envío
- Estadísticas: enviados, entregados, abiertos, clicks, fallidos
- Gráfico simple de funnel o barras
- Lista de destinatarios con estado individual
- Si está programada y pendiente: botón "Cancelar"

### 3. Workflows (`/educator/workflows`)

**Lista de workflows**
- Tabla con: nombre, descripción, pasos, cursos asignados, estado, acciones
- Botón "Crear workflow"

**Crear/Editar workflow** (`/educator/workflows/create`, `/educator/workflows/[id]/edit`)
- Campo: Nombre
- Campo: Descripción (opcional)
- Constructor de pasos (UI tipo lista ordenable):
  - Cada paso muestra:
    - Trigger: dropdown (inicio curso, fin curso, examen, clase N, fecha límite inscripción)
    - Offset: input numérico + "días antes/después"
    - Plantilla: dropdown con preview
    - Botón eliminar paso
  - Botón "Agregar paso"
  - Drag & drop para reordenar (opcional, nice-to-have)
- Timeline visual que muestra la secuencia
- Botón "Guardar"

**Asignación a cursos**
- Desde el workflow: sección "Cursos asignados" con lista y botón "Asignar a curso"
- Desde la edición del curso: dropdown "Workflow de comunicaciones"
- Al asignar un workflow a un curso:
  - Crear registros CourseWorkflow
  - Crear WorkflowExecution para cada estudiante inscrito × cada paso
  - Calcular scheduledAt basado en fechas del curso
  - Marcar como "skipped" los que ya pasaron su fecha

**Gestión de workflow activo en curso**
- Ver estado del workflow asignado
- Pausar/Reanudar workflow
- Ver próximos emails programados
- Ver historial de emails enviados por el workflow

### 4. Historial Global - Admin (`/admin/communications`)

**Tabla de todos los emails**
- Incluye: campañas manuales + ejecuciones de workflows
- Columnas: fecha, tipo (manual/workflow), educador, curso, destinatarios, estado
- Filtros: por educador, por curso, por tipo, por fecha, por estado
- Export a CSV (nice-to-have)

### 5. Historial por Curso - Educador

**En página de estudiantes del curso** (`/educator/courses/[id]/students`)
- Nueva tab o sección: "Comunicaciones"
- Lista de emails enviados a estudiantes de este curso
- Incluye campañas manuales y ejecuciones de workflows

---

## Flujo de Procesamiento de Emails

### Envío Inmediato (Manual)
1. Usuario crea campaña con scheduledAt = null
2. Server action crea registros EmailRecipient con status = "pending"
3. Se procesan inmediatamente en el mismo request (o background job si son muchos)
4. Para cada recipient:
   - Renderizar plantilla con variables del estudiante
   - Enviar via Resend
   - Guardar resendId
   - Actualizar status a "sent"
5. Actualizar estadísticas de la campaña

### Envío Programado (Manual)
1. Usuario crea campaña con scheduledAt = fecha futura
2. Server action crea registros con status = "pending"
3. Vercel Cron ejecuta cada 15 minutos `/api/cron/process-scheduled-emails`
4. Query: campañas con status = "scheduled" y scheduledAt <= now
5. Procesar igual que envío inmediato
6. Actualizar status de campaña a "sent"

### Workflows Automatizados
1. Al inscribir estudiante en curso con workflow activo:
   - Crear WorkflowExecution para cada paso del workflow
   - Calcular scheduledAt: fecha_trigger + offset días
   - Si scheduledAt ya pasó → status = "skipped"
2. Vercel Cron ejecuta cada 15 minutos `/api/cron/process-workflow-emails`
3. Query: executions con status = "pending" y scheduledAt <= now
4. Procesar igual que campañas
5. Al completar todas las ejecuciones de un CourseWorkflow → status = "completed"

### Webhook de Tracking
1. Configurar webhook en Resend para eventos: delivered, opened, clicked, bounced
2. Endpoint: `/api/webhooks/resend`
3. Recibir evento con resendId
4. Buscar en EmailRecipient o WorkflowExecution por resendId
5. Actualizar status y timestamp correspondiente
6. Actualizar contadores agregados en EmailCampaign

---

## API Routes

```
POST /api/cron/process-scheduled-emails
  - Vercel Cron cada 15 minutos
  - Procesa campañas programadas pendientes

POST /api/cron/process-workflow-emails
  - Vercel Cron cada 15 minutos
  - Procesa ejecuciones de workflow pendientes

POST /api/webhooks/resend
  - Webhook de Resend para tracking
  - Eventos: delivered, opened, clicked, bounced
```

---

## Estructura de Rutas

### Educador
```
/educator/communications
  ├── /                     → Página para crear nuevo envío manual
  ├── /history              → Historial de campañas enviadas
  └── /[campaignId]         → Detalle de una campaña

/educator/templates
  ├── /                     → Lista de plantillas
  ├── /create               → Crear plantilla
  └── /[id]/edit            → Editar plantilla

/educator/workflows
  ├── /                     → Lista de workflows
  ├── /create               → Crear workflow
  └── /[id]/edit            → Editar workflow

/educator/courses/[id]/students
  └── Tab "Comunicaciones"  → Historial de emails del curso
```

### Admin
```
/admin/communications       → Historial global de todos los emails
```

### Sidebar del Educador (actualizado)
```
- Panel de Control
- Mis Cursos
  - Ver Cursos
  - Crear Curso
- Estudiantes
- Comunicaciones          ← Expandible
  - Nuevo Envío
  - Historial
  - Plantillas
  - Workflows
- Estadísticas
```

---

## Componentes UI Principales

### Nuevos componentes en `/src/components/educator/communications/`

```
/communications
  ├── recipient-selector.tsx       → Selección de destinatarios con filtros
  ├── template-selector.tsx        → Dropdown de plantillas con preview
  ├── schedule-picker.tsx          → Selector fecha/hora con timezone
  ├── campaign-stats-card.tsx      → Estadísticas de una campaña
  ├── campaign-recipients-table.tsx → Lista de destinatarios con estado

/templates
  ├── template-form.tsx            → Formulario crear/editar plantilla
  ├── template-editor.tsx          → Editor rich text
  ├── template-preview.tsx         → Preview del email renderizado
  ├── variable-inserter.tsx        → Botones/dropdown para insertar variables

/workflows
  ├── workflow-form.tsx            → Formulario crear/editar workflow
  ├── workflow-step-card.tsx       → Card de un paso del workflow
  ├── workflow-timeline.tsx        → Visualización de la secuencia
  ├── trigger-selector.tsx         → Selector de tipo de trigger
  ├── course-workflow-status.tsx   → Estado del workflow en un curso
```

### Email Template Base

Crear componente en `/src/components/emails/dynamic-email.tsx`:
- Recibe: subject, body (HTML), variables resueltas
- Usa el mismo layout/theme que los emails transaccionales
- Header con logo Tinta Academy
- Body renderizado desde HTML de la plantilla
- Footer consistente

---

## Consideraciones Técnicas

### Rich Text Editor
- Usar **Tiptap** (recomendado) o similar
- Configurar extensiones: Bold, Italic, Link, BulletList, OrderedList
- Custom extension para insertar variables `{{variable}}`
- Output: HTML limpio

### Timezone Handling
- Guardar timezone del usuario al programar (del navegador)
- Guardar scheduledAt en UTC en la base de datos
- Usar `date-fns-tz` para conversiones
- Mostrar fechas en timezone local del usuario

### Rate Limiting
- Resend tiene límites por segundo
- Implementar delay entre envíos si son muchos destinatarios
- Considerar batch processing para campañas grandes (>100 destinatarios)

### Idempotencia
- Verificar que no se envíe el mismo email dos veces
- Usar resendId para tracking
- Marcar como "sending" antes de enviar, actualizar después

### Seguridad
- Validar que el educador solo acceda a sus plantillas/campañas/workflows
- Sanitizar HTML del editor rich text antes de guardar
- Validar que las variables usadas existan

---

## Dependencias

### Paquetes nuevos a instalar
```bash
pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-link
pnpm add date-fns-tz
```

### Configuraciones necesarias
- Configurar webhook de Resend en dashboard (URL + eventos)
- Configurar Vercel Cron en `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/process-scheduled-emails",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/process-workflow-emails",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

---

## Fases de Implementación Sugeridas

### Fase 1: Fundamentos
- Schema de base de datos (migraciones)
- Servicios base (CRUD de templates, campaigns)
- Email template dinámico (react-email)

### Fase 2: Plantillas
- UI de gestión de plantillas
- Editor rich text con variables
- Preview de emails

### Fase 3: Emails Manuales
- Selector de destinatarios
- Envío inmediato
- Programación de envíos
- Vercel Cron para programados

### Fase 4: Historial y Tracking
- Historial de campañas
- Webhook de Resend
- Estadísticas y detalle de campaña
- Historial en admin

### Fase 5: Workflows
- CRUD de workflow templates
- Asignación a cursos
- Generación de ejecuciones al inscribir
- Cron para ejecución automática
- UI de gestión de workflows activos

### Fase 6: Polish
- Sidebar actualizado
- Historial por curso
- Mejoras de UX
- Testing y edge cases

---

## Métricas de Éxito

- Educadores pueden crear y enviar emails en menos de 5 minutos
- Workflows configurados reducen trabajo manual repetitivo
- Tasa de entrega > 95%
- Visibilidad completa del historial de comunicaciones
