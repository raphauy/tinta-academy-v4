# Glosario — Tinta Academy

Lenguaje ubicuo del dominio. **Solo definiciones, aliases prohibidos y relaciones**. Ninguna decisión de implementación: eso vive en los PRDs y archivos de fase.

Formato por término:
- **Definición concisa**.
- *Aliases a evitar* (si aplica).
- *Relaciones* (con cardinalidad).

---

## Diplomas

### Diploma
Documento de finalización que se entrega a un estudiante por haber participado de un curso. Lo emite la plataforma componiendo una plantilla con datos del estudiante. **No aplica a cursos WSET** (esos los emite WSET London directamente).
- *Aliases a evitar:* "certificado" (en este sistema usamos "diploma").
- *Relaciones:* 1 Curso → 0..1 Plantilla de diploma → 0..N Emisiones de diploma (una por estudiante elegible).

### Plantilla de diploma (`DiplomaTemplate`)
Configuración asociada a un curso. Consta de una **imagen base** (subida por el educador) y la posición + estilo tipográfico de cada variable a renderizar encima. **Una por curso** (relación 1:1, opcional).
- *Aliases a evitar:* "template del curso", "diseño del diploma" (este último ambiguo: el "diseño" es la imagen base, la plantilla es la imagen base + configuración).

### Emisión de diploma (`DiplomaIssue`)
Diploma concreto generado para un par (curso, estudiante). Incluye:
- snapshot del nombre y fecha al momento de la última (re)generación,
- assets renderizados (PNG y PDF en Vercel Blob),
- estado del envío por email.

El snapshot se refresca en cada regeneración explícita por el educador (acciones "Reenviar", "Regenerar diplomas", "Reintentar fallidos"); el email ya entregado no se modifica retroactivamente.
- *Aliases a evitar:* "diploma emitido" en código (en UI sí). En código: `DiplomaIssue`.
- *Relaciones:* (Curso, Estudiante) → 0..1 Emisión. Una emisión está siempre ligada a un `Enrollment`.

### Variables del diploma
Datos dinámicos que la plantilla compone encima de la imagen base. En v1:
- **Nombre del estudiante** — obligatorio. Texto plano. Ver "Nombre del alumno (resolución)" abajo.
- **Fecha** — opcional. Default = "fecha de última clase" del curso; configurable a fecha custom.
- *Aliases a evitar:* "campos" (overlap con form fields).

### Nombre del alumno (resolución)
Texto que se snapshotea en `DiplomaIssue.studentName` al momento de emisión. Se toma **el primer nombre y el primer apellido** para evitar que nombres compuestos largos desborden el diploma. Resolución en orden:
1. Si `Student.firstName` y/o `Student.lastName` están cargados: primer token de cada uno, concatenados con espacio. Ej. `"Gabriela Fabiana" + "Pérez Alvarez"` → `"Gabriela Pérez"`. Si solo hay uno cargado, se usa ese.
2. Sino, si `User.name` no es null: primer token + último token. Ej. `"Juan Carlos López"` → `"Juan López"`.
3. Sino: la parte del email anterior a la `@` (local-part), como último recurso.

El snapshot se re-resuelve en cada regeneración explícita del diploma (acciones "Reenviar", "Regenerar diplomas", "Reintentar fallidos"), de modo que cualquier corrección posterior en el perfil del estudiante se ve reflejada en el asset regenerado.

### Fecha de última clase
Valor calculado: `max(course.classDates)`, con fallback a `course.endDate` y luego `course.startDate`. Es la fecha default que figura en el diploma cuando el educador no la sobreescribe.

### Cursos elegibles (para diploma)
Todos los cursos con `CourseType` distinto de `wset` (es decir: `taller`, `cata`, `curso`, `experiencia`), en cualquier modalidad (`presencial`, `online`, `webinar`).

---

## Roles y actores

### Educador (`educator`)
Usuario con rol `educator`. Gestiona sus propios cursos: contenido, materiales, comunicaciones, **y a partir de esta feature: plantilla de diploma y envío**.

### Estudiante (`student`)
Usuario con rol `student`. Compra cursos, accede a contenido y recibe diplomas.

### Inscripción confirmada
`Enrollment` con `status = confirmed`. Es el universo de estudiantes a los que se les emite diploma cuando el educador dispara el envío. No requiere asistencia ni aprobación en v1.
- *Aliases a evitar:* "alumno confirmado" (usar "estudiante con inscripción confirmada"), "matrícula".
