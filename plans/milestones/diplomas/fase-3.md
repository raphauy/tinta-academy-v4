# Fase 3: Flujo de Emisión Completo

## Descripcion

Implementa el flujo de dos pasos del educator: **generar diplomas para revisar** y luego **confirmar y enviar emails**. Al final de esta fase, el educator de un curso con plantilla configurada puede emitir y enviar todos los diplomas a sus inscriptos confirmados con feedback de progreso en vivo, y los estudiantes reciben el email con PDF adjunto y PNG embebido.

Esta fase entrega el caso de uso disparador: **el viernes 29 de mayo Gabi puede enviar los diplomas del taller "Uruguay en vinos"**.

## Incluye

- **Server actions** en `src/app/educator/courses/[id]/diploma/actions.ts`:
  - `generateDiplomasAction(courseId)` — crea `DiplomaIssue` con `status = pending` para cada `Enrollment.confirmed` sin issue previa, itera render+upload Blob, transiciona `generating → generated` o `failed` con `errorMessage`. Idempotente: ignora estudiantes con issues ya en `generated`/`sending`/`sent`.
  - `sendDiplomasAction(courseId)` — itera issues con `status = generated`, dispara email vía `email-service`, transiciona `sending → sent` o `failed`. Idempotente: ignora `sent`.
  - `getDiplomaProgressAction(courseId)` — devuelve counts agregados `{ pending, generating, generated, sending, sent, failed, total }` para polling.
- **Template React Email** `src/components/emails/diploma-ready.tsx`:
  - Reutiliza `email-header.tsx`.
  - Saludo personalizado + párrafo de felicitación referenciando el curso.
  - PNG embebido inline (centrado, ~600px de ancho).
  - CTA "Descargar PDF" → `pdfUrl`.
  - Link de fallback al panel student.
  - Firma de Tinta Academy.
- **Integración con `email-service.ts`**: nueva función `sendDiplomaEmail({ to, studentName, courseName, pngUrl, pdfUrl })` que renderiza el template, adjunta el PDF y manda vía Resend. Persiste `resendId` en `DiplomaIssue`.
- **UI de la página de diploma** (extiende la página creada en Fase 2):
  - Bloque "Emitir diplomas" que aparece cuando existe plantilla.
  - Botón **"Generar diplomas para revisar"** (deshabilitado si no hay enrollments confirmados pendientes). Modal de confirmación con N destinatarios estimados.
  - Mientras corre la generación: `generation-progress.tsx` con progress bar + contador `X/N` (polea `getDiplomaProgressAction` cada 2s).
  - Al terminar: **grid de thumbnails** de los diplomas generados (lee directamente las `DiplomaIssue.pngUrl`). Click sobre uno → vista ampliada en modal.
  - Botones bajo el grid: **"Volver al editor"** (descarta lote: borra `DiplomaIssue` con `status` ∈ {`generated`, `failed`}) y **"Confirmar y enviar"**.
  - Modal de confirmación de envío con lista de destinatarios.
  - Mientras corre el envío: progress bar análogo.
  - Resumen final: éxitos / fallos con `errorMessage` por estudiante.

## Secciones del PRD Relacionadas

- "Flujos principales → Flujo 2 (Generar para revisar)" y "Flujo 3 (Enviar emails)".
- "Email del diploma" — diseño y contenido.
- "Server Actions (educator)" — `generateDiplomasAction`, `sendDiplomasAction`, `getDiplomaProgressAction`.
- "Consideraciones técnicas → Performance y timeouts" — Fluid Compute 800s, polling 2s.
- "Reglas de negocio → Idempotencia del envío" y "Errores".

## Dependencias

- Fase 1 completada (services orquestadores + render).
- Fase 2 completada (plantilla configurable, prerequisito para emitir).

## Criterios de Completitud

- [ ] Click en "Generar diplomas para revisar" crea `DiplomaIssue` para todos los `Enrollment.confirmed` pendientes y genera PNG+PDF de cada uno.
- [ ] El progress bar refleja el avance en vivo con polling cada 2s.
- [ ] El grid muestra thumbnails de los diplomas generados y permite vista ampliada.
- [ ] "Volver al editor" descarta el lote correctamente y devuelve al estado pre-generación.
- [ ] "Confirmar y enviar" dispara los emails vía Resend con PDF adjunto y PNG embebido.
- [ ] Los emails llegan a la inbox con asunto correcto y diseño según PRD.
- [ ] Si un diploma falla, el batch continúa y el resumen final lo lista con `errorMessage`.
- [ ] Re-clickear "Generar" no duplica issues ni reenvía a quienes ya tienen status `sent`.
- [ ] Las server actions verifican que el usuario es educator dueño del curso o superadmin.
- [ ] El flujo completo se prueba end-to-end con al menos un estudiante real en entorno de desarrollo.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.
