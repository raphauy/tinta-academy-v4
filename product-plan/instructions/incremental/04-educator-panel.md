# Milestone 4: Educator Panel

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

Implement the Educator Panel — the private dashboard where educators manage their courses, view student progress, and send email communications.

## Overview

This is the authenticated area for educators (instructors) who create and manage courses. They can see dashboard metrics, manage their course catalog, edit course content with modules/lessons/videos, view enrolled students with progress, and send targeted email campaigns.

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

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/educator-panel/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/educator-panel/components/`:

- `EducatorDashboard.tsx` — Dashboard with metrics and charts
- `MetricCard.tsx` — Individual metric display
- `MiniChart.tsx` — Small trend chart
- `CourseList.tsx` — Educator's course list
- `CourseListItem.tsx` — Individual course row
- `CourseQuickCard.tsx` — Course summary card
- `CourseEditor.tsx` — Full course editing interface
- `ModuleCard.tsx` — Module in editor with lessons
- `StudentList.tsx` — Students enrolled in a course
- `StudentRow.tsx` — Individual student with progress
- `EmailTemplateList.tsx` — Email template management
- `EmailTemplateCard.tsx` — Individual template
- `EmailCampaignList.tsx` — Campaign history
- `EmailCampaignCard.tsx` — Individual campaign
- `SendEmail.tsx` — Email composition form

### Data Layer

The components expect these data shapes:

```typescript
interface EducatorDashboardProps {
  educator: Educator
  metrics: DashboardMetrics
  courses: Course[]
  onViewCourse?: (id: string) => void
  onCreateCourse?: () => void
}

interface CourseListProps {
  courses: Course[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onPublish?: (id: string) => void
  onDuplicate?: (id: string) => void
  onCreate?: () => void
}

interface CourseEditorProps {
  course: Course | null
  modules: Module[]
  lessons: Lesson[]
  onSave?: (course: Partial<Course>) => void
  onPublish?: () => void
  onCreateModule?: () => void
  onReorderModules?: (moduleIds: string[]) => void
  onCreateLesson?: (moduleId: string) => void
  onReorderLessons?: (moduleId: string, lessonIds: string[]) => void
  // ... more callbacks
}

interface StudentListProps {
  course: Course
  students: EnrolledStudent[]
  onViewStudent?: (id: string) => void
  onEmailStudent?: (id: string) => void
  onExport?: () => void
}

interface SendEmailProps {
  courses: Course[]
  templates: EmailTemplate[]
  onSend?: (courseId: string, templateId: string, scheduledAt: string | null) => void
  onCancel?: () => void
}
```

You'll need to:
- Create API endpoints for educator dashboard metrics
- CRUD endpoints for courses, modules, lessons
- Integration with Bunny.net for video uploads
- Endpoints for student list per course
- CRUD endpoints for email templates
- Email sending/scheduling endpoints
- Campaign tracking endpoints

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onCreateCourse` | Navigate to course creation wizard |
| `onEditCourse` | Navigate to course editor |
| `onPublish` | Publish a draft course |
| `onDuplicate` | Create a copy of a course |
| `onSave` | Save course changes |
| `onReorderModules` | Update module order (drag & drop) |
| `onReorderLessons` | Update lesson order within module |
| `onViewStudent` | View student detail modal |
| `onEmailStudent` | Open email composer for one student |
| `onExport` | Export student list to CSV |
| `onSend` | Send or schedule email campaign |

### Empty States

Implement empty state UI for when no records exist:

- **No courses:** Show "No has creado ningún curso todavía" with CTA to create first course
- **No modules in course:** Show "Agrega tu primer módulo" with add button
- **No lessons in module:** Show "Agrega lecciones a este módulo"
- **No students enrolled:** Show "Aún no hay alumnos inscritos en este curso"
- **No email templates:** Show "Crea tu primera plantilla de email"
- **No campaigns:** Show "No has enviado comunicaciones aún"

## Files to Reference

- `product-plan/sections/educator-panel/README.md` — Feature overview and design intent
- `product-plan/sections/educator-panel/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/educator-panel/components/` — React components
- `product-plan/sections/educator-panel/types.ts` — TypeScript interfaces
- `product-plan/sections/educator-panel/sample-data.json` — Test data
- `product-plan/sections/educator-panel/*.png` — Visual references

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: View Dashboard

1. Educator logs in and navigates to `/educador`
2. Educator sees metrics: total students, active courses, completion rate
3. Educator sees trend charts for student growth
4. Educator sees quick access cards for their courses
5. **Outcome:** Educator has overview of their teaching activity

### Flow 2: Create a New Course

1. Educator clicks "Crear Curso" button
2. Educator selects course type (online/presencial)
3. Educator fills in basic info (title, description, image)
4. Educator adds modules with lessons (for online)
5. Educator sets pricing and publishes
6. **Outcome:** New course is live and available for enrollment

### Flow 3: Manage Course Content

1. Educator opens course editor
2. Educator reorders modules via drag & drop
3. Educator adds a new lesson to a module
4. Educator uploads video for the lesson
5. Educator adds downloadable resources
6. **Outcome:** Course content is updated

### Flow 4: View Student Progress

1. Educator navigates to course's student list
2. Educator sees all enrolled students with progress bars
3. Educator can search/filter students
4. Educator clicks on a student to see detail
5. **Outcome:** Educator monitors student engagement

### Flow 5: Send Email Campaign

1. Educator navigates to "Enviar Email"
2. Educator selects target course
3. Educator chooses or creates a template
4. Educator previews with variable substitution
5. Educator sends immediately or schedules
6. **Outcome:** Email is sent/scheduled, appears in campaign history

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Dashboard displays with metrics and charts
- [ ] Course list displays with filter by type/status
- [ ] Course editor works with all tabs
- [ ] Drag & drop reordering works for modules/lessons
- [ ] Video upload integration works
- [ ] Student list shows progress per student
- [ ] Email templates CRUD works
- [ ] Email sending/scheduling works
- [ ] Campaign history displays with stats
- [ ] Empty states display properly
- [ ] Responsive on mobile
- [ ] Uses AppShell with educator sidebar variant
