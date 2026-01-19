---
description: Implementa las tareas de una fase del milestone
---

# Implementar Fase de Milestone

## Contexto

Implementas las tareas atómicas de una fase específica, siguiendo el formato Ralph Wiggum de una tarea a la vez con verificación entre cada una.

**No requiere argumentos** - automáticamente encuentra la primera fase lista para implementar.

## Archivos a leer

Lee estos archivos para entender el contexto:

1. **AGENT.md**: `@plans/AGENT.md` - Arquitectura y convenciones del proyecto

## Tu tarea

### 1. Buscar fases listas para implementar

Escanea `plans/milestones/*/phases.json` para encontrar fases con estado `planned` o `implementing`.

**Orden de prioridad**:
- Primero: fases en estado `implementing` (continuar trabajo en progreso)
- Segundo: fases en estado `planned` (comenzar nueva fase)
- Dentro de cada milestone: por número de fase ascendente

Si no hay fases listas:
```
No hay fases listas para implementar.

Opciones:
- Ejecuta /diseñar-fase para diseñar la próxima fase pendiente
- Todas las fases existentes ya están completadas
```

### 2. Confirmar antes de proceder

Muestra la fase encontrada y la primera tarea pendiente:

```
Milestone: [nombre]
Fase: [numero] - [nombre de la fase]
Status: [planned|implementing]

Próxima tarea: [id] [[category]] [description]

¿Implementar esta tarea? (responde 'ok' para continuar)
```

**NO CONTINÚES** hasta que el usuario responda 'ok' o confirme.

### 3. Leer contexto según categoría

Lee siempre:
- `plans/milestones/[milestone]/phases.json`
- `plans/milestones/[milestone]/fase-[numero].tasks.json`
- PRD del milestone (ruta en `prdPath`)
- `AGENT.md` para arquitectura

**SOLO si la tarea es de categoría `ui`**:
- Lee el skill `@.claude/skills/frontend-design/SKILL.md` para patrones de UI

**NO leas el skill de frontend para otras categorías** (config, schema, services, server-actions, api).

### 4. Actualizar estado a 'implementing'

Si no está ya en `implementing`, modifica `phases.json`.

### 5. Verificar tareas pendientes

Lee `fase-N.tasks.json` y encuentra las tareas con `"passes": false`.

Si no hay tareas pendientes:
```
<promise>COMPLETE</promise>

Todas las tareas de la fase [numero] están completadas.
Ejecutando verificación final: pnpm build

[resultado del build]

Actualizando estado a 'completed'.

Próximo paso:
  /diseñar-fase  (para diseñar la siguiente fase)
```

Ejecuta `pnpm build` y actualiza el estado a `completed`.

### 6. Implementar UNA tarea

Selecciona la primera tarea con `passes: false` (respetando el orden de IDs).

Para la tarea seleccionada:
1. Muestra qué tarea vas a implementar
2. Sigue los steps definidos en la tarea
3. Usa la arquitectura definida en AGENT.md
4. **Si es categoría `ui`**: aplica los patrones del skill frontend-design

### 7. Verificar EN SECUENCIA

Después de implementar, ejecuta verificación:

```bash
pnpm lint       # Primero lint
pnpm typecheck  # Luego typecheck
```

- Corrige errores de cada paso antes de continuar al siguiente
- Si hay errores, corrígelos antes de marcar como completado
- **NO ejecutes `pnpm build`** - eso solo se hace al completar la fase

### 8. Actualizar el tasks.json

Cambia `"passes": false` a `"passes": true` SOLO para la tarea completada.

### 9. Solicitar verificación manual

```
Tarea [id] completada: [description]

Archivos modificados:
- [lista de archivos]

Para probar:
- [instrucciones de cómo probar la funcionalidad]

Por favor prueba la funcionalidad y responde 'ok' para hacer el commit.
```

**NO CONTINÚES** hasta que el usuario responda 'ok'.

### 10. Hacer git commit

Solo después de la confirmación del usuario:

```bash
git add [archivos de código modificados] [archivo tasks.json]
git commit -m "feat([milestone] [id]): [description breve]"
```

**IMPORTANTE**:
- Solo hacer `git add` de los archivos que modificaste en esta tarea específica
- **SIEMPRE incluir el archivo `fase-N.tasks.json`** que actualizaste en el paso 8
- NO usar `git add .` para evitar commitear cambios no relacionados

Ejemplo:
```bash
git add prisma/schema.prisma plans/milestones/email-communications/fase-1.tasks.json
git commit -m "feat(email-communications 1.01): create email template models"
```

### 11. Informar progreso

```
Commit realizado.

Progreso fase [numero]: X/Y tareas completadas

Para continuar con la siguiente tarea:
  /implementar-fase
```

## Flujo de una sesión típica

```
Usuario: /implementar-fase

Claude:
Milestone: email-communications
Fase: 1 - Fundamentos
Status: planned

Próxima tarea: 1.01 [schema] Create EmailTemplate and EmailCampaign models

¿Implementar esta tarea? (responde 'ok' para continuar)

Usuario: ok

Claude:
Implementando tarea 1.01...

[Implementa la tarea...]

Tarea 1.01 completada.

Archivos modificados:
- prisma/schema.prisma

Para probar:
- Verificar que la migración se aplicó correctamente
- Revisar los modelos en Prisma Studio: pnpm prisma studio

Por favor prueba y responde 'ok' para hacer el commit.

Usuario: ok

Claude:
Commit realizado: feat(email-communications 1.01): create email template models

Progreso fase 1: 1/5 tareas completadas

Para continuar:
  /implementar-fase
```

## Ejemplo de uso

```
/implementar-fase
```

El comando encontrará automáticamente la primera fase y tarea pendiente.

## CRÍTICO

- Implementar **exactamente UNA tarea** por ejecución
- No hacer dos, no hacer tres - **UNA**
- Verificar con `pnpm lint` y `pnpm typecheck` (en secuencia) antes de marcar como completada
- **NO ejecutar `pnpm build`** por tarea - solo al completar la fase
- Esperar confirmación del usuario antes del commit
- **NO usar `git add .`** - solo agregar archivos de código + el `fase-N.tasks.json` actualizado
- Si todas las tareas están completas, ejecutar `pnpm build` y responder con `<promise>COMPLETE</promise>`
- Seguir siempre la arquitectura definida en AGENT.md
- **Solo leer skill frontend-design para tareas de categoría `ui`**
