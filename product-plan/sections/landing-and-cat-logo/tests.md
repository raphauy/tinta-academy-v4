# Test Instructions: Landing & Catálogo

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Landing & Catálogo section is the public entry point to Tinta Academy. Test the hero display, course filtering, catalog browsing, and newsletter subscription.

---

## User Flow Tests

### Flow 1: Browse Course Catalog

**Scenario:** User arrives and explores available courses

#### Success Path

**Setup:**
- Page loads with hero content and course data
- At least one upcoming course and one past course exist

**Steps:**
1. User navigates to landing page (`/`)
2. User sees hero with headline "Descubrí el mundo del vino"
3. User sees CTA button "Explorar cursos"
4. User scrolls down to "Próximos Cursos" section
5. User sees course cards with title, date, price, educator name

**Expected Results:**
- [ ] Hero displays with video background (or fallback image)
- [ ] Headline "Descubrí el mundo del vino" is visible
- [ ] Subheadline with value proposition is visible
- [ ] "Explorar cursos" button is visible and clickable
- [ ] "Próximos Cursos" section heading is visible
- [ ] Course cards display with: image, title, date, price (USD), educator name, location

### Flow 2: Filter Courses

**Scenario:** User applies filters to find specific courses

#### Success Path

**Setup:**
- Multiple courses exist with different modalities (online/presencial) and types (wset/taller/cata)

**Steps:**
1. User clicks "Online" chip in hero section
2. User observes catalog updates to show only online courses
3. User clicks "WSET" chip to add filter
4. User observes catalog updates to show only online WSET courses
5. User clicks "Limpiar filtros" or removes filter chips

**Expected Results:**
- [ ] Clicking "Online" chip activates it (visual change)
- [ ] Catalog filters to show only courses with modality: "online"
- [ ] Clicking additional filter refines results
- [ ] Empty state shows if no courses match filters
- [ ] Clearing filters shows all courses again

#### Failure Path: No Courses Match Filter

**Setup:**
- Filters are applied that match no courses

**Expected Results:**
- [ ] Message "No se encontraron cursos con esos filtros" appears
- [ ] "Limpiar filtros" or "Ver todos" link is visible
- [ ] Clicking clear shows all courses again

### Flow 3: View Course Details

**Scenario:** User clicks a course to see details

**Steps:**
1. User sees a course card in the catalog
2. User clicks on the course card or "Ver detalles" button

**Expected Results:**
- [ ] `onViewCourse` callback is called with the course slug
- [ ] User is navigated to `/cursos/:slug` (implementation handles routing)

### Flow 4: Subscribe to Newsletter

**Scenario:** User subscribes to newsletter in footer

#### Success Path

**Setup:**
- Footer with newsletter form is visible

**Steps:**
1. User scrolls to footer
2. User enters email "test@example.com" in newsletter input
3. User clicks "Suscribirme" button

**Expected Results:**
- [ ] `onSubscribe` callback is called with email value
- [ ] Success message appears (e.g., "¡Gracias por suscribirte!")
- [ ] Input is cleared after successful submission

#### Failure Path: Invalid Email

**Steps:**
1. User enters invalid email "not-an-email"
2. User clicks subscribe button

**Expected Results:**
- [ ] Validation error appears
- [ ] Form is not submitted
- [ ] Email input shows error state

---

## Empty State Tests

### No Upcoming Courses

**Scenario:** No courses are scheduled for the future

**Setup:**
- `upcomingCourses` array is empty (`[]`)
- `pastCourses` may have data

**Expected Results:**
- [ ] "Próximos Cursos" section shows empty state message
- [ ] Message like "No hay cursos programados por el momento"
- [ ] CTA to "Ver cursos anteriores" or similar may appear
- [ ] Page doesn't show blank/broken UI

### No Past Courses

**Scenario:** No finished courses exist

**Setup:**
- `pastCourses` array is empty (`[]`)

**Expected Results:**
- [ ] "Cursos Finalizados" section is either hidden or shows minimal empty state
- [ ] No broken layout or missing elements

### No Courses At All

**Scenario:** Platform has no courses yet

**Setup:**
- Both `upcomingCourses` and `pastCourses` are empty

**Expected Results:**
- [ ] Hero still displays correctly
- [ ] Catalog area shows helpful empty state
- [ ] No broken UI or console errors

---

## Component Interaction Tests

### Header

**Renders correctly:**
- [ ] Logo is visible and links to home
- [ ] Navigation items visible: "Cursos", "Sobre WSET", "Contacto"
- [ ] "Iniciar Sesión" button visible
- [ ] "Registrarse" button visible

**User interactions:**
- [ ] Clicking logo calls `onNavigate` with "/"
- [ ] Clicking "Iniciar Sesión" calls `onLogin`
- [ ] Clicking "Registrarse" calls `onRegister`
- [ ] Mobile: hamburger menu opens navigation drawer

### Hero

**Renders correctly:**
- [ ] Video background loads (or fallback image)
- [ ] Headline text is visible
- [ ] Subheadline text is visible
- [ ] CTA button is visible
- [ ] Filter chips are visible

**User interactions:**
- [ ] Clicking CTA button calls `onHeroCTA`
- [ ] Clicking filter chip toggles its state
- [ ] Multiple chips can be selected

### CourseCard

**Renders correctly:**
- [ ] Course image displays
- [ ] Course title displays
- [ ] Date displays for presencial courses (e.g., "15 Mar 2025")
- [ ] Price displays (e.g., "USD 350")
- [ ] Educator name and image display
- [ ] Location displays ("Montevideo" or "Online")
- [ ] Type badge displays (WSET, Taller, etc.)

**User interactions:**
- [ ] Clicking card calls `onViewCourse` with course slug
- [ ] Hover state shows visual feedback

### Footer

**Renders correctly:**
- [ ] Logo and description visible
- [ ] Link columns visible (Cursos, Legal, Sobre)
- [ ] Social media icons visible
- [ ] Newsletter form visible
- [ ] Contact info visible

---

## Edge Cases

- [ ] Very long course titles truncate properly
- [ ] Courses without images show placeholder
- [ ] Courses with price 0 show "Gratis"
- [ ] Many courses (20+) render without performance issues
- [ ] Filters work with single course in results
- [ ] Mobile responsiveness: 1 column grid, hamburger nav

---

## Accessibility Checks

- [ ] All interactive elements are keyboard accessible
- [ ] Filter chips have proper ARIA labels
- [ ] Form fields have associated labels
- [ ] Color contrast meets WCAG standards
- [ ] Video has fallback for accessibility

---

## Sample Test Data

```typescript
// Populated state
const mockHeroContent = {
  headline: "Descubrí el mundo del vino",
  subheadline: "Formación especializada con certificación internacional WSET",
  ctaText: "Explorar cursos",
  videoUrl: "/videos/hero.mp4"
}

const mockUpcomingCourses = [
  {
    id: "course-001",
    slug: "wset-nivel-1-marzo-2025",
    title: "WSET Nivel 1 Cualificación en Vinos",
    type: "wset",
    modality: "presencial",
    startDate: "2025-03-15",
    priceUSD: 350,
    location: "Montevideo",
    educatorId: "edu-001",
    status: "enrolling"
  }
]

// Empty state
const mockEmptyUpcoming = []
const mockEmptyPast = []
```
