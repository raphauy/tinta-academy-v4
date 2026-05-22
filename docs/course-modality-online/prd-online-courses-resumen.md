# Cursos Online en Tinta Academy - Resumen de Funcionalidad

**Fecha:** 23 de marzo de 2026
**Estado:** Borrador para revisión

---

## Qué es esto

Vamos a agregar a Tinta Academy la posibilidad de ofrecer **cursos online grabados en video**. Esto se suma a las modalidades que ya existen (presencial y webinar). La idea es tener una experiencia de aprendizaje moderna, al estilo de plataformas como Udemy o Coursera, pero integrada dentro de Tinta Academy.

---

## Cómo se organizan los cursos online

Cada curso online se estructura así:

- **Curso** (ej: "Introducción al Mundo del Vino")
  - **Módulo 1** (ej: "Los Fundamentos")
    - Lección 1: video + descripción + materiales opcionales
    - Lección 2: video + descripción + materiales opcionales
    - ...
  - **Módulo 2** (ej: "Regiones Vinícolas")
    - Lección 1, Lección 2, etc.
  - ...

Cada lección tiene un **video**, una **descripción** de lo que se aprende, y opcionalmente **materiales descargables** (PDFs, guías, etc.).

---

## Tipos de curso

- **Cursos gratuitos:** cualquier estudiante registrado puede acceder a todas las lecciones sin costo
- **Cursos pagados:** el estudiante debe comprar el curso para acceder. La compra da acceso **de por vida** a todo el contenido
  - El educador puede marcar algunas lecciones como **"preview"** para que cualquiera pueda verlas antes de comprar (ideal para enganchar al estudiante)
  - Por defecto, la primera lección se marca como preview automáticamente

No hay suscripciones ni acceso a todos los cursos. Cada curso se compra individualmente.

---

## Qué ve el estudiante

### En el catálogo / landing

Los cursos online aparecen junto a los cursos presenciales y webinars en el catálogo, con una **tarjeta** que muestra:
- Imagen del curso
- Badge "Online"
- Título y educador
- Cantidad de módulos, lecciones y horas de contenido
- Precio (o "Gratis")

### Página del curso

Al hacer click en la tarjeta, se ve la información completa del curso:
- Descripción detallada
- **Curriculum completo**: lista de módulos con sus lecciones, duración de cada una
- Las lecciones de preview se marcan como "Gratis"
- Las demás aparecen con un candado
- Botón de compra o de acceso si ya lo compró

### El reproductor de video (la experiencia de aprendizaje)

Al entrar al curso, el estudiante ve una **pantalla completa dedicada al aprendizaje** (se sale del menú normal de Tinta Academy). Esta pantalla tiene:

**Panel lateral izquierdo:**
- Barra de progreso general (ej: "Tu Progreso 12/45 lecciones")
- Buscador de lecciones
- Lista de módulos que se abren/cierran mostrando sus lecciones
- Cada lección muestra si está completada, pendiente, en progreso, o bloqueada
- Duración del video de cada lección

**Zona principal:**
- El **video** con controles de reproducción (incluyendo cambio de velocidad: 0.5x, 1x, 1.5x, 2x)
- Botón para **marcar la lección como completada** (también se marca automáticamente cuando el video llega al 90%)
- Botones para ir a la lección anterior o siguiente
- Tres pestañas debajo del video:
  - **Resumen:** descripción de la lección, puntos clave, y materiales descargables
  - **Comentarios:** los estudiantes pueden dejar preguntas o comentarios, y el educador puede responder
  - **Transcripciones:** por ahora muestra un mensaje de "próximamente"

**En celular:**
- El panel lateral se oculta y aparece como un menú deslizable cuando se toca un botón de "Navegación"
- Todo el contenido se adapta al ancho del celular

---

## Qué puede hacer el educador

Desde su panel, el educador puede:

- **Crear un curso online** con título, descripción, imagen, precio y etiquetas
- **Organizar el contenido en módulos y lecciones**, pudiendo reordenarlos
- **Subir videos** directamente desde el navegador (con barra de progreso de subida)
- **Escribir la descripción** de cada lección
- **Adjuntar materiales** descargables (PDFs, guías, presentaciones)
- **Marcar lecciones como preview** (visibles sin comprar el curso)
- **Ver cómo queda** el curso desde la perspectiva del estudiante

---

## Comentarios

- Los estudiantes pueden comentar en cada lección (preguntas, dudas, observaciones)
- El educador puede responder a los comentarios
- Cuando un estudiante comenta, el educador recibe un **email de notificación** con el comentario y un link para responder
- No hay moderación previa ya que solo pueden comentar estudiantes registrados e identificados

---

## Progreso del estudiante

- El progreso se guarda **automáticamente** mientras el estudiante ve el video
- Cuando el video se completa (90% visto), la lección se marca como completada
- El estudiante también puede **marcar o desmarcar manualmente** una lección como completada
- Si el estudiante sale y vuelve después, el video continúa desde donde lo dejó
- El progreso general del curso es visible en todo momento (ej: "12 de 45 lecciones completadas")

---

## Dónde se alojan los videos

Usamos **Mux**, un servicio profesional de video streaming. Esto significa:
- Los videos se suben una vez y Mux los procesa automáticamente en diferentes calidades
- El video se adapta a la velocidad de internet del estudiante (si tiene mala conexión, baja la calidad automáticamente)
- Los videos están **protegidos**: solo los estudiantes con acceso pueden verlos (no se pueden compartir los links)
- Es el mismo servicio que usan muchas plataformas educativas conocidas

---

## Qué NO incluye esta primera versión

Estas funcionalidades se pueden agregar más adelante:

- **Certificados** al completar el curso
- **Estadísticas para el educador** (cuántos estudiantes vieron cada video, dónde abandonan, etc.)
- **Transcripciones automáticas** de los videos
- **Suscripción** para acceder a todos los cursos con un solo pago mensual

---

## Referencia visual

Tomamos como referencia visual la plataforma agenticjumpstart.com. Las capturas están guardadas en la carpeta `reference-screenshots/` de este documento.
