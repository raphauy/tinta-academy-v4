# Application Shell

## Overview

Tinta Academy uses role-based shells with sidebar navigation for authenticated users and a header-based shell for public pages.

## Shell Variants

### 1. Public Shell (Landing/Catalog)
For unauthenticated visitors browsing courses.

**Layout:** Horizontal header only
**Navigation:**
- Logo (links to home)
- Cursos
- Sobre WSET
- Contacto
- Iniciar Sesión (button)
- Registrarse (button, primary)

**Responsive:**
- Desktop: Full header visible
- Mobile: Logo + hamburger menu

---

### 2. Student Shell
For authenticated students accessing their courses.

**Layout:** Fixed sidebar (240px) + content area
**Navigation:**
- Logo (top)
- Mis Cursos
- Continuar Aprendiendo
- Calendario
- Mi Progreso
- Mis Datos
- ---
- User Menu (bottom)

**Responsive:**
- Desktop: Sidebar visible
- Tablet: Collapsible sidebar (icons only)
- Mobile: Hamburger menu

---

### 3. Educator Shell
For educators managing courses and students.

**Layout:** Fixed sidebar (240px) + content area
**Navigation:**
- Logo (top)
- Dashboard
- Mis Cursos
- Crear Curso
- Alumnos
- Comunicaciones
- Estadísticas
- ---
- User Menu with "Ver como alumno" option

**Responsive:**
- Desktop: Sidebar visible
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu

---

### 4. Admin Shell
For administrators with full platform access.

**Layout:** Fixed sidebar (260px, wider) + content area
**Navigation:**
- Logo (top)
- Dashboard
- Cursos
- Usuarios (submenu: Alumnos, Educadores, Administradores)
- Órdenes
- Cupones
- Datos Bancarios
- Comunicaciones
- Configuración
- ---
- User Menu

**Responsive:**
- Desktop: Sidebar expanded
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu

---

## Design Tokens Applied

**Colors:**
- Primary (verde-uva `#143F3B`): Logo, active items, primary buttons
- Secondary (paper `#EBEBEB`): Light backgrounds, hovers
- Neutral (gris-tinta `#2E2E2E`): Text, borders

**Typography:**
- Heading: Geist (semibold) — Titles, nav items
- Body: Geist (regular) — General text

---

## Components

### AppShell
Main layout wrapper that renders the appropriate shell based on variant prop.

```tsx
<AppShell variant="student">
  <YourPageContent />
</AppShell>
```

### MainNav
Navigation component with:
- Role-based menu items
- Active state styling
- Collapsible on smaller screens

### UserMenu
User menu with:
- Avatar (image or initials)
- User name
- Dropdown: View profile, Change role (if applicable), Logout

---

## Implementation Notes

### Route-Based Shell Selection
Select shell variant based on route prefix:
- `/` or `/cursos/*` → Public shell
- `/alumno/*` → Student shell
- `/educador/*` → Educator shell
- `/admin/*` → Admin shell

### Active State
Highlight current navigation item based on route matching.

### Role Switching
- Educators can "View as student" to see the student experience
- Admins can access any shell variant

### Mobile Navigation
- Hamburger button in top header
- Drawer slides in from left
- Overlay dims content behind
- Close on outside click or nav item selection
