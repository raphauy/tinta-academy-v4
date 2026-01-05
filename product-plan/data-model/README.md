# Data Model

## Overview

Tinta Academy's data model covers users, courses, enrollments, payments, and communications. This document describes the entities and their relationships.

## Core Entities

### User
Persona registrada en la plataforma con autenticación via Clerk. Contiene email, nombre, apellido e imagen de perfil. Puede tener rol de alumno, educador o admin.

### Student
Datos extendidos del alumno incluyendo fecha de nacimiento, teléfono, dirección, ciudad, código postal y país. Cada Student pertenece a un User.

### Educator
Instructor que crea y gestiona cursos. Tiene nombre, título profesional, biografía e imagen de perfil.

### Course
Curso que puede ser presencial u online. Incluye tipo (WSET niveles, taller, cata, curso), estado (anunciado, inscribiendo, finalizado), título, slug, duración, precios en USD y UYU, capacidad máxima, ubicación, fechas de clases, imagen y descripción. Para cursos online, contiene módulos con lecciones.

### Module
Agrupación temática de lecciones dentro de un curso online. Tiene título, descripción y orden de visualización.

### Lesson
Lección individual dentro de un módulo. Contiene título, video (URL de Bunny.net), duración del video y orden de visualización.

### Resource
Archivo descargable asociado a una lección. Puede ser PDF, documento o enlace externo.

### Evaluation
Quiz o prueba que puede asociarse a un módulo específico o al curso completo. Incluye preguntas y respuestas para evaluación del alumno.

### Enrollment
Inscripción de un alumno a un curso. Registra la fecha de inscripción y el estado de acceso.

### Progress
Seguimiento del avance del alumno en cada lección. Indica si la lección fue completada y el timestamp de completado.

### Comment
Comentario de un alumno en una lección específica. Incluye contenido, fecha y autor.

### Order
Orden de pago para inscripción a un curso. Contiene número, estado (Created, Pending, PaymentSent, Paid, Rejected, Refunded, Cancelled), método de pago (MercadoPago, Transferencia, Gratuito), monto, moneda y comentarios de transferencia bancaria.

### Coupon
Cupón de descuento con código único, porcentaje de descuento, máximo de usos, usos actuales, email restringido opcional y fecha de expiración. Puede estar asociado a un curso específico.

### BankData
Información de cuenta bancaria para mostrar al alumno cuando elige pago por transferencia. Incluye nombre del banco e información de la cuenta.

### CourseObserver
Registro de un usuario interesado en un curso para recibir notificaciones cuando el curso esté disponible.

### EmailTemplate
Plantilla reutilizable para comunicaciones por email. Soporta variables dinámicas como nombre del alumno y nombre del curso.

### EmailCampaign
Envío programado de comunicación a los alumnos inscriptos en un curso. Incluye template utilizado, curso destino, fecha/hora de envío y estado.

## Relationships

```
User
├── has many Student (profiles)
├── has many CourseObserver
└── has one role (admin, educator, student, user)

Student
├── belongs to User
├── has many Enrollment
├── has many Order
├── has many Progress
└── has many Comment

Educator
├── belongs to User
└── has many Course

Course
├── belongs to Educator
├── has many Module (online only)
├── has many Order
├── has many Enrollment
├── has many CourseObserver
├── has many EmailCampaign
└── has many Coupon (optional restrictions)

Module
├── belongs to Course
├── has many Lesson
└── has many Evaluation (optional)

Lesson
├── belongs to Module
├── has many Resource
├── has many Comment
└── has many Progress

Enrollment
├── belongs to Student
└── belongs to Course

Progress
├── belongs to Student
└── belongs to Lesson

Order
├── belongs to Student
├── belongs to Course
├── optionally uses Coupon
└── optionally references BankData

Coupon
└── optionally restricted to Course

EmailCampaign
├── uses EmailTemplate
└── targets Course students
```

## Type Definitions

See `types.ts` for complete TypeScript interfaces.

## Sample Data

See `sample-data.json` for example records you can use for testing before connecting to a real database.
