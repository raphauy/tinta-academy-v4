---
argument-hint: <milestone>
description: Divide un PRD de milestone en fases manejables
---

# Dividir Milestone en Fases

## Contexto

Divides el PRD de un milestone en fases de implementación manejables, creando la estructura de archivos necesaria para el desarrollo por fases.

## ARGUMENTS

El parámetro `$ARGUMENTS` es el nombre del milestone (ej: `email-communications`, `payment-system`).

Si no se proporciona argumento, muestra un error indicando que es requerido.

## Archivos a leer

1. **PRD del milestone**: `plans/milestones/$ARGUMENTS.prd.md`
   - Este archivo DEBE existir
   - Si no existe, informa al usuario y termina

## Tu tarea

### 1. Verificar que existe el PRD

```
plans/milestones/$ARGUMENTS.prd.md
```

Si no existe, responde:
```
Error: No se encontró el PRD en plans/milestones/$ARGUMENTS.prd.md

Para usar este comando, primero crea el PRD del milestone.
```

### 2. Analizar el PRD

Lee el PRD completo y extrae:
- Secciones principales de funcionalidad
- Fases de implementación sugeridas (si las hay)
- Dependencias entre componentes
- Modelos de datos
- Componentes UI
- APIs/Endpoints

### 3. Proponer división en fases

Diseña una división lógica en 4-8 fases que sigan estos principios:
- Cada fase debe ser implementable en 1-3 días
- Las fases iniciales deben crear los fundamentos (schema, servicios base)
- Las fases siguientes construyen sobre las anteriores
- Agrupar funcionalidades relacionadas
- Terminar con fases de polish y edge cases

Presenta la propuesta al usuario:

```
Analizando PRD: $ARGUMENTS.prd.md

Fases propuestas:
1. [Nombre] - [Descripción breve de qué incluye]
2. [Nombre] - [Descripción breve]
...

¿Confirmar esta división? (escribe 'ok' para confirmar, o sugiere cambios)
```

### 4. Esperar confirmación del usuario

**NO CONTINÚES** hasta que el usuario responda 'ok' o confirme.

Si el usuario sugiere cambios, ajusta las fases y presenta de nuevo.

### 5. Crear estructura de archivos

Una vez confirmado, crea:

#### Carpeta del milestone
```
plans/milestones/$ARGUMENTS/
```

#### phases.json
```json
{
  "milestone": "$ARGUMENTS",
  "prdPath": "../$ARGUMENTS.prd.md",
  "createdAt": "[fecha actual YYYY-MM-DD]",
  "phases": [
    {
      "id": 1,
      "name": "[Nombre de fase 1]",
      "status": "pending",
      "descriptionFile": "fase-1.md",
      "tasksFile": "fase-1.tasks.json"
    },
    ...
  ]
}
```

#### fase-N.md para cada fase

Crear un archivo `fase-N.md` con este formato:

```markdown
# Fase N: [Nombre de la Fase]

## Descripcion
[Breve explicación de qué se logra en esta fase]

## Incluye
- [Funcionalidad 1]
- [Funcionalidad 2]
- [Componentes X, Y, Z]

## Secciones del PRD Relacionadas
- [Referencia a sección específica del PRD]

## Dependencias
- Ninguna (si es la primera fase)
- O: Fase N-1 completada

## Criterios de Completitud
- [ ] [Criterio 1]
- [ ] [Criterio 2]
- [ ] [Criterio 3]
```

### 6. Confirmar creación

Al terminar, muestra:

```
Estructura creada en plans/milestones/$ARGUMENTS/

Archivos:
- phases.json (N fases en estado 'pending')
- fase-1.md
- fase-2.md
...

Próximo paso:
  /diseñar-fase $ARGUMENTS 1
```

## Estados de fase

- `pending` - Fase definida pero no diseñada
- `designing` - Agente de diseño trabajando
- `planned` - Diseño completo, tasks.json creado
- `implementing` - Agente de implementación trabajando
- `completed` - Todas las tareas completadas

## Ejemplo de uso

```
/dividir-milestone email-communications
```

## CRÍTICO

- No crear nada hasta que el usuario confirme la división propuesta
- Cada fase debe tener dependencias claras
- Los nombres de fase deben ser descriptivos y concisos
- Referenciar secciones específicas del PRD en cada fase-N.md
