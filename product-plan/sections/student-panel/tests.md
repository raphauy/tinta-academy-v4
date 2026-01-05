# Test Instructions: Student Panel

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Student Panel is the private dashboard for enrolled students. Test course list display, progress tracking, resource downloads, order history, and profile management.

---

## User Flow Tests

### Flow 1: View Enrolled Courses

**Scenario:** Student views their enrolled courses

#### Success Path

**Setup:**
- Student is authenticated
- Student has at least one online course and one in-person course enrolled

**Steps:**
1. Student navigates to `/alumno`
2. Student sees list of enrolled courses
3. Student sees online course with progress bar
4. Student sees in-person course with date/location

**Expected Results:**
- [ ] Page title or heading indicates "Mis Cursos" or similar
- [ ] Online courses show progress bar with percentage (e.g., "33% completado")
- [ ] In-person courses show event date and location
- [ ] Courses show thumbnail, title, educator name
- [ ] "Continuar" button visible for in-progress online courses

### Flow 2: Continue Online Course

**Scenario:** Student continues learning an online course

**Steps:**
1. Student sees an in-progress online course (status: "in_progress")
2. Student clicks "Continuar" button

**Expected Results:**
- [ ] `onContinueCourse` callback is called with courseId and current lessonId
- [ ] Student would be navigated to lesson player (handled by implementation)

### Flow 3: Download Course Resources

**Scenario:** Student downloads study materials

**Steps:**
1. Student expands a course to see resources
2. Student sees available resources (PDFs, documents)
3. Student clicks download icon/button on a resource

**Expected Results:**
- [ ] Resources list shows: title, type (PDF icon), file size
- [ ] `onDownloadResource` callback is called with resourceId
- [ ] Download initiates (implementation handles file delivery)

### Flow 4: View Order History

**Scenario:** Student reviews past purchases

**Steps:**
1. Student navigates to "Órdenes" section (via sidebar)
2. Student sees list of orders
3. Student sees order details: number, course, date, amount, status

**Expected Results:**
- [ ] Orders displayed in table/list format
- [ ] Each order shows: order number (e.g., "TA-2024-0892")
- [ ] Course title is visible
- [ ] Amount with currency (e.g., "$450 USD")
- [ ] Payment method shown (MercadoPago, Transferencia, Gratuito)
- [ ] Status shown with badge (Paid, Pending, etc.)

### Flow 5: Update Profile

**Scenario:** Student updates their personal information

#### Success Path

**Setup:**
- Profile form is pre-filled with current data

**Steps:**
1. Student navigates to "Perfil" section
2. Student updates phone number to "+598 99 000 000"
3. Student clicks "Guardar cambios"

**Expected Results:**
- [ ] Form shows current values pre-filled
- [ ] Email field is read-only (shown but not editable)
- [ ] `onSaveProfile` callback is called with updated data
- [ ] Success message appears (e.g., "Perfil actualizado correctamente")

#### Failure Path: Validation Error

**Steps:**
1. Student clears required field (e.g., firstName)
2. Student clicks save

**Expected Results:**
- [ ] Validation error appears on required field
- [ ] Form is not submitted
- [ ] Error message indicates what's wrong

---

## Empty State Tests

### No Enrolled Courses

**Scenario:** Student has not enrolled in any courses

**Setup:**
- `enrolledCourses` array is empty (`[]`)

**Expected Results:**
- [ ] Empty state message appears: "No estás inscrito en ningún curso todavía"
- [ ] CTA button "Explorar cursos" or "Ver catálogo" is visible
- [ ] CTA links to course catalog

### No Orders

**Scenario:** Student has no purchase history

**Setup:**
- `orders` array is empty (`[]`)

**Expected Results:**
- [ ] Empty state message appears: "No tienes órdenes registradas"
- [ ] Optional CTA to browse courses

### Course With No Resources

**Scenario:** An enrolled course has no downloadable materials yet

**Setup:**
- Course exists but `resources` array is empty

**Expected Results:**
- [ ] Resources section shows "No hay materiales disponibles aún"
- [ ] No broken UI or missing elements

---

## Component Interaction Tests

### CourseList

**Renders correctly:**
- [ ] Shows all enrolled courses
- [ ] Courses sorted by status (in_progress first, then upcoming, then completed)
- [ ] Each course shows thumbnail, title, educator

### CourseCard

**Renders correctly:**
- [ ] Online course shows: progress bar, lesson count, "Continuar" button
- [ ] In-person course shows: date, location, status badge
- [ ] Completed courses show completion badge/checkmark
- [ ] Upcoming in-person shows countdown or date

**User interactions:**
- [ ] "Continuar" button calls `onContinueCourse`
- [ ] "Ver detalles" calls `onViewCourseDetails`
- [ ] Resource download icon calls `onDownloadResource`

### ProgressBar

**Renders correctly:**
- [ ] Shows percentage as number (e.g., "33%")
- [ ] Progress bar fills proportionally
- [ ] Different colors for different progress levels (optional)

### OrderHistory

**Renders correctly:**
- [ ] Table/list with columns: Order #, Course, Date, Amount, Status
- [ ] Status badges with appropriate colors (green for Paid, yellow for Pending)

### Profile

**Renders correctly:**
- [ ] Personal info section: name, email (read-only), phone, address
- [ ] Notification preferences with toggles/checkboxes
- [ ] Billing info section: billing name, tax ID, billing address
- [ ] Save button visible

---

## Edge Cases

- [ ] Course with 100% progress shows as "Completado"
- [ ] Very long course titles truncate properly
- [ ] Multiple resources render correctly
- [ ] Large file sizes display correctly (e.g., "15.2 MB")
- [ ] Orders with discount show original and discounted price
- [ ] Profile with missing optional fields handles gracefully

---

## Accessibility Checks

- [ ] Sidebar navigation is keyboard accessible
- [ ] Progress bar has ARIA attributes for screen readers
- [ ] Form fields have proper labels
- [ ] Focus management after form submission
- [ ] Status badges are not color-only (have text)

---

## Sample Test Data

```typescript
// Enrolled course - online, in progress
const mockOnlineCourse = {
  id: "enr-001",
  courseId: "course-001",
  courseType: "online",
  title: "WSET Nivel 2 en Vinos",
  thumbnail: "/courses/wset-2.jpg",
  educatorName: "Gabriela Zimmer",
  status: "in_progress",
  progress: {
    completedLessons: 8,
    totalLessons: 24,
    percentage: 33,
    currentLessonId: "lesson-009"
  },
  resources: [
    { id: "res-001", title: "Manual WSET Nivel 2", type: "pdf", size: 15200000 }
  ]
}

// Enrolled course - in person, completed
const mockInPersonCourse = {
  id: "enr-002",
  courseId: "course-002",
  courseType: "in_person",
  title: "WSET Nivel 1 en Vinos",
  status: "completed",
  eventInfo: {
    location: "Tinta Academy - Pocitos",
    dates: ["2024-06-15"],
    examResult: "passed"
  }
}

// Empty states
const mockEmptyCourses = []
const mockEmptyOrders = []
```
