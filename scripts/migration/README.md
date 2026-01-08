# Migration Scripts - Tinta Academy v3 → v4

Scripts para migrar datos desde la base de datos de v3 a v4.

## Fuente de datos

- **Proyecto v3:** `/home/raphael/desarrollo/tinta-academy-v3`
- **DB v3:** Neon PostgreSQL (ver `.env` en v3)

## Scripts de migración

| Script | Descripción | Estado |
|--------|-------------|--------|
| `migrate-educators.ts` | Migrar educadores (crear Users + Educators) | ✅ Completado |
| `migrate-courses.ts` | Migrar cursos con mapeo de tipos/status | ✅ Completado |
| `migrate-students.ts` | Migrar estudiantes (crear Users + Students) | ✅ Completado |
| `migrate-enrollments.ts` | Migrar enrollments desde Orders | Pendiente |

## Archivos de mapeo generados

| Archivo | Descripción |
|---------|-------------|
| `educator-mapping.json` | v3 educatorId → v4 educatorId |
| `course-mapping.json` | v3 courseId → v4 courseId |
| `student-mapping.json` | v3 studentId → v4 studentId |

Estos archivos son necesarios para las migraciones subsiguientes.

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

## Ejecución (desarrollo)

Los scripts deben ejecutarse **en orden** debido a dependencias:

```bash
# 1. Migrar educadores (genera educator-mapping.json)
pnpm tsx scripts/migration/migrate-educators.ts

# 2. Migrar cursos (usa educator-mapping.json, genera course-mapping.json)
pnpm tsx scripts/migration/migrate-courses.ts

# 3. Migrar estudiantes (genera student-mapping.json)
pnpm tsx scripts/migration/migrate-students.ts

# 4. Migrar enrollments (usa student-mapping.json y course-mapping.json)
pnpm tsx scripts/migration/migrate-enrollments.ts
```

## Variables de entorno necesarias

```env
# En .env.local
DATABASE_URL=...              # DB de v4 (pooled connection)
DIRECT_DATABASE_URL=...       # DB de v4 (direct connection - para scripts)
V3_DATABASE_URL=...           # DB de v3 (origen)
```

## Ejecución en PRODUCCIÓN

### Paso 1: Aplicar migraciones de Prisma

```bash
# Asegúrate de que DIRECT_DATABASE_URL apunta a producción
pnpm prisma migrate deploy
```

### Paso 2: Configurar variables para producción

Crea un archivo `.env.production` o exporta temporalmente:

```bash
export DIRECT_DATABASE_URL="postgresql://prod-v4-direct..."
export V3_DATABASE_URL="postgresql://prod-v3..."
```

### Paso 3: Ejecutar scripts de datos

```bash
# Los archivos de mapping se regenerarán para producción
pnpm tsx scripts/migration/migrate-educators.ts
pnpm tsx scripts/migration/migrate-courses.ts
pnpm tsx scripts/migration/migrate-students.ts
pnpm tsx scripts/migration/migrate-enrollments.ts
```

### Alternativa: Script de migración completa

```bash
pnpm tsx scripts/migration/migrate-all.ts
```

## Idempotencia

Los scripts son **idempotentes**: si un registro ya existe (mismo email para usuarios, mismo slug para cursos), se salta y se agrega al mapeo. Esto permite re-ejecutar los scripts sin duplicar datos.

## Rollback (solo si es necesario)

```sql
-- CUIDADO: Esto borra todos los datos migrados
DELETE FROM "Enrollment";
DELETE FROM "Student";
DELETE FROM "Course";
DELETE FROM "Educator";
DELETE FROM "User" WHERE role IN ('student', 'educator');
```
