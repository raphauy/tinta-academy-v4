---
description: Diseña las tareas atómicas de una fase del milestone
---

# Diseñar Fase de Milestone

## Contexto

Diseñas las tareas atómicas de una fase específica, creando un archivo tasks.json con el formato compatible con el método Ralph Wiggum.

**No requiere argumentos** - automáticamente encuentra la primera fase pendiente del primer milestone no completado.

## Archivos a leer

Lee estos archivos para entender el contexto completo:

1. **AGENT.md**: `@plans/AGENT.md` - Arquitectura y convenciones del proyecto

## Tu tarea

### 1. Buscar milestones con fases pendientes

Escanea `plans/milestones/*/phases.json` para encontrar todos los milestones.

Para cada milestone, busca la primera fase con estado `pending`.

**Orden de prioridad**:
- Primer milestone (alfabéticamente) que tenga fases pendientes
- Primera fase pendiente de ese milestone (por número de fase)

Si no hay fases pendientes en ningún milestone:
```
No hay fases pendientes para diseñar.

Opciones:
- Ejecuta /dividir-milestone <nombre> para crear un nuevo milestone
- Todas las fases existentes ya están diseñadas o completadas
```

### 2. Confirmar antes de proceder

Muestra la fase encontrada y espera confirmación:

```
Milestone: [nombre]
Fase encontrada: [numero] - [nombre de la fase]
Status actual: pending

¿Diseñar esta fase? (responde 'ok' para continuar)
```

**NO CONTINÚES** hasta que el usuario responda 'ok' o confirme.

Si el usuario quiere otra fase, puede especificarla y debes buscarla.

### 3. Leer contexto

Lee:
- `plans/milestones/[milestone]/phases.json` - Estado de las fases
- `plans/milestones/[milestone]/fase-[numero].md` - Descripción de la fase
- PRD del milestone (ruta en `prdPath` de phases.json)
- `AGENT.md` para arquitectura del proyecto

### 4. Actualizar estado a 'designing'

Modifica `phases.json` para cambiar el estado de la fase a `designing`.

### 5. Generar tareas atómicas

Crea tareas siguiendo estos principios:

**Formato de ID**: `N.XX` donde N es el número de fase (ej: `1.01`, `1.02`, `2.01`)

**Categorías** (en orden de dependencias):

| Categoría | Descripción | Depende de |
|-----------|-------------|------------|
| `config` | Variables de entorno, vercel.json, configuraciones | - |
| `schema` | Cambios en Prisma/base de datos, migraciones | config |
| `services` | Capa de servicios (src/services/*.ts) | schema |
| `server-actions` | Server actions para mutations | services |
| `api` | Solo webhooks, cron jobs, APIs externas | services |
| `ui` | Componentes, páginas | server-actions, api |

**Orden de dependencias**:
```
config → schema → services → server-actions → ui
                          ↘ api ↗
```

**Reglas especiales para `config`**:
- Siempre debe ser la PRIMERA categoría si la fase requiere nuevas env vars
- Si faltan variables de entorno, incluir en los steps: "Verificar con usuario que tiene configuradas: [LISTA_VARS]"
- Indicar claramente qué variables son requeridas y para qué

**Principios para tareas**:
- Cada tarea debe ser completable en 15-45 minutos
- Los steps deben ser específicos y verificables
- Cada tarea termina con: `Verify with pnpm lint` → `Verify with pnpm typecheck`
- Respetar el orden de dependencias entre categorías
- La primera tarea de schema debe incluir la migración
- `pnpm build` solo se ejecuta al final de la fase completa

**Estructura de tarea**:
```json
{
  "id": "N.XX",
  "category": "config|schema|services|server-actions|api|ui",
  "description": "Descripción clara de qué se implementa",
  "steps": [
    "Paso específico 1",
    "Paso específico 2",
    "Verify with pnpm lint",
    "Verify with pnpm typecheck"
  ],
  "passes": false
}
```

**Verificación**:
- Cada tarea termina con `pnpm lint` y luego `pnpm typecheck` (en secuencia)
- Solo al completar TODAS las tareas de la fase se ejecuta `pnpm build`

### 6. Crear fase-N.tasks.json

Guarda las tareas en `plans/milestones/[milestone]/fase-[numero].tasks.json`:

```json
[
  {
    "id": "1.01",
    "category": "schema",
    "description": "...",
    "steps": [...],
    "passes": false
  },
  ...
]
```

### 7. Actualizar estado a 'planned'

Modifica `phases.json` para cambiar el estado de la fase a `planned`.

### 8. Mostrar resumen

```
Diseño completado para Fase [numero]: [nombre]

Tareas creadas en fase-[numero].tasks.json:
[id] [[category]] [description]
[id] [[category]] [description]
...

Total: X tareas
Status actualizado a: planned

Próximo paso:
  /implementar-fase
```

## Ejemplo de output de tasks.json

```json
[
  {
    "id": "1.01",
    "category": "config",
    "description": "Configure Resend webhook secret",
    "steps": [
      "Verificar con usuario que tiene configurada: RESEND_WEBHOOK_SECRET",
      "Add RESEND_WEBHOOK_SECRET to .env.example with description",
      "Verify with pnpm lint",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  },
  {
    "id": "1.02",
    "category": "schema",
    "description": "Create EmailTemplate and EmailCampaign models",
    "steps": [
      "Add EmailTemplate model with fields: id, name, subject, body, educatorId",
      "Add EmailCampaign model with all fields from PRD",
      "Add relations to Educator model",
      "Run: pnpm prisma migrate dev --name add_email_models",
      "Verify with pnpm lint",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  },
  {
    "id": "1.03",
    "category": "services",
    "description": "Create email template service",
    "steps": [
      "Create src/services/email-template-service.ts",
      "Implement getTemplates(educatorId)",
      "Implement getTemplate(id, educatorId)",
      "Implement createTemplate(data)",
      "Implement updateTemplate(id, data)",
      "Implement deleteTemplate(id)",
      "Verify with pnpm lint",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  },
  {
    "id": "1.04",
    "category": "server-actions",
    "description": "Create email template actions",
    "steps": [
      "Create src/app/educator/templates/actions.ts",
      "Implement createTemplateAction with Zod validation",
      "Implement updateTemplateAction",
      "Implement deleteTemplateAction",
      "Verify with pnpm lint",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  },
  {
    "id": "1.05",
    "category": "ui",
    "description": "Create email templates list page",
    "steps": [
      "Create src/app/educator/templates/page.tsx",
      "Fetch templates using service",
      "Display table with name, subject, actions",
      "Add create button linking to /educator/templates/create",
      "Verify with pnpm lint",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  }
]
```

**Nota**: Al completar TODAS las tareas de la fase, ejecutar `pnpm build` para verificación final.

## Ejemplo de uso

```
/diseñar-fase
```

El comando encontrará automáticamente la primera fase pendiente.

## CRÍTICO

- Las tareas deben ser ATÓMICAS - una funcionalidad clara por tarea
- Los IDs deben seguir el formato N.XX
- Cada tarea debe tener comandos de verificación
- **Respetar orden de dependencias**: config → schema → services → server-actions/api → ui
- Si hay tareas `config`, DEBEN ser las primeras y verificar env vars con el usuario
- No incluir tareas que no estén en el alcance de la fase
- NO usar categoría `test` - los tests se incluyen en la implementación de cada tarea
