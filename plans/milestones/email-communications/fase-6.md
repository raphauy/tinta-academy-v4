# Fase 6: Workflows - Templates

## Descripcion
Implementar la gestion de templates de workflows: crear, editar y configurar secuencias de emails automatizados con diferentes triggers basados en fechas del curso.

## Incluye
- Pagina lista de workflows (`/educator/workflows`)
- Pagina crear workflow (`/educator/workflows/create`)
- Pagina editar workflow (`/educator/workflows/[id]/edit`)
- Componente formulario de workflow (`workflow-form.tsx`)
- Componente card de paso (`workflow-step-card.tsx`)
- Componente selector de trigger (`trigger-selector.tsx`)
- Componente timeline visual (`workflow-timeline.tsx`)
- Server actions para CRUD de WorkflowTemplate y WorkflowStep
- Validacion de triggers (class_date requiere triggerClassIndex)

## Secciones del PRD Relacionadas
- "3. Workflows" - Lista de workflows, Crear/Editar workflow
- "Modelos de Datos" - WorkflowTemplate, WorkflowStep, WorkflowTriggerType
- "Componentes UI Principales" - seccion /workflows

## Dependencias
- Fase 2 completada (plantillas disponibles para seleccionar)

## Criterios de Completitud
- [ ] Lista de workflows con estado y acciones
- [ ] Formulario crear workflow con nombre y descripcion
- [ ] Constructor de pasos: agregar, eliminar, reordenar
- [ ] Selector de trigger con todos los tipos
- [ ] Selector de offset (dias antes/despues)
- [ ] Selector de plantilla en cada paso
- [ ] Timeline visual de la secuencia
- [ ] Guardado y edicion de workflows
