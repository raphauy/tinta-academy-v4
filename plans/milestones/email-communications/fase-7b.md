# Fase 7b: Workflows - Gestion Avanzada

## Descripcion
Implementar la gestion avanzada de workflows: generacion automatica de ejecuciones al inscribir nuevos estudiantes, recalculo de fechas cuando cambian las fechas del curso, pausar/reanudar workflows, y UI de estado y historial.

## Incluye
- **Hook en inscripcion**: Al inscribir estudiante, generar WorkflowExecutions para pasos futuros
  - Solo crear ejecuciones si `scheduledAt > now()`
  - Estudiantes tardios no reciben emails de pasos ya pasados
- **Dialogo de recalculo**: Cuando cambian fechas del curso (startDate, endDate, examDate, classDates)
  - Detectar si hay WorkflowExecutions pendientes afectadas
  - Mostrar dialogo: "Las fechas del curso cambiaron. Hay X emails programados basados en estas fechas. Deseas recalcular las fechas de envio?"
  - Opciones: [Recalcular] [Mantener fechas originales] [Cancelar]
  - Si recalcula, actualizar scheduledAt de ejecuciones con status=pending
- **Pausar/Reanudar workflow**: Cambiar status de CourseWorkflow a paused/active
  - Ejecuciones pendientes no se envian mientras esta pausado
- **UI de estado del workflow en curso** (`course-workflow-status.tsx`)
- **Ver proximos emails**: Lista de WorkflowExecutions pendientes con fechas
- **Historial del workflow**: Emails enviados, entregados, abiertos del workflow en ese curso

## Secciones del PRD Relacionadas
- "3. Workflows" - Gestion de workflow activo
- "Flujo de Procesamiento de Emails" - Workflows Automatizados

## Dependencias
- Fase 7a completada (asignacion basica y cron funcionando)

## Criterios de Completitud
- [ ] Hook en inscripcion genera ejecuciones para estudiantes nuevos
- [ ] Solo se crean ejecuciones para fechas futuras
- [ ] Al editar curso, detectar cambios en fechas relevantes
- [ ] Dialogo de recalculo muestra cantidad de emails afectados
- [ ] Recalculo actualiza scheduledAt de ejecuciones pendientes
- [ ] Boton pausar/reanudar workflow funciona
- [ ] Cron respeta estado paused (no envia emails)
- [ ] UI muestra estado actual del workflow (active/paused/completed)
- [ ] Lista de proximos emails con fechas programadas
- [ ] Historial muestra emails enviados con metricas (sent, delivered, opened)
- [ ] CourseWorkflowStatus cambia a completed cuando todos los pasos estan enviados
