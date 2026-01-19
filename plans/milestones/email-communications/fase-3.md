# Fase 3: Emails Manuales - Envio

## Descripcion
Implementar el flujo completo de envio manual de emails: seleccion de destinatarios, seleccion de plantilla, envio inmediato via Resend.

## Incluye
- Pagina nuevo envio (`/educator/communications`)
- Componente selector de destinatarios (`recipient-selector.tsx`)
  - Opcion: todos los estudiantes de un curso
  - Opcion: seleccion personalizada con filtros y busqueda
- Componente selector de plantilla (`template-selector.tsx`) con preview
- Paso de revision y confirmacion
- Server action para crear campana y enviar
- Servicio de envio de emails via Resend
- Renderizado de plantilla con variables del estudiante
- Manejo de errores de envio

## Secciones del PRD Relacionadas
- "2. Emails Manuales" - Paso 1, 2, 4 (sin programacion)
- "Flujo de Procesamiento de Emails" - Envio Inmediato
- "Componentes UI Principales" - seccion /communications

## Dependencias
- Fase 2 completada (plantillas funcionando)

## Criterios de Completitud
- [ ] Selector de destinatarios por curso funcional
- [ ] Selector de destinatarios personalizado con filtros
- [ ] Tabla de seleccion con checkboxes y contador
- [ ] Selector de plantilla con preview
- [ ] Pantalla de revision antes de enviar
- [ ] Envio inmediato funciona via Resend
- [ ] EmailRecipient creados con resendId
- [ ] Manejo de errores individuales por destinatario
