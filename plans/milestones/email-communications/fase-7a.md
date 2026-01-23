# Fase 7a: Workflows - Asignacion y Ejecucion Basica

## Descripcion
Implementar la asignacion de workflows a cursos con validacion de fechas requeridas, preview de schedule antes de confirmar, generacion de ejecuciones para estudiantes existentes, y el cron job para ejecutar los emails automatizados.

## Incluye
- Asignacion de workflow a curso (desde workflow y desde curso)
- **Validacion de triggers**: Verificar que el curso tenga las fechas requeridas por los triggers del workflow
  - Si usa `exam_date` -> curso debe tener `examDate`
  - Si usa `class_date` con `triggerClassIndex=N` -> curso debe tener al menos N fechas en `classDates`
  - Si usa `course_end` -> curso debe tener `endDate`
  - Si usa `course_start` -> curso debe tener `startDate`
  - Mostrar warning/error si faltan fechas
- **Preview de schedule**: Antes de confirmar asignacion, mostrar fechas calculadas para cada paso
- Creacion de CourseWorkflow al asignar
- Generacion de WorkflowExecution para cada estudiante inscrito (solo fechas futuras)
- Calculo de scheduledAt con timezone del workflow (`sendAtHour`, `sendAtMinute`, `sendAtTimezone`)
- Endpoint `/api/cron/process-workflow-emails`
- Procesamiento de ejecuciones pendientes y envio de emails

## Secciones del PRD Relacionadas
- "3. Workflows" - Asignacion a cursos
- "Flujo de Procesamiento de Emails" - Workflows Automatizados
- "API Routes" - POST /api/cron/process-workflow-emails

## Dependencias
- Fase 5 completada (tracking funciona para workflow executions)
- Fase 6 completada (workflow templates creados)

## Criterios de Completitud
- [ ] UI para asignar workflow a curso desde `/educator/workflows`
- [ ] UI para asignar workflow a curso desde `/educator/courses/[id]`
- [ ] Validacion de triggers vs fechas del curso implementada
- [ ] Mostrar warning cuando faltan fechas requeridas
- [ ] Preview de schedule muestra fechas calculadas antes de confirmar
- [ ] CourseWorkflow creado correctamente al asignar
- [ ] WorkflowExecutions generadas para estudiantes existentes (solo futuras)
- [ ] scheduledAt calculado correctamente usando hora/timezone del workflow
- [ ] Cron `/api/cron/process-workflow-emails` configurado
- [ ] Emails de workflow enviados en horario correcto
- [ ] Variables de plantilla resueltas correctamente
