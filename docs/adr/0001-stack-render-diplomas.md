# ADR 0001 — Stack de render para diplomas

**Fecha:** 2026-05-22
**Estado:** Aceptado

## Contexto

El milestone *diplomas* requiere generar, por cada estudiante elegible de un curso, una imagen y un PDF del diploma compuestos a partir de una plantilla configurable (imagen base subida por el educador + variables: nombre del estudiante y fecha). La generación corre del lado del servidor, en Vercel Functions (Fluid Compute Pro, timeout 800 s).

Las alternativas evaluadas fueron:

1. **Satori + `@resvg/resvg-js` + `pdf-lib`**: render HTML/CSS → SVG → PNG con Satori y Resvg; envoltura del PNG en PDF A4 landscape con `pdf-lib`.
2. **`sharp` composite**: imagen base como background, SVG con el texto compuesto encima usando `sharp().composite([...])`.
3. **`@vercel/og`**: wrapper de Satori orientado a OG-images, mismas primitivas pero menos control sobre fuentes.
4. **Templating de PDF nativo** (`pdfkit` o similar): generar el diploma directamente como PDF sin pasar por imagen.

## Decisión

Adoptamos **Satori + `@resvg/resvg-js` + `pdf-lib`** como stack de render.

## Motivo

- **Preview pixel-perfect en el editor**: Satori usa el mismo modelo HTML/CSS que el browser, por lo que el preview que el educator ve mientras arrastra los overlays coincide con el render final sin necesidad de renderizar server-side en cada movimiento. Con `sharp` el preview vive en un sistema de coordenadas paralelo al composite final y suele divergir en bordes (kerning, line-height, anti-aliasing).
- **Path claro para nuevas variables**: si en v2 sumamos QR dinámico, firma del educator, número de horas, etc., son nuevos elementos HTML/CSS. Con `sharp` cada variable nueva requiere un SVG inline y otra capa de composite.
- **Reuso de stack mental**: `onmind-marketing` ya usa la misma combinación (`satori` + `@resvg/resvg-js`) para sus piezas de contenido. Migrar conocimiento entre proyectos es directo.
- **PDF imprimible** vía `pdf-lib`: envolver el PNG en A4 landscape estándar es trivial (~15 líneas) y produce un asset universal para imprimir sin recurrir a un motor de PDF templating completo.

## Consecuencias

- **Dependencias nuevas**: `satori`, `@resvg/resvg-js`, `pdf-lib`. Las dos primeras requieren los binarios nativos de Resvg en el runtime; en Vercel Fluid Compute funcionan sin configuración adicional.
- **Fuentes versionadas en el repo**: las fuentes deben estar disponibles como archivos `.ttf`/`.woff2` en `public/fonts/diplomas/` (Geist, Playfair Display, DM Serif Display). Cargadas con `fs.readFileSync` al inicializar el render service y cacheadas in-memory entre invocaciones de Fluid Compute.
- **Performance**: cada diploma cuesta ~1-2 s (parse JSX + Satori SVG + Resvg → PNG + `pdf-lib` envoltura). Para batches del orden actual (~20-100 estudiantes) está cómodamente dentro del timeout de 800 s; si en el futuro hay cursos con cientos o miles de estudiantes, habrá que mover el batch a Vercel Queues o paralelizar con `p-limit`.
- **Tamaño del bundle**: las fuentes en `public/fonts/diplomas/` agregan ~700 KB al repo pero no al bundle del cliente (se leen server-side).
