# Tinta Academy — Complete Implementation Instructions

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Test-Driven Development

Each section includes a `tests.md` file with detailed test-writing instructions. These are **framework-agnostic** — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, RSpec, Minitest, PHPUnit, etc.).

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write failing tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions include:
- Specific UI elements, button labels, and interactions to verify
- Expected success and failure behaviors
- Empty state handling (when no records exist yet)
- Data assertions and state validations

---

# Product Overview

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

1. **Landing & Catálogo** — Página de inicio con hero, propuesta de valor y catálogo filtrable de cursos
2. **Cursos Online** — Estructura de módulos y lecciones con reproductor de video, recursos descargables
3. **Student Panel** — Dashboard personal con cursos inscritos, progreso, acceso a contenido
4. **Educator Panel** — Herramientas para crear y gestionar cursos, ver estadísticas de alumnos
5. **Admin** — Gestión de usuarios, órdenes, pagos, cupones, comunicaciones por email

## Data Model

**Core Entities:** User, Student, Educator, Course, Module, Lesson, Resource, Evaluation, Enrollment, Progress, Comment, Order, Coupon, BankData, CourseObserver, EmailTemplate, EmailCampaign

## Design System

**Colors:**
- Primary (verde-uva): `#143F3B`
- Secondary (paper): `#EBEBEB`
- Neutral (gris-tinta): `#2E2E2E`

**Typography:**
- Heading: Geist (semibold)
- Body: Geist (regular)
- Mono: IBM Plex Mono

---

# Milestone 1: Foundation

## Goal

Set up the foundational elements: design tokens, data model types, routing structure, and application shell.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Color Palette:**
- Primary (verde-uva): `#143F3B` — Used for logo, active items, primary buttons
- Secondary (paper): `#EBEBEB` — Used for light backgrounds, hovers
- Neutral (gris-tinta): `#2E2E2E` — Used for text, borders

**Typography:**
- Heading: Geist (semibold)
- Body: Geist (regular)
- Mono: IBM Plex Mono

### 2. Data Model Types

Create TypeScript interfaces for your core entities:

- See `product-plan/data-model/types.ts` for interface definitions
- See `product-plan/data-model/README.md` for entity relationships

**Core Entities to Define:**
- User, Student, Educator
- Course, Module, Lesson, Resource
- Evaluation, Enrollment, Progress
- Comment, Order, Coupon
- BankData, CourseObserver
- EmailTemplate, EmailCampaign

### 3. Routing Structure

Create routes for each section:

**Public Routes:**
- `/` — Landing page with hero and catalog
- `/cursos` — Course catalog
- `/cursos/:slug` — Course detail page
- `/auth/*` — Authentication routes (Clerk)

**Student Routes (authenticated):**
- `/alumno` — Student dashboard / course list
- `/alumno/cursos/:id` — Course player / detail
- `/alumno/ordenes` — Order history
- `/alumno/perfil` — Profile settings

**Educator Routes (authenticated + educator role):**
- `/educador` — Educator dashboard
- `/educador/cursos` — Course list
- `/educador/cursos/:id` — Course editor
- `/educador/cursos/:id/alumnos` — Enrolled students
- `/educador/templates` — Email templates
- `/educador/campanas` — Email campaigns
- `/educador/enviar-email` — Send email form

**Admin Routes (authenticated + admin role):**
- `/admin` — Admin dashboard
- `/admin/cursos` — All courses
- `/admin/estudiantes` — Student list
- `/admin/educadores` — Educator list
- `/admin/usuarios` — User list
- `/admin/datos-bancarios` — Bank data
- `/admin/ordenes` — Order list
- `/admin/cupones` — Coupon list

### 4. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with sidebar navigation
- `MainNav.tsx` — Navigation component with role-based items
- `UserMenu.tsx` — User menu with avatar and dropdown

**Shell Variants:**

1. **Public Shell** — Header-based navigation for landing/catalog
2. **Student Shell** — Sidebar navigation with student menu items
3. **Educator Shell** — Sidebar navigation with educator menu items
4. **Admin Shell** — Sidebar navigation (wider: 260px) with admin menu items

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, typography, spacing)
- [ ] Data model types are defined for all entities
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Shell renders with navigation appropriate to user role
- [ ] Navigation links to correct routes
- [ ] User menu shows user info and logout works
- [ ] Responsive on mobile (hamburger menu, collapsible sidebar)
- [ ] Authentication via Clerk is integrated

---

# Milestone 2: Landing & Catálogo

## Goal

Implement the Landing & Catálogo feature — the public landing page with a cinematic hero, quick filters, and a complete course catalog.

## Overview

This is the main entry point to Tinta Academy. Users arrive and see an atmospheric hero with video background, the value proposition, and quick filter chips. They can browse upcoming and past courses, filter by modality/type/tags, and click through to course details.

**Key Functionality:**
- Display hero with video background, headline, subheadline, and CTA
- Show quick filter chips (Online/Presencial, Curso/Taller/Cata)
- List upcoming courses (future dates) in a responsive grid
- List past/finished courses in a separate section
- Filter courses by modality, type, and tags
- Navigate to course detail page on card click
- Show footer with links, social media, and newsletter signup
- Header with login/register buttons for unauthenticated users

## Components

Copy from `product-plan/sections/landing-and-cat-logo/components/`:
- `LandingCatalogo.tsx`, `Header.tsx`, `Hero.tsx`, `CourseCatalog.tsx`, `CourseCard.tsx`, `Footer.tsx`

## Callbacks to Wire Up

| Callback | Description |
|----------|-------------|
| `onViewCourse` | Navigate to course detail page (`/cursos/:slug`) |
| `onFilter` | Apply filters and update displayed courses |
| `onHeroCTA` | Scroll to catalog section or navigate |
| `onSubscribe` | Submit email to newsletter |
| `onLogin` | Navigate to Clerk login |
| `onRegister` | Navigate to Clerk signup |

## Empty States

- **No upcoming courses:** Show helpful message with option to see past courses
- **No courses match filter:** Show "No se encontraron cursos" with clear filters option
- **No past courses:** Can be hidden entirely if empty

## Files to Reference

- `product-plan/sections/landing-and-cat-logo/README.md`
- `product-plan/sections/landing-and-cat-logo/tests.md`
- `product-plan/sections/landing-and-cat-logo/components/`
- `product-plan/sections/landing-and-cat-logo/types.ts`
- `product-plan/sections/landing-and-cat-logo/sample-data.json`
- `product-plan/sections/landing-and-cat-logo/landing-catalogo.png`

## Done When

- [ ] Tests written and passing
- [ ] Hero displays with video background and content
- [ ] Quick filter chips work and filter the catalog
- [ ] Course cards show all info
- [ ] Clicking course navigates to detail page
- [ ] Footer displays with newsletter form
- [ ] Empty states display properly
- [ ] Responsive on mobile

---

# Milestone 3: Student Panel

## Goal

Implement the Student Panel — the private dashboard where enrolled students can view their courses, track progress, manage orders, and update their profile.

## Overview

This is the authenticated area for students who have enrolled in courses. They can see all their enrolled courses, access course content, download materials, view order history, and manage their personal data.

**Key Functionality:**
- View list of enrolled courses with progress/status indicators
- Continue online courses (navigate to last lesson)
- View in-person course details and materials
- Download resources from any course
- View order history with payment details
- Edit profile (personal info, notifications, billing)
- Uses AppShell with student variant sidebar

## Components

Copy from `product-plan/sections/student-panel/components/`:
- `CourseList.tsx`, `CourseCard.tsx`, `ProgressBar.tsx`, `OrderHistory.tsx`, `OrderRow.tsx`, `Profile.tsx`

## Callbacks to Wire Up

| Callback | Description |
|----------|-------------|
| `onContinueCourse` | Navigate to lesson player |
| `onViewCourseDetails` | Navigate to course detail |
| `onDownloadResource` | Trigger file download |
| `onViewOrder` | Show order details |
| `onSaveProfile` | Save profile changes |
| `onUpdateNotifications` | Save notification preferences |

## Empty States

- **No enrolled courses:** Show CTA to browse catalog
- **No orders:** Show CTA to browse courses
- **First-time student:** Guide to first enrollment

## Files to Reference

- `product-plan/sections/student-panel/README.md`
- `product-plan/sections/student-panel/tests.md`
- `product-plan/sections/student-panel/components/`
- `product-plan/sections/student-panel/types.ts`
- `product-plan/sections/student-panel/sample-data.json`
- `product-plan/sections/student-panel/*.png`

## Done When

- [ ] Tests written and passing
- [ ] Course list displays with progress indicators
- [ ] Continue course navigates to correct lesson
- [ ] Resources can be downloaded
- [ ] Order history displays with all details
- [ ] Profile editing works with validation
- [ ] Empty states display properly
- [ ] Responsive on mobile
- [ ] Uses AppShell with student sidebar variant

---

# Milestone 4: Educator Panel

## Goal

Implement the Educator Panel — the private dashboard where educators manage their courses, view student progress, and send email communications.

## Overview

This is the authenticated area for educators who create and manage courses. They can see dashboard metrics, manage their course catalog, edit course content with modules/lessons/videos, view enrolled students with progress, and send targeted email campaigns.

**Key Functionality:**
- Dashboard with metrics (total students, active courses, progress, trends)
- List of educator's courses with filtering by type/status
- Course editor with tabs (info, content, pricing, settings)
- Drag & drop reordering of modules and lessons
- Video upload integration with Bunny.net
- View enrolled students per course with progress
- Email template management with variables
- Send email campaigns to course students
- View campaign history with open rates

## Components

Copy from `product-plan/sections/educator-panel/components/`:
- `EducatorDashboard.tsx`, `MetricCard.tsx`, `MiniChart.tsx`, `CourseList.tsx`, `CourseListItem.tsx`, `CourseQuickCard.tsx`, `CourseEditor.tsx`, `ModuleCard.tsx`, `StudentList.tsx`, `StudentRow.tsx`, `EmailTemplateList.tsx`, `EmailTemplateCard.tsx`, `EmailCampaignList.tsx`, `EmailCampaignCard.tsx`, `SendEmail.tsx`

## Callbacks to Wire Up

| Callback | Description |
|----------|-------------|
| `onCreateCourse` | Navigate to course creation |
| `onEditCourse` | Navigate to course editor |
| `onPublish` | Publish a draft course |
| `onReorderModules` | Update module order (drag & drop) |
| `onReorderLessons` | Update lesson order within module |
| `onViewStudent` | View student detail |
| `onExport` | Export student list to CSV |
| `onSend` | Send or schedule email campaign |

## Empty States

- **No courses:** Show CTA to create first course
- **No modules in course:** Show "Agrega tu primer módulo"
- **No students enrolled:** Show "Aún no hay alumnos inscritos"
- **No email templates:** Show CTA to create first template
- **No campaigns:** Show "No has enviado comunicaciones aún"

## Files to Reference

- `product-plan/sections/educator-panel/README.md`
- `product-plan/sections/educator-panel/tests.md`
- `product-plan/sections/educator-panel/components/`
- `product-plan/sections/educator-panel/types.ts`
- `product-plan/sections/educator-panel/sample-data.json`
- `product-plan/sections/educator-panel/*.png`

## Done When

- [ ] Tests written and passing
- [ ] Dashboard displays with metrics and charts
- [ ] Course list displays with filter by type/status
- [ ] Course editor works with all tabs
- [ ] Drag & drop reordering works
- [ ] Video upload integration works
- [ ] Student list shows progress per student
- [ ] Email templates CRUD works
- [ ] Email sending/scheduling works
- [ ] Empty states display properly
- [ ] Responsive on mobile
- [ ] Uses AppShell with educator sidebar variant

---

# Milestone 5: Admin

## Goal

Implement the Admin panel — the comprehensive administrative dashboard for managing users, courses, orders, coupons, and platform analytics.

## Overview

This is the authenticated area for administrators with full platform access. They can view comprehensive analytics, manage all courses, handle user roles, process payment orders, configure coupons, and manage bank account information for transfers.

**Key Functionality:**
- Dashboard with platform-wide metrics, charts, and activity feed
- View all courses with analytics and observer lists
- Manage students with stats and CRUD operations
- Manage educators with full CRUD (superadmin only)
- Manage all users with role editing
- Configure bank accounts for transfer payments
- Process orders and mark transfers as paid
- Manage coupons with usage statistics

## Components

Copy from `product-plan/sections/admin/components/`:
- `AdminDashboard.tsx`, `AdminMetricCard.tsx`, `AdminMiniChart.tsx`, `ActivityFeed.tsx`, `TopCoursesCard.tsx`, `AdminCourses.tsx`, `AdminCourseCard.tsx`, `CourseObserversModal.tsx`, `AdminStudents.tsx`, `StudentRow.tsx`, `AdminEducators.tsx`, `EducatorCard.tsx`, `AdminUsers.tsx`, `UserRow.tsx`, `AdminBankData.tsx`, `BankAccountCard.tsx`, `AdminOrders.tsx`, `OrderRow.tsx`, `AdminCoupons.tsx`, `CouponRow.tsx`

## Callbacks to Wire Up

| Callback | Description |
|----------|-------------|
| `onViewDetails` | Navigate to detail view or open modal |
| `onViewObservers` | Open modal with interested users' emails |
| `onEdit` | Open edit modal or navigate to edit page |
| `onDelete` | Delete with confirmation dialog |
| `onCreate` | Open create modal or navigate to create page |
| `onEditRole` | Change user role |
| `onMarkAsPaid` | Process pending transfer as paid |
| `onViewStats` | Show coupon usage statistics |

## Empty States

- **No courses:** Show "No hay cursos creados todavía"
- **No students:** Show "No hay alumnos registrados"
- **No educators:** Show CTA to create first educator
- **No orders:** Show "No hay órdenes registradas"
- **No coupons:** Show CTA to create first coupon
- **No bank accounts:** Show CTA to configure bank data
- **Empty filtered results:** Show "No se encontraron resultados" with clear filters

## Files to Reference

- `product-plan/sections/admin/README.md`
- `product-plan/sections/admin/tests.md`
- `product-plan/sections/admin/components/`
- `product-plan/sections/admin/types.ts`
- `product-plan/sections/admin/sample-data.json`
- `product-plan/sections/admin/*.png`

## Done When

- [ ] Tests written and passing
- [ ] Dashboard displays all metrics, charts, and activity
- [ ] Course list shows with observer counts
- [ ] Observer modal displays emails
- [ ] Student management works with search/filter
- [ ] Educator CRUD works
- [ ] User role editing works
- [ ] Bank data CRUD works
- [ ] Order list displays with filtering
- [ ] Mark as paid functionality works
- [ ] Coupon CRUD works with restrictions
- [ ] Empty states display properly
- [ ] Tables have search, filter, pagination
- [ ] Responsive on mobile
- [ ] Uses AppShell with admin sidebar variant
