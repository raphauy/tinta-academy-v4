# Fase 2: Gestion de Plantillas

## Descripcion
Implementar la UI completa para que los educadores gestionen sus plantillas de email, incluyendo el editor rich text con soporte para variables dinamicas y preview en tiempo real.

## Incluye
- Pagina lista de plantillas (`/educator/templates`)
- Pagina crear plantilla (`/educator/templates/create`)
- Pagina editar plantilla (`/educator/templates/[id]/edit`)
- Componente `template-form.tsx`
- Editor rich text con Tiptap (`template-editor.tsx`)
- Insercion de variables (`variable-inserter.tsx`)
- Preview del email renderizado (`template-preview.tsx`)
- Server actions para CRUD de plantillas
- Validacion de plantillas en uso antes de eliminar

## Secciones del PRD Relacionadas
- "1. Gestion de Plantillas"
- "Componentes UI Principales" - seccion /templates
- "Consideraciones Tecnicas" - Rich Text Editor

## Dependencias
- Fase 1 completada (schema y servicios base)

## Criterios de Completitud
- [ ] Tiptap instalado y configurado
- [ ] Lista de plantillas con busqueda funcional
- [ ] Formulario crear/editar plantilla completo
- [ ] Editor rich text con toolbar (negrita, cursiva, listas, links)
- [ ] Dropdown/botones para insertar variables
- [ ] Preview en tiempo real del email
- [ ] Eliminacion con validacion de uso en workflows
- [ ] Navegacion funcional entre paginas
