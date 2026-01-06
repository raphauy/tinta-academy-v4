# Ralph Wiggum - Guía de Uso

Este directorio contiene la infraestructura para ejecutar el método Ralph Wiggum de desarrollo con agentes de IA.

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `ralph-once.sh` | Script human-in-the-loop (una iteración) |
| `AGENT.md` | Instrucciones de build/test para el agente |
| `progress.txt` | Log de progreso entre sesiones |
| `prd/*.json` | PRDs por milestone |

## Uso

```bash
# Ejecutar una iteración
./plans/ralph-once.sh 02-landing

# El agente:
# 1. Lee PRD + progress.txt + AGENT.md
# 2. Elige UN item con passes: false
# 3. Lo implementa
# 4. Verifica (typecheck, lint, build)
# 5. Actualiza PRD (passes: true)
# 6. Append a progress.txt
# 7. Git commit
```

---

## Guía para Escribir PRDs

### Principio Fundamental

> **UN item = UN commit = UNA unidad de trabajo coherente**

El agente debe poder completar el item en una sesión sin agotar el context window.

### Tamaño de Items

| Muy pequeño (agrupar) | Tamaño correcto | Muy grande (dividir) |
|----------------------|-----------------|---------------------|
| Crear un campo en DB | Crear modelo completo con relaciones | Implementar feature completa end-to-end |
| Agregar un import | Crear componente + integrarlo | Crear 5 componentes + página + API |
| Renombrar variable | Crear API endpoint con validación | Refactorizar módulo entero |

### Cómo Agrupar Tareas Relacionadas

**Mal (muy granular):**
```json
{ "description": "Create Tag model", "passes": false },
{ "description": "Create Course model", "passes": false },
{ "description": "Create Course-Tag relation", "passes": false },
{ "description": "Add wsetLevel field", "passes": false }
```

**Bien (agrupado coherentemente):**
```json
{
  "description": "Create database schema for courses (Course, Tag models with relations)",
  "steps": [
    "Add Tag model: id, name, slug (unique)",
    "Add Course model with all fields from types.ts",
    "Add many-to-many relation Course <-> Tag",
    "Add wsetLevel optional field for WSET courses",
    "Run prisma migrate dev --name add_course_schema",
    "Verify with pnpm typecheck"
  ],
  "passes": false
}
```

### Estructura de un Item

```json
{
  "id": "2.01",
  "category": "schema|api|ui|page|feature|polish",
  "description": "Descripción clara y accionable",
  "steps": [
    "Paso específico 1",
    "Paso específico 2",
    "Comando de verificación"
  ],
  "passes": false
}
```

### Categorías Recomendadas

| Categoría | Cuándo usar |
|-----------|-------------|
| `schema` | Cambios en base de datos (Prisma) |
| `api` | Endpoints, server actions |
| `ui` | Componentes de presentación |
| `page` | Páginas que integran componentes con datos |
| `feature` | Funcionalidad interactiva (filtros, forms) |
| `polish` | Empty states, loading, responsive, a11y |

### Orden de Dependencias

Organizar items de menos a más dependiente:

```
1. schema  → Primero la base de datos
2. api     → Luego los endpoints
3. ui      → Después los componentes
4. page    → Integrar componentes con datos reales
5. feature → Agregar interactividad
6. polish  → Pulir detalles
```

### Errores Comunes

| Error | Problema | Solución |
|-------|----------|----------|
| `prisma db push` | No genera migrations | Usar `prisma migrate dev --name X` |
| Items muy pequeños | Agente agrupa varios | Agrupar en items coherentes |
| Items muy grandes | Agente no termina o hace mal | Dividir en pasos manejables |
| Sin pasos de verificación | No sabemos si funcionó | Agregar `pnpm typecheck`, `pnpm build` |
| Dependencias implícitas | Agente elige item que depende de otro | Usar IDs y orden lógico |
| API routes para lógica interna | Innecesario, más complejo | Usar Server Actions o fetch directo en Server Components |
| Verificación en paralelo | Corrige el mismo error múltiples veces | Ejecutar en secuencia: typecheck → lint → build |

### Arquitectura de Capas

```
RSC/Pages ──────────┬──────────────→ Services → Prisma
                    │ (reads)
Client Components ──┼─→ Server Actions ─→ Services → Prisma
                        (mutations)
```

**Solo los services acceden a Prisma.**

### Cuándo usar cada patrón

| Patrón | Cuándo usar | Quién lo llama |
|--------|-------------|----------------|
| **Services** | Toda lógica de acceso a datos | RSC, Pages, Server Actions |
| **RSC / Pages** | Leer datos para renderizar | Llaman a services directamente |
| **Server Actions** | Mutations (forms, buttons) | Client Components los llaman |
| **API Routes** | SOLO webhooks, integraciones externas | Servicios externos |

**IMPORTANTE:** No crear API routes para operaciones internas de la app.

### Template de PRD

```json
[
  {
    "id": "X.01",
    "category": "schema",
    "description": "Create [models] for [feature]",
    "steps": [
      "Add [Model] with fields: ...",
      "Add relations: ...",
      "Run prisma migrate dev --name [name]",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  },
  {
    "id": "X.02",
    "category": "api",
    "description": "Create API endpoints for [feature]",
    "steps": [
      "Create src/app/api/[route]/route.ts",
      "Implement GET/POST handlers",
      "Add Zod validation",
      "Test with curl or browser"
    ],
    "passes": false
  }
]
```

---

## Mantenimiento

### Regenerar TODO list

Si el PRD se desactualiza o el agente se pierde:

1. Borra items completados que ya no importan
2. O regenera el PRD pidiendo al agente que analice el estado actual

### Entre Milestones

1. Verifica que todos los items tengan `passes: true`
2. Crea backup o commit del PRD completado
3. Crea nuevo PRD para siguiente milestone
4. Limpia progress.txt (opcional, o mantén como historial)

---

## Referencias

- [Video de Matt Pocock sobre Ralph](https://www.youtube.com/watch?v=...)
- [Artículo original de Geoffrey Huntley](https://ghuntley.com/ralph/)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
