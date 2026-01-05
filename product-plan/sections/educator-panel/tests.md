# Test Instructions: Educator Panel

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Educator Panel is the dashboard for instructors managing courses. Test dashboard metrics, course management, content editing, student tracking, and email communications.

---

## User Flow Tests

### Flow 1: View Dashboard

**Scenario:** Educator views their dashboard metrics

#### Success Path

**Setup:**
- Educator is authenticated with educator role
- Educator has courses with enrolled students

**Steps:**
1. Educator navigates to `/educador`
2. Educator sees dashboard with metric cards
3. Educator sees trend charts
4. Educator sees quick access to courses

**Expected Results:**
- [ ] Metric cards show: Total Alumnos, Alumnos Activos, Cursos Activos, Progreso Promedio
- [ ] Each metric shows current value and trend indicator
- [ ] Mini charts show 6-month trend
- [ ] Course quick cards show recent/popular courses

### Flow 2: Create a New Course

**Scenario:** Educator creates a new online course

**Steps:**
1. Educator clicks "Crear Curso" button
2. Educator selects course type "Online"
3. Educator fills: title, description, image
4. Educator adds modules and lessons
5. Educator sets pricing
6. Educator clicks "Publicar"

**Expected Results:**
- [ ] `onCreate` callback is called
- [ ] Course creation wizard/form opens
- [ ] All fields can be filled
- [ ] `onPublish` is called when publishing

### Flow 3: Manage Course Content

**Scenario:** Educator edits an existing course's modules and lessons

**Steps:**
1. Educator clicks "Editar" on a course
2. Educator navigates to "Contenido" tab
3. Educator drags a module to reorder
4. Educator clicks "Agregar Lección" in a module
5. Educator saves changes

**Expected Results:**
- [ ] Course editor opens with tabs: Info, Contenido, Precios, Configuración
- [ ] Modules display with drag handles
- [ ] `onReorderModules` called with new order array
- [ ] `onCreateLesson` called with moduleId
- [ ] `onSave` called on save

### Flow 4: View Student Progress

**Scenario:** Educator reviews enrolled students' progress

**Steps:**
1. Educator opens a course
2. Educator navigates to student list
3. Educator sees students with progress bars
4. Educator clicks on a student for details

**Expected Results:**
- [ ] Student list shows: name, email, enrollment date, progress %
- [ ] Progress bars show visual completion
- [ ] Search/filter functionality works
- [ ] `onViewStudent` called with studentId

### Flow 5: Send Email Campaign

**Scenario:** Educator sends email to course students

**Steps:**
1. Educator navigates to "Enviar Email" section
2. Educator selects target course
3. Educator selects email template
4. Educator previews with variable substitution
5. Educator clicks "Enviar ahora" or "Programar"

**Expected Results:**
- [ ] Course dropdown shows educator's courses
- [ ] Template dropdown shows available templates
- [ ] Preview shows variables replaced (e.g., {{nombre}} → "Carolina")
- [ ] `onSend` called with courseId, templateId, scheduledAt

---

## Empty State Tests

### No Courses

**Scenario:** New educator with no courses

**Setup:**
- `courses` array is empty (`[]`)

**Expected Results:**
- [ ] Empty state: "No has creado ningún curso todavía"
- [ ] CTA button "Crear mi primer curso" is visible
- [ ] Dashboard metrics show zeros

### No Modules in Course

**Scenario:** Course has no modules yet

**Setup:**
- Course exists but `modules` is empty

**Expected Results:**
- [ ] Content tab shows "Agrega tu primer módulo"
- [ ] "Agregar Módulo" button prominently displayed

### No Students Enrolled

**Scenario:** Course has no enrollments

**Setup:**
- Course exists but `students` is empty

**Expected Results:**
- [ ] Student list shows "Aún no hay alumnos inscritos en este curso"
- [ ] Optional message about promoting the course

### No Email Templates

**Scenario:** No email templates created

**Setup:**
- `templates` array is empty

**Expected Results:**
- [ ] Templates list shows "Crea tu primera plantilla de email"
- [ ] "Crear Template" CTA is visible

---

## Component Interaction Tests

### EducatorDashboard

**Renders correctly:**
- [ ] Educator name/title displayed
- [ ] 4+ metric cards visible
- [ ] Mini charts render
- [ ] Course quick cards visible

### MetricCard

**Renders correctly:**
- [ ] Metric title (e.g., "Total Alumnos")
- [ ] Current value (e.g., "127")
- [ ] Trend indicator (up/down arrow with percentage)

### CourseList

**Renders correctly:**
- [ ] Courses displayed as cards or rows
- [ ] Filter tabs for type (Online/Presencial) and status (Draft/Published/Finished)
- [ ] Each course shows: thumbnail, title, type badge, student count

**User interactions:**
- [ ] Clicking course calls `onView`
- [ ] Edit button calls `onEdit`
- [ ] Delete button calls `onDelete`
- [ ] Publish button calls `onPublish` (for drafts)

### CourseEditor

**Renders correctly:**
- [ ] Tabs: Info Básica, Contenido, Precios, Configuración
- [ ] Form fields pre-filled for existing course
- [ ] Modules with lessons in Contenido tab
- [ ] Drag handles on modules/lessons

**User interactions:**
- [ ] Tab switching works
- [ ] Form changes tracked
- [ ] `onSave` called with partial Course data
- [ ] `onCreateModule` creates new module

### StudentList

**Renders correctly:**
- [ ] Table with columns: Nombre, Email, Inscrito, Último acceso, Progreso
- [ ] Progress shown as bar + percentage
- [ ] Search input for filtering
- [ ] Export button

**User interactions:**
- [ ] Clicking row/name calls `onViewStudent`
- [ ] Email icon calls `onEmailStudent`
- [ ] Export button calls `onExport`

### SendEmail

**Renders correctly:**
- [ ] Course selector dropdown
- [ ] Template selector dropdown
- [ ] Preview area showing formatted email
- [ ] Recipient count display
- [ ] Send/Schedule buttons

---

## Edge Cases

- [ ] Course with 0 students shows appropriate metrics
- [ ] Very long module/lesson titles truncate
- [ ] Many modules (10+) render with scroll
- [ ] Drag & drop works on mobile (or shows alternative)
- [ ] Template with many variables previews correctly
- [ ] Scheduling for past date shows error

---

## Accessibility Checks

- [ ] Tab navigation in editor is keyboard accessible
- [ ] Drag & drop has keyboard alternative
- [ ] Form fields have proper labels
- [ ] Progress bars have ARIA attributes
- [ ] Modal dialogs trap focus

---

## Sample Test Data

```typescript
const mockEducator = {
  id: "edu-001",
  name: "Gabriela Zimmer",
  title: "Sommelier WSET Diploma",
  email: "gabriela@tinta.wine"
}

const mockMetrics = {
  totalStudents: 127,
  activeStudents: 89,
  totalCourses: 4,
  activeCourses: 3,
  averageProgress: 67,
  completionRate: 42
}

const mockCourses = [
  {
    id: "course-001",
    title: "WSET Nivel 2 en Vinos",
    type: "wset",
    modality: "online",
    status: "published",
    totalStudents: 45,
    averageProgress: 58
  }
]

// Empty states
const mockEmptyCourses = []
const mockEmptyStudents = []
const mockEmptyTemplates = []
```
