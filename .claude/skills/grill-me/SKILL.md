---
name: grill-me
description: Entrevista al usuario implacablemente sobre un plan o diseño hasta llegar a entendimiento común, resolviendo cada rama del árbol de decisiones y afilando el lenguaje del dominio en vivo. Útil para estresar un plan antes de implementar. Uso típico: diseñar una fase del roadmap de una feature.
---

Entrevistame (en español) implacablemente sobre cada aspecto de este plan hasta que tengamos entendimiento común. Recorrer cada rama del árbol de decisiones, resolviendo dependencias entre decisiones una por una.

Si una pregunta se puede responder explorando el código, el `CLAUDE.md` raíz, los PRDs (`plans/milestones/*.prd.md`, `docs/**/prd-*.md`), las fases del milestone (`plans/milestones/<feature>/fase-*.md`, `plans/milestones/<feature>/phases.json`), los docs de features (`docs/**/*.md`) o el glosario (`docs/glosario.md`), explorá esa fuente en lugar de preguntar.

## Conciencia de dominio

Antes de empezar, leer `docs/glosario.md` — es el glosario del lenguaje ubicuo de Tinta Academy (educador, estudiante, curso, modalidad, cohorte, inscripción, orden, cupón, campaña, workflow, plantilla, etc.). Si no existe, crearlo lazy cuando se resuelva el primer término durante la sesión.

El glosario es **solo lenguaje**: definiciones, aliases prohibidos, relaciones y ambigüedades resueltas. Nunca decisiones de implementación ni specs — eso vive en el PRD y en los archivos de fase.

## Modo "diseñar una fase del roadmap de una feature"

Si el usuario invoca el skill mencionando "fase X", "siguiente fase" o el nombre de una feature:

1. Localizar el roadmap de la feature en `plans/milestones/<feature>/phases.json` y el archivo de la fase en `plans/milestones/<feature>/fase-N.md` (o el archivo equivalente que el usuario indique). Si no existe, pedir la referencia.
2. Tomar `Alcance` + `Criterios de "hecha"` de la fase referida como el plan a estresar.
3. Cruzar con el PRD del milestone (`plans/milestones/<feature>.prd.md` o `docs/<feature>/prd-*.md`) para entender el diseño global ya cerrado y NO re-discutir decisiones que ya están firmes ahí.
4. Cruzar con `docs/glosario.md` para alinear términos. Si la fase introduce conceptos nuevos, surge antes que cualquier otra discusión.
5. Identificar las decisiones implícitas que el alcance no cierra (modelo de datos / migración Prisma, contratos de server actions y `ActionResult<T>`, validaciones zod, edge cases, UX, manejo de errores, permisos por rol, timezone/fechas, performance, testing manual).
6. Grillarme una decisión a la vez. No avanzar a la siguiente hasta cerrar la actual.
7. Al final, resumir las decisiones tomadas en una lista clara — lista para entrar a plan mode con todo resuelto.

## Reglas de la entrevista

- Una pregunta a la vez (o un grupo chico cuando son interdependientes).
- **Preferir preguntas con opciones** usando la herramienta `AskUserQuestion` cuando haya alternativas claras. Permitir respuesta libre solo cuando la pregunta es genuinamente abierta.
- Si propongo opciones, dar mi recomendación con tradeoff explícito.
- Si el usuario responde algo ambiguo, repreguntar.
- No inventar — si no sé algo del dominio (WSET, modalidades de cursos, flujo de MercadoPago, transferencias bancarias, Mux, workflows de email), preguntar.
- Cerrar cada rama antes de saltar a otra.
- Respetar las convenciones del proyecto: services como única capa que usa Prisma, server actions sobre API routes con retorno `ActionResult<T>`, validaciones zod en `src/lib/validations/`, route groups por rol (`admin/`, `educator/`, `student/`), middleware en `src/proxy.ts`, fechas en `America/Montevideo` con `date-fns-tz`, formularios con `react-hook-form` + zod, uploads vía Vercel Blob, Next.js 16 App Router, React 19, español con tildes.

## Comportamientos durante la sesión

### Desafiar contra el glosario

Si usás un término que choca con `docs/glosario.md`, marcarlo en el momento. Ejemplo: "El glosario define `cohorte` como una edición concreta de un curso con fechas propias, pero parece que ahora lo estás usando como sinónimo de `curso` — ¿cuál es?".

### Afilar lenguaje difuso

Si usás un término vago o sobrecargado, proponer un término canónico. Ejemplo: "Decís `usuario` — ¿te referís al `superadmin`, al `educator`, al `student`, o al visitante anónimo del landing? Son cosas distintas.".

### Probar con escenarios concretos

Cuando se discuten relaciones entre entidades, inventar escenarios específicos que fuercen precisión en los bordes. Ejemplos:
- "Si un estudiante paga con MercadoPago y el webhook llega después de que cancelara la orden, ¿qué pasa?".
- "Si un cupón está restringido a un curso y a un email, y el email no coincide pero el curso sí, ¿se aplica?".
- "Si un curso `online` cambia su `startDate`, ¿se reagendan los workflows activos o solo los futuros?".

### Cruzar con el código

Si afirmás cómo funciona algo, verificar en el código (services en `src/services/`, schema en `prisma/schema.prisma`, proxy en `src/proxy.ts`). Si hay contradicción, sacarla a flote: "Decís que el `Order` queda `paid` cuando MercadoPago confirma, pero `mercadopago-service.ts` también lo marca en otros estados — ¿cuál es la versión buena?".

### Actualizar el glosario inline

Cuando se cierra un término, agregarlo o corregirlo en `docs/glosario.md` ahí mismo, no al final. Usar el formato definido en ese archivo (definición concisa, aliases a evitar, relaciones con cardinalidad).

`docs/glosario.md` no es spec, no es scratch pad, no es decisiones de implementación. Solo glosario.

## ADRs (opcional)

Ofrecer crear un ADR en `docs/adr/NNNN-slug.md` **solo** cuando las tres condiciones se cumplen:

1. **Difícil de revertir** — el costo de cambiar de opinión más adelante es real (ej.: cambio de schema en producción, integración con proveedor externo, decisión de modelado que toca muchas tablas).
2. **Sorprendente sin contexto** — un futuro lector se va a preguntar "¿por qué hicieron esto así?".
3. **Resultado de un trade-off real** — había alternativas genuinas y se eligió una por razones específicas.

Si falta cualquiera de las tres, saltear el ADR. Formato simple: título corto + 1-3 oraciones (contexto, decisión, motivo). Numeración secuencial escaneando `docs/adr/`.
