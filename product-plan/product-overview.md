# Tinta Academy — Product Overview

## Summary

Plataforma integral de educación que combina cursos presenciales y online. Como Approved Programme Provider de WSET, Tinta Academy ofrece formación especializada en vinos con la flexibilidad de aprender a tu ritmo o en experiencias presenciales guiadas por expertos.

## Key Features

- Landing page moderna con catálogo filtrable por modalidad, tipo y categoría
- Cursos online con estructura modular (módulos → lecciones → videos)
- Videos alojados en Bunny.net con CDN global
- Sistema de progreso con indicadores visuales
- Evaluaciones opcionales (quizzes, mock tests)
- Comentarios y discusión por lección
- Panel de educador completo con drag & drop para ordenar contenido
- Sistema de comunicaciones por email con templates personalizables
- Pagos con MercadoPago y transferencia bancaria
- Diseño responsive (mobile-friendly)

## Planned Sections

1. **Landing & Catálogo** — Página de inicio con hero, propuesta de valor y catálogo filtrable de cursos (presenciales y online).

2. **Cursos Online** — Estructura de módulos y lecciones con reproductor de video, recursos descargables, evaluaciones y comentarios.

3. **Student Panel** — Dashboard personal con cursos inscritos, progreso, acceso a contenido y gestión de datos personales.

4. **Educator Panel** — Herramientas para crear y gestionar cursos, subir videos, configurar contenido y ver estadísticas de alumnos.

5. **Admin** — Gestión de usuarios, órdenes, pagos, cupones, comunicaciones por email y configuración general.

## Data Model

**Core Entities:**
- User — Persona registrada con autenticación via Clerk
- Student — Datos extendidos del alumno (contacto, dirección, facturación)
- Educator — Instructor que crea y gestiona cursos
- Course — Curso presencial u online con módulos y lecciones
- Module — Agrupación temática de lecciones
- Lesson — Lección con video y recursos descargables
- Resource — Archivo descargable asociado a una lección
- Evaluation — Quiz o prueba asociada a módulo/curso
- Enrollment — Inscripción de alumno a curso
- Progress — Seguimiento de avance por lección
- Comment — Comentario en lección
- Order — Orden de pago para inscripción
- Coupon — Cupón de descuento
- BankData — Información bancaria para transferencias
- CourseObserver — Usuario interesado en un curso
- EmailTemplate — Plantilla de comunicación
- EmailCampaign — Envío programado de email

**Key Relationships:**
- User has many Student profiles
- Student has many Enrollments, Orders, Progress, Comments
- Educator has many Courses
- Course has many Modules, Orders, Coupons, Enrollments, EmailCampaigns
- Module has many Lessons and optional Evaluations
- Lesson has many Resources, Comments, Progress records

## Design System

**Colors:**
- Primary: `verde-uva` (#143F3B) — Logo, items activos, botones primarios
- Secondary: `paper` (#EBEBEB) — Fondos claros, hovers
- Neutral: `gris-tinta` (#2E2E2E) — Texto, bordes

**Typography:**
- Heading: Geist (semibold)
- Body: Geist (regular)
- Mono: IBM Plex Mono

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, routing, and application shell
2. **Landing & Catálogo** — Public landing page with hero and filterable course catalog
3. **Student Panel** — Student dashboard with enrolled courses, orders, and profile
4. **Educator Panel** — Educator tools for course management, student tracking, and email campaigns
5. **Admin** — Administrative dashboard with users, orders, coupons, and analytics

Each milestone has a dedicated instruction document in `product-plan/instructions/`.
