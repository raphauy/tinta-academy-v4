# Sistema de Desarrollo por Fases para Milestones

Sistema de 3 comandos para desarrollar cualquier milestone en fases manejables, permitiendo diseño e implementación en paralelo.

## Comandos Disponibles

| Comando | Descripcion |
|---------|-------------|
| `/dividir-milestone <nombre>` | Divide un PRD en fases (requiere nombre) |
| `/diseñar-fase` | Diseña la próxima fase pendiente (auto-detecta) |
| `/implementar-fase` | Implementa la próxima tarea (auto-detecta) |

## Flujo de Trabajo

```
PRD del Milestone (email-communications.prd.md)
         │
         ▼ /dividir-milestone email-communications
┌─────────────────────────────────────────────────┐
│ phases.json + fase-1.md + fase-2.md + ...       │
└─────────────────────────────────────────────────┘
         │
         ▼ /diseñar-fase (auto-detecta fase pendiente)
┌─────────────────────────────────────────────────┐
│ fase-1.tasks.json (tareas atomicas)             │
└─────────────────────────────────────────────────┘
         │
         ▼ /implementar-fase (auto-detecta tarea pendiente)
┌─────────────────────────────────────────────────┐
│ Codigo implementado + commits                   │
└─────────────────────────────────────────────────┘
```

**Trabajo paralelo**: Mientras `/implementar-fase` corre en Fase 1, puedes abrir otra sesion y correr `/diseñar-fase` para Fase 2.

## Estructura de Archivos

```
plans/milestones/
├── README.md                          # Este archivo
├── email-communications.prd.md        # PRD del milestone
└── email-communications/              # Carpeta de fases (creada por /dividir-milestone)
    ├── phases.json                    # Estado central de todas las fases
    ├── fase-1.md                      # Descripcion breve (pre-diseño)
    ├── fase-1.tasks.json              # Tareas detalladas (post-diseño)
    ├── fase-2.md
    ├── fase-2.tasks.json
    └── ...
```

## Estados de Fase

| Estado | Descripcion |
|--------|-------------|
| `pending` | Fase definida pero no diseñada |
| `designing` | Agente de diseño trabajando |
| `planned` | Diseño completo, tasks.json creado |
| `implementing` | Agente de implementacion trabajando |
| `completed` | Todas las tareas completadas + build exitoso |

## Ejemplo Completo

### 1. Crear PRD del milestone

Escribi tu PRD en `plans/milestones/mi-feature.prd.md`

### 2. Dividir en fases

```bash
/dividir-milestone mi-feature
```

Esto crea la estructura de fases. Confirma la division propuesta.

### 3. Diseñar primera fase

```bash
/diseñar-fase
```

Auto-detecta la primera fase `pending` y crea `fase-1.tasks.json`.

### 4. Implementar primera fase

```bash
/implementar-fase
```

Auto-detecta la primera tarea pendiente. Implementa una tarea a la vez con:
- Verificacion: `pnpm lint` → `pnpm typecheck`
- Confirmacion del usuario antes del commit
- `pnpm build` solo al completar la fase

### 5. Trabajo en paralelo (opcional)

Mientras se implementa fase 1, en otra terminal:

```bash
/diseñar-fase
```

## Categorias de Tareas

| Categoria | Descripcion | Depende de |
|-----------|-------------|------------|
| `config` | Variables de entorno, configuraciones | - (primera) |
| `schema` | Cambios en Prisma/base de datos | config |
| `services` | Capa de servicios (src/services/*.ts) | schema |
| `server-actions` | Server actions para mutations | services |
| `api` | Solo webhooks, cron jobs, APIs externas | services |
| `ui` | Componentes, paginas | server-actions, api |

**Orden de dependencias**:
```
config → schema → services → server-actions → ui
                          ↘ api ↗
```

## Formato de phases.json

```json
{
  "milestone": "email-communications",
  "prdPath": "../email-communications.prd.md",
  "createdAt": "2025-01-19",
  "phases": [
    {
      "id": 1,
      "name": "Fundamentos",
      "status": "pending",
      "descriptionFile": "fase-1.md",
      "tasksFile": "fase-1.tasks.json"
    }
  ]
}
```

## Formato de fase-N.tasks.json

```json
[
  {
    "id": "1.01",
    "category": "schema",
    "description": "Create EmailTemplate and EmailCampaign models",
    "steps": [
      "Add EmailTemplate model with fields from PRD",
      "Run: pnpm prisma migrate dev --name add_email_models",
      "Verify with pnpm lint",
      "Verify with pnpm typecheck"
    ],
    "passes": false
  }
]
```

## Verificacion

| Momento | Comandos |
|---------|----------|
| Por tarea | `pnpm lint` → `pnpm typecheck` |
| Al completar fase | `pnpm build` |

## Skill de Frontend

Para tareas de categoria `ui`, el comando `/implementar-fase` usa automaticamente el skill `frontend-design` que incluye:
- Patrones de Server Actions con `ActionResult<T>`
- Formularios con react-hook-form + zod
- Componentes Shadcn UI
- Patrones RSC con Suspense

Ubicacion: `.claude/skills/frontend-design/SKILL.md`

## Tips

1. **Fases pequeñas**: Cada fase debe ser completable en 1-3 dias
2. **Tareas atomicas**: Cada tarea debe ser completable en 15-45 minutos
3. **Un commit por tarea**: Facilita tracking y rollback
4. **Paralelo cuando sea posible**: Diseñar fase N+1 mientras se implementa fase N
5. **Config primero**: Si la fase necesita env vars, la primera tarea debe ser `config`
