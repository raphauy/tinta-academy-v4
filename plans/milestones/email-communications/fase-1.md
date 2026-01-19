# Fase 1: Schema y Servicios Base

## Descripcion
Establecer los fundamentos del sistema de comunicaciones: modelos de datos, migraciones de base de datos, servicios CRUD basicos y el componente de email dinamico con react-email.

## Incluye
- Modelos Prisma: EmailTemplate, EmailCampaign, EmailRecipient
- Modelos Prisma: WorkflowTemplate, WorkflowStep, CourseWorkflow, WorkflowExecution
- Enums: EmailCampaignStatus, EmailDeliveryStatus, WorkflowTriggerType, CourseWorkflowStatus
- Relaciones con modelos existentes (Educator, Student, Course, Enrollment)
- Migracion de base de datos
- Servicios CRUD basicos para templates y campaigns
- Componente de email dinamico (`dynamic-email.tsx`) usando react-email
- Utilidad de renderizado de variables de plantilla

## Secciones del PRD Relacionadas
- "Modelos de Datos" - Completo
- "Modificaciones a modelos existentes"
- "Variables de Plantilla"
- "Email Template Base"

## Dependencias
- Ninguna (primera fase)

## Criterios de Completitud
- [ ] Schema de Prisma actualizado con todos los modelos nuevos
- [ ] Migracion ejecutada exitosamente
- [ ] Servicio de templates con create, read, update, delete
- [ ] Servicio de campaigns con create, read
- [ ] Componente `dynamic-email.tsx` renderiza HTML con variables
- [ ] Tests unitarios para el renderizado de variables
