# Fase 7: Workflows - Ejecucion

## Descripcion
Implementar la asignacion de workflows a cursos, la generacion automatica de ejecuciones al inscribir estudiantes, y el cron job para ejecutar los emails automatizados.

## Incluye
- Asignacion de workflow a curso (desde workflow y desde curso)
- Creacion de CourseWorkflow al asignar
- Generacion de WorkflowExecution al inscribir estudiante
- Calculo de scheduledAt basado en fechas del curso
- Marcado de ejecuciones pasadas como "skipped"
- Endpoint `/api/cron/process-workflow-emails`
- Procesamiento de ejecuciones pendientes
- Actualizacion de CourseWorkflowStatus a completed
- UI de gestion de workflow activo en curso (`course-workflow-status.tsx`)
- Pausar/Reanudar workflow de un curso
- Ver proximos emails y historial del workflow

## Secciones del PRD Relacionadas
- "3. Workflows" - Asignacion a cursos, Gestion de workflow activo
- "Flujo de Procesamiento de Emails" - Workflows Automatizados
- "API Routes" - POST /api/cron/process-workflow-emails

## Dependencias
- Fase 5 completada (tracking funciona para workflow executions)
- Fase 6 completada (workflow templates creados)

## Criterios de Completitud
- [ ] Asignar workflow a curso desde ambas UI
- [ ] WorkflowExecution generadas al inscribir estudiante
- [ ] scheduledAt calculado correctamente por tipo de trigger
- [ ] Ejecuciones pasadas marcadas como skipped
- [ ] Cron de workflows configurado y funcionando
- [ ] Emails de workflow enviados en horario correcto
- [ ] Pausar/reanudar workflow funciona
- [ ] UI muestra proximos emails y historial
