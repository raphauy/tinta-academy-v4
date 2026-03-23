---
name: "revisar"
description: "Revisa código modificado verificando correctitud, validaciones, regresiones y adherencia a patrones del proyecto"
---

# Code Review Skill

Revisión exhaustiva del código modificado para garantizar correctitud, consistencia y que no se rompa funcionalidad existente.

## Proceso de Revisión

### Paso 1: Identificar cambios

```bash
git diff --name-only          # Archivos modificados (unstaged)
git diff --cached --name-only # Archivos modificados (staged)
```

Leer cada archivo modificado completo para entender el contexto.

### Paso 2: Revisar correctitud del código

Para cada archivo modificado, verificar:

- **Lógica de negocio**: La implementación resuelve correctamente lo que se pide, sin edge cases sin cubrir
- **Tipos TypeScript**: No hay `any` innecesarios, tipos correctos para params/returns, genéricos bien usados
- **Null safety**: Manejo correcto de valores `null | undefined`, optional chaining donde corresponde
- **Async/await**: No hay promesas sin await, no hay race conditions, errores async propagados correctamente

### Paso 3: Validaciones y schemas

- Schemas Zod en `src/lib/validations/*` actualizados cuando se agregan/modifican campos
- Schema de Prisma (`prisma/schema.prisma`) actualizado si se agregan campos a la DB
- Campos opcionales usados correctamente según la intención
- Mensajes de error en español

### Paso 4: Análisis de regresión

Verificar que los cambios **no rompen funcionalidad existente**:

- **Contratos de funciones**: Si se cambió la firma de un service o server action, buscar TODOS los call sites con `Grep` y confirmar que siguen siendo compatibles
- **Server Actions**: Si se modificó una action en `actions.ts`, verificar que los consumidores del resultado manejan correctamente el `ActionResult<T>`
- **Schemas compartidos**: Si se modificó un schema Zod, verificar todos los formularios/actions que lo usan
- **Tipos exportados**: Si se cambió un type/interface, buscar todos los imports y confirmar compatibilidad
- **Componentes reutilizados**: Si se modificaron props de un componente, buscar todos los usos y verificar que pasan los props requeridos
- **Schema de base de datos**: Si se modificó `prisma/schema.prisma`, verificar que todas las queries/services que usan ese modelo son compatibles
- **Services**: Si se modificó un service en `src/services/*`, verificar todos los consumidores

```bash
# Ejemplo: buscar todos los usos de una función modificada
grep -r "nombreFuncion" src/ --include="*.ts" --include="*.tsx"
```

### Paso 5: Adherencia a patrones del proyecto

Verificar las reglas de CLAUDE.md:

| Regla | Verificación |
|-------|-------------|
| Actions | `src/app/[group]/actions.ts` retornan `ActionResult<T>` |
| Services | Lógica de negocio en `src/services/*.ts`, no en actions |
| Validations | Schemas Zod en `src/lib/validations/*.ts` |
| Auth | Rutas protegidas por role via `src/proxy.ts` middleware |
| Forms | react-hook-form + zod + @hookform/resolvers |
| Dates | America/Montevideo, date-fns + date-fns-tz |
| Uploads | Vercel Blob via upload-service |
| `"use client"` | Solo si hay interactividad real (hooks, eventos) |
| Import aliases | `@/*` → `./src/*` |

### Paso 6: Superficies UI actualizadas

Si el cambio agrega/modifica un campo o comportamiento, verificar que se actualicen **todas** las superficies:

- Formulario de creación
- Formulario/diálogo de edición
- Vista de detalle
- Listados/tablas
- Dashboard/stats si aplica
- Tooltips/badges de estado

### Paso 7: Calidad general

- Strings en español con acentos correctos (á, é, í, ó, ú, ñ)
- No hay `console.log` de debug olvidados (solo `console.error` en catches)
- No hay código comentado sin justificación
- Imports no usados eliminados
- Nombres siguen convenciones: `kebab-case` archivos, `camelCase` funciones, `PascalCase` componentes

### Paso 8: Verificación automática

```bash
pnpm typecheck   # Errores de tipos
pnpm build       # Build completo - detecta errores de RSC, imports rotos, etc.
```

## Veredicto Final

Emitir uno de:

| Veredicto | Significado |
|-----------|-------------|
| **SAFE** | Sin problemas. Listo para commit/deploy |
| **NEEDS_FIXES** | Hay problemas que deben corregirse antes de avanzar. Listar cada uno con archivo y línea |
| **RISKY** | Cambios que podrían causar regresiones en producción. Explicar el riesgo específico y las áreas afectadas |

### Formato de reporte

```
## Code Review

### Archivos revisados
- `archivo1.ts` - breve descripción del cambio
- `archivo2.tsx` - breve descripción del cambio

### Hallazgos
1. [CRITICAL/WARNING/INFO] Descripción del hallazgo (`archivo:línea`)

### Regresiones potenciales
- Descripción del riesgo y componentes afectados (o "Ninguna identificada")

### Veredicto: SAFE | NEEDS_FIXES | RISKY
Justificación breve.
```
