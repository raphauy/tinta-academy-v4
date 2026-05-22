# Fase 4: Panel Student y Operaciones Finas

## Descripcion

Cierra el ciclo de la feature: el estudiante puede descargar su diploma desde su panel, y el educator gana operaciones finas para reenviar emisiones individuales, reintentar fallidos y regenerar todos los assets si cambió la plantilla. Al terminar esta fase, el milestone está completo y la operación es sostenible en el tiempo.

## Incluye

### Panel del estudiante

- **Sección "Tu diploma"** en `src/app/student/courses/[id]/page.tsx` (o componente correspondiente como `student-course-detail.tsx`):
  - Visible solo si existe `DiplomaIssue` con `status = sent` para ese student+curso.
  - Preview reducido del diploma (PNG).
  - Botones "Descargar PNG" y "Descargar PDF".
- **Card destacada** en `src/components/student/student-dashboard.tsx`:
  - Aparece si hay al menos una `DiplomaIssue.sent` reciente (últimos 30 días, configurable).
  - Mensaje "Tu diploma de [Curso] está listo" + link directo al detalle del curso.

### Operaciones finas para el educator

- **Componente `diploma-issues-list.tsx`** en `src/components/educator/diplomas/`:
  - Tabla integrada en `/educator/courses/[id]/diploma` con todas las `DiplomaIssue` del curso.
  - Columnas: estudiante, email, status, fechas (generado / enviado), errorMessage si aplica.
  - Acciones por fila:
    - **Reenviar** (visible para `status` ∈ {`sent`, `failed`}): regenera asset + envía email.
    - **Reintentar** (visible para `status = failed`): vuelve a intentar la última etapa fallida (genera si no hay asset, envía si ya hay asset).
    - **Descargar PNG / PDF** (visible si hay asset).
- **Botón global "Regenerar diplomas"**:
  - Sobreescribe los assets de todas las `DiplomaIssue` existentes del curso usando la plantilla actual.
  - Modal de confirmación que aclara: "Los emails ya enviados NO se reenvían automáticamente; los estudiantes pueden seguir descargando desde su panel".
  - Opción adicional dentro del modal: "También reenviar emails" (checkbox).
- **Botón "Reintentar fallidos"** (al lado del botón global) que dispara solo los issues con `status = failed`.

### Server actions

En `src/app/educator/courses/[id]/diploma/actions.ts`:

- `resendDiplomaAction(issueId)` — regenera asset + reenvía a un estudiante puntual.
- `retryFailedDiplomasAction(courseId)` — itera issues con `status = failed`, reintenta la etapa que corresponde.
- `regenerateDiplomasAction(courseId, { resendEmails: boolean })` — regenera assets de todas las issues del curso; opcionalmente reenvía.

## Secciones del PRD Relacionadas

- "Flujos principales → Flujo 4 (Estudiante recibe y descarga)" y "Flujo 5 (Reenvío individual / regeneración)".
- "Server Actions (educator)" — `resendDiplomaAction`, `retryFailedDiplomasAction`, `regenerateDiplomasAction`.
- "Páginas y componentes (UI) → Student" y "Educator → diploma-issues-list".
- "Reglas de negocio → Snapshot e inmutabilidad" (motivo por el cual el regenerar es explícito).

## Dependencias

- Fase 3 completada (existen `DiplomaIssue` con assets para mostrar y operar).

## Criterios de Completitud

- [ ] `/student/courses/[id]` muestra la sección "Tu diploma" con descargas PNG y PDF cuando hay emisión enviada.
- [ ] El dashboard `/student` muestra la card destacada cuando hay emisión reciente, y desaparece después del umbral configurado.
- [ ] La tabla `diploma-issues-list` lista todas las emisiones del curso con sus estados y `errorMessage` cuando aplica.
- [ ] "Reenviar" en una fila regenera el asset y envía el email de nuevo, actualizando timestamps.
- [ ] "Reintentar" en una fila fallida vuelve a intentar la etapa correcta y la lleva a `sent` cuando no hay error real.
- [ ] "Regenerar diplomas" sobreescribe los assets de todas las issues sin reenviar emails por defecto.
- [ ] "Regenerar diplomas" con el checkbox de reenvío activo regenera y reenvía.
- [ ] "Reintentar fallidos" procesa solo issues con `status = failed`.
- [ ] Las server actions verifican que el usuario es educator dueño del curso o superadmin.
- [ ] Un estudiante solo ve / descarga su propio diploma; intentar acceder al de otro devuelve 403 / redirect.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.
