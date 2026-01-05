# Milestone 3: Student Panel

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

Implement the Student Panel — the private dashboard where enrolled students can view their courses, track progress, manage orders, and update their profile.

## Overview

This is the authenticated area for students who have enrolled in courses (free or paid). They can see all their enrolled courses (online and in-person), access course content, download materials, view order history, and manage their personal data.

**Key Functionality:**
- View list of enrolled courses with progress/status indicators
- Continue online courses (navigate to last lesson)
- View in-person course details and materials
- Download resources from any course
- View order history with payment details
- Edit profile (personal info, notifications, billing)
- Uses AppShell with student variant sidebar

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/student-panel/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/student-panel/components/`:

- `CourseList.tsx` — List of enrolled courses with status
- `CourseCard.tsx` — Individual enrolled course card
- `ProgressBar.tsx` — Visual progress indicator
- `OrderHistory.tsx` — List of orders
- `OrderRow.tsx` — Individual order row
- `Profile.tsx` — Profile editing form

### Data Layer

The components expect these data shapes:

```typescript
interface CourseListProps {
  courses: EnrolledCourse[]
  onContinueCourse?: (courseId: string, lessonId?: string) => void
  onViewCourseDetails?: (courseId: string) => void
  onDownloadResource?: (resourceId: string) => void
}

interface OrderHistoryProps {
  orders: Order[]
  onViewOrder?: (orderId: string) => void
}

interface ProfileProps {
  student: Student
  onSaveProfile?: (updates: Partial<Student>) => void
  onUpdateNotifications?: (preferences: NotificationPreferences) => void
}
```

You'll need to:
- Create API endpoints to fetch enrolled courses with progress
- Fetch order history for the current student
- Implement profile update endpoints
- Handle resource downloads (presigned URLs or direct links)

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onContinueCourse` | Navigate to lesson player (`/alumno/cursos/:id/lecciones/:lessonId`) |
| `onViewCourseDetails` | Navigate to course detail (`/alumno/cursos/:id`) |
| `onDownloadResource` | Trigger file download |
| `onViewOrder` | Show order details modal or navigate |
| `onSaveProfile` | Save profile changes to backend |
| `onUpdateNotifications` | Save notification preferences |

### Empty States

Implement empty state UI for when no records exist:

- **No enrolled courses:** Show "No estás inscrito en ningún curso todavía" with CTA to browse catalog
- **No orders:** Show "No tienes órdenes registradas" with CTA to browse courses
- **First-time student:** Guide them to their first course enrollment

## Files to Reference

- `product-plan/sections/student-panel/README.md` — Feature overview and design intent
- `product-plan/sections/student-panel/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/student-panel/components/` — React components
- `product-plan/sections/student-panel/types.ts` — TypeScript interfaces
- `product-plan/sections/student-panel/sample-data.json` — Test data
- `product-plan/sections/student-panel/course-list.png` — Course list visual
- `product-plan/sections/student-panel/order-history.png` — Order history visual
- `product-plan/sections/student-panel/profile.png` — Profile visual

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: View Enrolled Courses

1. Student navigates to `/alumno`
2. Student sees list of all enrolled courses
3. Student can differentiate online vs in-person courses
4. Student sees progress for online courses
5. **Outcome:** Student has clear view of their learning journey

### Flow 2: Continue Online Course

1. Student sees an in-progress online course
2. Student clicks "Continuar" button
3. **Outcome:** Student is navigated to their last lesson in the video player

### Flow 3: Download Course Resources

1. Student views an enrolled course
2. Student sees available resources (PDFs, documents)
3. Student clicks download on a resource
4. **Outcome:** File downloads to their device

### Flow 4: View Order History

1. Student navigates to "Órdenes" in sidebar
2. Student sees all past orders with status
3. Student can see course, amount, date, payment method
4. **Outcome:** Student has record of all purchases

### Flow 5: Update Profile

1. Student navigates to "Perfil" in sidebar
2. Student updates personal information
3. Student clicks "Guardar cambios"
4. **Outcome:** Profile is updated, success message shown

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Course list displays with progress indicators
- [ ] Continue course navigates to correct lesson
- [ ] In-person courses show event details
- [ ] Resources can be downloaded
- [ ] Order history displays with all details
- [ ] Profile editing works with validation
- [ ] Notification preferences can be updated
- [ ] Empty states display properly when no data
- [ ] Responsive on mobile
- [ ] Uses AppShell with student sidebar variant
