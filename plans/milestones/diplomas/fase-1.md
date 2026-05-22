# Fase 1: Fundamentos y Servicios

## Descripcion

Sienta toda la base no-visual del sistema de diplomas: modelo de datos, dependencias, fuentes tipográficas, validaciones y los tres servicios que orquestan el render y la emisión. Al final de esta fase, debe ser posible generar un PNG y un PDF de diploma de prueba desde un script standalone, sin UI todavía.

## Incluye

- **Schema Prisma** con los modelos `DiplomaTemplate` y `DiplomaIssue`, los enums `DiplomaStatus` y `DiplomaDateMode`, y las relaciones agregadas en `Course`, `Student` y `Enrollment`.
- **Migración Prisma** aplicada.
- **Dependencias nuevas**: `satori`, `@resvg/resvg-js`, `pdf-lib`.
- **Fuentes** descargadas a `public/fonts/diplomas/`: Geist (Bold, Medium, Regular) + 2-3 fuentes adicionales (a definir: probablemente Playfair Display y DM Serif Display).
- **Validaciones zod** en `src/lib/validations/diploma.ts` (`diplomaTemplateSchema`, reglas condicionales para fecha).
- **`src/services/diploma-render-service.ts`**: render PNG con Satori + resvg, envoltura PDF con pdf-lib, carga de fuentes en memoria. Sin acceso a Prisma.
- **`src/services/diploma-template-service.ts`**: CRUD de `DiplomaTemplate` + `resolveDiplomaDate(course, template)` con fallbacks `max(classDates) → endDate → startDate`.
- **`src/services/diploma-service.ts`**: orquestación de issues (crear `DiplomaIssue` para enrollments elegibles, dispatch del render, subida de assets a Vercel Blob, transiciones de estado).
- **Script standalone de validación**: `scripts/test-diploma-render.ts` que tome una imagen de prueba (el `docs/enviar-diplomas/Diploma.jpg` modificado o un mock) + config dummy y genere PNG+PDF en disco.

## Secciones del PRD Relacionadas

- "Modelos de Datos" — schemas Prisma completos.
- "Stack técnico" — librerías y justificación.
- "Capa de Servicios" — responsabilidades de cada service.
- "Reglas de negocio" — resolución de fecha, snapshot, idempotencia (lógica que vive en `diploma-service`).
- "Validaciones (zod)" — reglas del `diplomaTemplateSchema`.

## Dependencias

- Ninguna (es la primera fase).

## Criterios de Completitud

- [ ] `prisma/schema.prisma` incluye `DiplomaTemplate`, `DiplomaIssue`, enums `DiplomaStatus` y `DiplomaDateMode`, y relaciones en `Course`/`Student`/`Enrollment`.
- [ ] Migración aplicada con `pnpm prisma migrate dev --name add_diplomas`.
- [ ] `pnpm prisma generate` ejecuta sin errores.
- [ ] `satori`, `@resvg/resvg-js`, `pdf-lib` están en `package.json` y `pnpm install` corre limpio.
- [ ] `public/fonts/diplomas/` contiene los archivos `.ttf`/`.woff2` de Geist y las fuentes adicionales acordadas.
- [ ] `src/lib/validations/diploma.ts` exporta `diplomaTemplateSchema` con reglas condicionales para fecha.
- [ ] Los tres services (`diploma-render-service.ts`, `diploma-template-service.ts`, `diploma-service.ts`) existen con sus firmas públicas y compilan.
- [ ] `scripts/test-diploma-render.ts` genera un PNG y un PDF de prueba a disco usando datos dummy.
- [ ] `pnpm lint` y `pnpm typecheck` pasan.
- [ ] `pnpm build` pasa al cierre de la fase.
