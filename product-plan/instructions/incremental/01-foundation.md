# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

The app uses different shells based on user role:

1. **Public Shell** — Header-based navigation for landing/catalog
   - Logo, Cursos, Sobre WSET, Contacto
   - Iniciar Sesión, Registrarse buttons

2. **Student Shell** — Sidebar navigation
   - Mis Cursos, Continuar Aprendiendo, Calendario
   - Mi Progreso, Mis Datos
   - User menu at bottom

3. **Educator Shell** — Sidebar navigation
   - Dashboard, Mis Cursos, Crear Curso
   - Alumnos, Comunicaciones, Estadísticas
   - User menu with "Ver como alumno" option

4. **Admin Shell** — Sidebar navigation (wider: 260px)
   - Dashboard, Cursos, Usuarios (submenu)
   - Órdenes, Cupones, Datos Bancarios
   - Comunicaciones, Configuración
   - User menu at bottom

**Wire Up Navigation:**

Connect navigation items to your router:
- Active state based on current route
- Role-based visibility of menu items
- Responsive behavior (collapsible sidebar on tablet, hamburger on mobile)

**User Menu:**

The user menu expects:
- User name
- Avatar URL (optional, show initials if missing)
- Logout callback
- Optional role switcher (educator → student view)

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
