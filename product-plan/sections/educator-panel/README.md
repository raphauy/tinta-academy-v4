# Educator Panel

## Overview

Panel privado donde los educadores gestionan sus cursos (online y presenciales), crean contenido con módulos/lecciones/videos, ven estadísticas de alumnos y envían comunicaciones por email. Usa el AppShell con variante educador.

## User Flows

- Dashboard inicial muestra métricas: total alumnos, cursos activos, progreso promedio de alumnos, gráficos de evolución
- Ver lista de cursos propios con filtros por tipo (online/presencial) y estado (borrador/publicado/finalizado)
- Crear nuevo curso: seleccionar tipo → completar info básica → agregar contenido → configurar precio → publicar
- Editar curso con tabs: Info básica, Contenido (módulos/lecciones), Precios, Configuración
- Gestionar contenido de curso online: crear módulos, agregar lecciones con video, recursos descargables, evaluaciones
- Reordenar módulos y lecciones con drag & drop
- Ver alumnos inscritos en cada curso con su progreso individual
- Crear y gestionar templates de email con variables dinámicas
- Enviar comunicaciones masivas a alumnos de un curso

## Design Decisions

- **Dashboard con métricas:** Cards con KPIs + mini charts de tendencia
- **Course editor con tabs:** Separación clara de concerns (info, contenido, precios, config)
- **Drag & drop:** Para reordenar módulos y lecciones intuitivamente
- **Variables en emails:** Templates con {{nombre}}, {{curso}} para personalización

## Data Used

**Entities:** Educator, Course, Module, Lesson, Resource, EnrolledStudent, EmailTemplate, EmailCampaign

**From global model:**
- Educator (profile, metrics)
- Course (all fields, both online and presencial)
- Module, Lesson (for online course content)
- EnrolledStudent (for progress tracking)
- EmailTemplate, EmailCampaign (for communications)

## Visual Reference

See `Dashboard.png`, `CourseList.png`, `CourseEditor.png`, `StudentList.png`, `EmailTemplateList.png`, `EmailCampaignList.png`, `SendEmail.png` for target UI designs.

## Components Provided

- `EducatorDashboard` — Main dashboard with metrics
- `MetricCard` — Individual KPI card
- `MiniChart` — Small trend chart
- `CourseList` — List of educator's courses
- `CourseListItem` — Individual course row
- `CourseQuickCard` — Course summary card
- `CourseEditor` — Full course editing interface
- `ModuleCard` — Module in editor with lessons
- `StudentList` — Enrolled students table
- `StudentRow` — Individual student row
- `EmailTemplateList` — Template management
- `EmailTemplateCard` — Individual template
- `EmailCampaignList` — Campaign history
- `EmailCampaignCard` — Individual campaign
- `SendEmail` — Email composition form

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewCourse` | View course details |
| `onCreateCourse` | Create new course |
| `onEdit` | Edit course |
| `onDelete` | Delete course |
| `onPublish` | Publish draft course |
| `onDuplicate` | Duplicate course |
| `onSave` | Save course changes |
| `onCreateModule` | Create new module |
| `onReorderModules` | Reorder modules |
| `onCreateLesson` | Create new lesson |
| `onReorderLessons` | Reorder lessons |
| `onViewStudent` | View student details |
| `onEmailStudent` | Email individual student |
| `onExport` | Export student list |
| `onSend` | Send email campaign |
