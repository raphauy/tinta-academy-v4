# Student Panel

## Overview

Sección privada donde los alumnos inscritos (en cursos gratuitos o de pago) pueden ver y acceder a sus cursos, material de apoyo, historial de compras y gestionar su perfil. Usa el AppShell con sidebar (variante student).

## User Flows

- Ver lista de cursos inscritos (online y presenciales) en formato de lista vertical
- Acceder a cursos online: ir directo al reproductor de lecciones para continuar o repasar
- Acceder a cursos presenciales: ver página con información del evento y materiales de apoyo
- Descargar material de apoyo de cualquier curso (WSET, talleres, catas, etc.)
- Ver historial de compras/órdenes: fecha, curso, monto pagado
- Ver y editar perfil: nombre, foto, contraseña, teléfono, dirección, preferencias de notificación, datos de facturación

## Design Decisions

- **Lista vertical de cursos:** Diseño de lista en lugar de grid para mostrar más información por curso
- **Diferenciación visual:** Cursos online muestran progreso, cursos presenciales muestran fecha/ubicación
- **Sidebar navigation:** Navegación lateral con items: Mis Cursos, Órdenes, Perfil
- **Recursos accesibles:** Materiales descargables visibles en cada curso

## Data Used

**Entities:** Student, EnrolledCourse, Order, Progress, Resource, Module, Lesson

**From global model:**
- Student (profile, contact, billing info)
- EnrolledCourse (with progress for online, eventInfo for in-person)
- Order (payment history)
- Resource (downloadable materials)

## Visual Reference

See `course-list.png`, `order-history.png`, `profile.png` for target UI designs.

## Components Provided

- `CourseList` — Main course list with enrolled courses
- `CourseCard` — Individual enrolled course with status/progress
- `ProgressBar` — Visual progress indicator
- `OrderHistory` — Order list table
- `OrderRow` — Individual order row
- `Profile` — Profile editing form

## Callback Props

| Callback | Description |
|----------|-------------|
| `onContinueCourse` | Called when user clicks to continue online course |
| `onViewCourseDetails` | Called when user clicks to view course details |
| `onDownloadResource` | Called when user downloads a resource |
| `onViewOrder` | Called when user views order details |
| `onSaveProfile` | Called when user saves profile changes |
| `onUpdateNotifications` | Called when user updates notification preferences |
