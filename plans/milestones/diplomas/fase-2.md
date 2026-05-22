# Fase 2: Editor de Plantilla

## Descripcion

Implementa la interfaz del educador para subir la imagen base del diploma y configurar dónde se renderiza el nombre del alumno (siempre) y la fecha (opcional). El editor muestra un preview en vivo con drag-to-reposition de los overlays sobre la imagen, complementado con inputs numéricos para precisión. Al final de esta fase, un educator puede guardar una plantilla 100% lista para emitir, pero la emisión propiamente dicha viene en la Fase 3.

## Incluye

- **Server actions** en `src/app/educator/courses/[id]/diploma/actions.ts`:
  - `upsertDiplomaTemplateAction(courseId, data)`
  - `uploadDiplomaBaseImageAction(courseId, formData)` — sube a Vercel Blob bajo `diploma-templates/{courseId}/base.{ext}`.
  - `deleteDiplomaTemplateAction(courseId)` — bloquea si hay emisiones enviadas.
- **Página** `src/app/educator/courses/[id]/diploma/page.tsx` (server component que carga curso + template existente + valida ownership).
- **Componente `template-editor.tsx`** en `src/components/educator/diplomas/`:
  - Upload de imagen base (drag&drop, PNG/JPG, max 5MB) con preview inmediato.
  - Layout de 2 columnas: preview a la izquierda, panel de configuración a la derecha.
  - Overlays "Nombre" y "Fecha" sobre el preview, **arrastrables con el mouse**, que actualizan los valores de X/Y en %.
  - Inputs numéricos sincronizados (X, Y, ancho máx, tamaño de fuente) para precisión.
  - Selector de fuente (set fijo cargado de `public/fonts/diplomas/`).
  - Color picker para nombre y fecha.
  - Toggle de fecha (on/off) + selector de modo (`last_class` / `custom`) + date picker si custom + selector de formato.
  - Input "Nombre de muestra" para probar el preview con diferentes largos.
  - Validación cliente con zod (`diplomaTemplateSchema`) y errores inline.
- **Componente `diploma-preview.tsx`** (compartido con Fase 3): renderiza la imagen base + overlays usando el mismo CSS que Satori, para que el preview coincida con el render final.
- **Validación del lado servidor**: si `dateMode = last_class` y el curso no tiene `classDates`/`endDate`/`startDate`, devuelve error explícito que se muestra en el form.
- **Bloqueo de cursos WSET** en la UI: si `course.type === 'wset'`, la página de diploma muestra mensaje informativo y no permite configurar.
- **Entry point**: link a "Diploma" desde la página de edición del curso (`/educator/courses/[id]/edit`).

## Secciones del PRD Relacionadas

- "UX del editor de plantilla" — layout y comportamientos.
- "Server Actions (educator)" — firmas y `ActionResult<T>`.
- "Permisos y roles" — autorización por `course.educatorId`.
- "Reglas de negocio" — validación de fecha al guardar.
- "Páginas y componentes (UI) → Educator" — paths y nombres de archivos.

## Dependencias

- Fase 1 completada (schema, services y validaciones disponibles).

## Criterios de Completitud

- [ ] `/educator/courses/[id]/diploma` carga, valida ownership y muestra el editor.
- [ ] La página rechaza con mensaje informativo si `course.type === 'wset'`.
- [ ] Se puede subir una imagen base que queda persistida en Vercel Blob y referenciada en `DiplomaTemplate.baseImageUrl`.
- [ ] Los overlays de "Nombre" y "Fecha" se pueden arrastrar sobre el preview y los inputs numéricos reflejan los nuevos valores en tiempo real.
- [ ] Cambios en fuente, tamaño, color, anchor y maxWidth se reflejan instantáneamente en el preview.
- [ ] El toggle de fecha muestra/oculta el overlay y los campos de configuración correspondientes.
- [ ] Guardar con `dateMode = last_class` y un curso sin fechas devuelve error claro al usuario.
- [ ] Guardar exitoso crea o actualiza `DiplomaTemplate` y refresca la página.
- [ ] Un educator que no es dueño del curso obtiene 403 / redirect.
- [ ] `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan.
