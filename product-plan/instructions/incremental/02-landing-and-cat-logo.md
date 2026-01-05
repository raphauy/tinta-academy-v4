# Milestone 2: Landing & Catálogo

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/landing-and-cat-logo/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

The test instructions are framework-agnostic — adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, etc.).

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/landing-and-cat-logo/components/`:

- `LandingCatalogo.tsx` — Main page component orchestrating all sections
- `Header.tsx` — Public header with navigation and auth buttons
- `Hero.tsx` — Cinematic hero with video background and filters
- `CourseCatalog.tsx` — Course grid with sections and filters
- `CourseCard.tsx` — Individual course card
- `Footer.tsx` — Footer with links and newsletter

### Data Layer

The components expect these data shapes:

```typescript
interface LandingCatalogoProps {
  heroContent: HeroContent
  educators: Educator[]
  tags: Tag[]
  upcomingCourses: Course[]
  pastCourses: Course[]
  footerLinks: FooterLinks
  contactInfo: ContactInfo
  onViewCourse?: (courseSlug: string) => void
  onFilter?: (filters: CourseFilters) => void
  onHeroCTA?: () => void
  onSubscribe?: (email: string) => void
  onNavigate?: (href: string) => void
  onLogin?: () => void
  onRegister?: () => void
}
```

You'll need to:
- Create API endpoints to fetch courses, educators, and tags
- Implement filtering logic (server-side or client-side)
- Connect real data to the components

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onViewCourse` | Navigate to course detail page (`/cursos/:slug`) |
| `onFilter` | Apply filters and update displayed courses |
| `onHeroCTA` | Scroll to catalog section or navigate |
| `onSubscribe` | Submit email to newsletter (show success/error feedback) |
| `onNavigate` | Navigate to internal/external links |
| `onLogin` | Navigate to Clerk login |
| `onRegister` | Navigate to Clerk signup |

### Empty States

Implement empty state UI for when no records exist:

- **No upcoming courses:** Show helpful message like "No hay cursos programados por el momento. ¡Vuelve pronto!" with option to see past courses
- **No courses match filter:** Show "No se encontraron cursos con esos filtros" with option to clear filters
- **No past courses:** Can be hidden entirely if empty

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/landing-and-cat-logo/README.md` — Feature overview and design intent
- `product-plan/sections/landing-and-cat-logo/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/landing-and-cat-logo/components/` — React components
- `product-plan/sections/landing-and-cat-logo/types.ts` — TypeScript interfaces
- `product-plan/sections/landing-and-cat-logo/sample-data.json` — Test data
- `product-plan/sections/landing-and-cat-logo/landing-catalogo.png` — Visual reference

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Browse Course Catalog

1. User arrives at landing page
2. User sees hero with video background and value proposition
3. User scrolls down to see "Próximos Cursos" section
4. User continues scrolling to see "Cursos Finalizados" section
5. **Outcome:** User has overview of all available courses

### Flow 2: Filter Courses

1. User clicks a quick filter chip in hero (e.g., "Online")
2. Catalog section filters to show only matching courses
3. User can add more filters (e.g., "WSET") to narrow results
4. User clicks "Limpiar filtros" to reset
5. **Outcome:** User finds courses matching their interests

### Flow 3: View Course Details

1. User finds an interesting course in the catalog
2. User clicks on the course card
3. **Outcome:** User is navigated to `/cursos/:slug` detail page

### Flow 4: Subscribe to Newsletter

1. User scrolls to footer
2. User enters email in newsletter input
3. User clicks subscribe button
4. **Outcome:** Success message appears, email is saved

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Hero displays with video background and content
- [ ] Quick filter chips work and filter the catalog
- [ ] Upcoming courses display in responsive grid
- [ ] Past courses display in separate section
- [ ] Course cards show all info (image, title, date, price, educator, etc.)
- [ ] Clicking course navigates to detail page
- [ ] Footer displays with all links and newsletter form
- [ ] Newsletter subscription works with feedback
- [ ] Empty states display properly when no courses
- [ ] Responsive on mobile (1 column grid, hamburger nav)
