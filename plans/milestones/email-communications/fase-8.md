# Fase 8: Polish y Admin

## Descripcion
Finalizar la integracion del sistema con mejoras de UX, sidebar actualizado, historial por curso, panel de admin y manejo de edge cases.

## Incluye
- Actualizacion del sidebar del educador con seccion "Comunicaciones"
- Tab/seccion "Comunicaciones" en pagina de estudiantes del curso
- Historial de emails por curso (manuales + workflows)
- Pagina historial global admin (`/admin/communications`)
- Filtros avanzados: por educador, curso, tipo, fecha, estado
- Mejoras de UX basadas en feedback
- Manejo de edge cases:
  - Rate limiting de Resend
  - Batch processing para campanas grandes
  - Idempotencia en envios
  - Sanitizacion de HTML del editor
- Tests de integracion end-to-end

## Secciones del PRD Relacionadas
- "4. Historial Global - Admin"
- "5. Historial por Curso - Educador"
- "Sidebar del Educador (actualizado)"
- "Consideraciones Tecnicas" - Rate Limiting, Idempotencia, Seguridad

## Dependencias
- Fase 7 completada (todo el sistema funcional)

## Criterios de Completitud
- [ ] Sidebar del educador actualizado con menu expandible
- [ ] Tab "Comunicaciones" en /educator/courses/[id]/students
- [ ] Historial por curso incluye campanas y workflows
- [ ] /admin/communications con historial global
- [ ] Filtros funcionando en panel admin
- [ ] Rate limiting implementado para envios masivos
- [ ] Idempotencia verificada (no duplicados)
- [ ] HTML del editor sanitizado
- [ ] Tests de integracion pasando
