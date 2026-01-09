---
argument-hint: [milestone]
description: Ejecuta una iteración del método Ralph Wiggum
---

# Ralph Wiggum - Una Iteración

## Archivos a leer

Lee estos archivos para entender el contexto:

- @plans/AGENT.md - Instrucciones de build/test y arquitectura
- @plans/progress-XX.txt - Progreso del milestone actual (XX = número del PRD, ej: progress-06.txt para 06-checkout)
- @plans/prd/$ARGUMENTS.json - PRD del milestone (ej: 06-checkout)

## ARGUMENTS por defecto: 06-checkout

## Tu tarea

1. **Lee el PRD** del milestone `$ARGUMENTS` (ej: `plans/prd/02-landing.json`)

2. **Encuentra UN item** con `"passes": false`:
   - Elige el que TÚ consideres de mayor prioridad
   - Generalmente el primero no completado, pero usa tu criterio si hay dependencias

3. **Si no hay items pendientes**:
   - Responde con `<promise>COMPLETE</promise>` y termina

4. **Implementa SOLO ese item**:
   - Sigue los steps definidos en el PRD
   - Usa la arquitectura definida en AGENT.md (Services → Prisma, Server Actions para mutations)

5. **Verifica EN SECUENCIA** (no en paralelo):
   ```bash
   pnpm tsc --noEmit   # Primero typecheck
   pnpm lint           # Luego lint
   pnpm build          # Finalmente build
   ```
   - Corrige errores de cada paso antes de continuar al siguiente

6. **Actualiza el PRD**:
   - Cambia `"passes": false` a `"passes": true` SOLO para el item completado

7. **Documenta en progress.txt**:
   - Agrega una entrada con fecha, item completado, decisiones técnicas, y sugerencia para el siguiente paso

8. **Detente y solicita verificación manual**:
   - Informa al usuario qué se implementó y cómo probarlo
   - Indica claramente: "Por favor prueba la funcionalidad y responde 'ok' para hacer el commit"
   - **NO continúes hasta que el usuario responda**

9. **Haz git commit** (solo después de la confirmación del usuario):
   - Mensaje descriptivo del cambio realizado
   - Incluye el ID del item (ej: "feat(2.10): copy landing UI components")

## CRÍTICO

- Completa **exactamente UN item** por ejecución
- No hagas dos, no hagas tres - **UNO**
- Si el PRD no tiene items pendientes, responde `<promise>COMPLETE</promise>`

## Ejemplo de uso

```
/ralph-once 02-landing
```
