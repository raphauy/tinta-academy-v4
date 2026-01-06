# Migration Scripts - Tinta Academy v3 → v4

Scripts para migrar datos desde la base de datos de v3 a v4.

## Fuente de datos

- **Proyecto v3:** `/home/raphael/desarrollo/tinta-academy-v3`
- **DB v3:** Neon PostgreSQL (ver `.env` en v3)

## Scripts de migración

| Script | Descripción | Estado |
|--------|-------------|--------|
| `migrate-educators.ts` | Migrar educadores (crear Users + Educators) | Pendiente |
| `migrate-courses.ts` | Migrar cursos con mapeo de tipos/status | Pendiente |
| `migrate-students.ts` | Migrar estudiantes (crear Users + Students) | Pendiente |
| `migrate-orders.ts` | Migrar órdenes/inscripciones | Pendiente |

## Mapeo de datos

### CourseType (v3 → v4)

| v3 | v4 type | v4 wsetLevel |
|----|---------|--------------|
| `WSET_NIVEL_1` | `wset` | `1` |
| `WSET_NIVEL_2` | `wset` | `2` |
| `WSET_NIVEL_3` | `wset` | `3` |
| `TALLER` | `taller` | `null` |
| `CATA` | `cata` | `null` |
| `CURSO` | `curso` | `null` |

### CourseStatus (v3 → v4)

| v3 | v4 |
|----|-----|
| `Anunciado` | `announced` |
| `Inscribiendo` | `enrolling` |
| `Finalizado` | `finished` |

### CourseModality

v3 no tiene este campo. Se debe inferir:
- Si `location` contiene "Online" o "Virtual" → `online`
- Default → `presencial`

### Dates

| v3 | v4 |
|----|-----|
| `classDates[0]` | `startDate` |
| `classDates[last]` o `examDate` | `endDate` |
| `totalDuration` + `classDuration` | `duration` (string, ej: "8 horas") |

### Educator

v3 tiene Educators standalone. v4 requiere User asociado.
- Crear User con email ficticio `{slug}@educator.tinta.academy`
- Crear Educator relacionado al User
- Guardar mapeo de IDs para migración de cursos

## Ejecución

```bash
# Migrar educadores primero (los cursos dependen de ellos)
pnpm tsx scripts/migration/migrate-educators.ts

# Migrar cursos
pnpm tsx scripts/migration/migrate-courses.ts

# Migrar estudiantes (futuro)
pnpm tsx scripts/migration/migrate-students.ts
```

## Variables de entorno necesarias

```env
# En .env.local de v4
DATABASE_URL=...         # DB de v4 (destino)
V3_DATABASE_URL=...      # DB de v3 (origen)
```
