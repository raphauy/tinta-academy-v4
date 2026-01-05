# Milestone 5: Admin

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

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/admin/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/admin/components/`:

- `AdminDashboard.tsx` — Main dashboard with metrics and charts
- `AdminMetricCard.tsx` — Metric display card
- `AdminMiniChart.tsx` — Small trend chart
- `ActivityFeed.tsx` — Recent activity list
- `TopCoursesCard.tsx` — Best performing courses
- `AdminCourses.tsx` — Course list with analytics
- `AdminCourseCard.tsx` — Course card with metrics
- `CourseObserversModal.tsx` — Modal showing interested users
- `AdminStudents.tsx` — Student management table
- `StudentRow.tsx` — Student table row
- `AdminEducators.tsx` — Educator management
- `EducatorCard.tsx` — Educator card
- `AdminUsers.tsx` — User management table
- `UserRow.tsx` — User table row
- `AdminBankData.tsx` — Bank account management
- `BankAccountCard.tsx` — Bank account card
- `AdminOrders.tsx` — Order management table
- `OrderRow.tsx` — Order table row
- `AdminCoupons.tsx` — Coupon management
- `CouponRow.tsx` — Coupon table row

### Data Layer

The components expect these data shapes:

```typescript
interface AdminDashboardProps {
  metrics: DashboardMetrics
}

interface AdminCoursesProps {
  courses: AdminCourse[]
  onViewDetails?: (id: string) => void
  onViewObservers?: (id: string) => void
}

interface AdminStudentsProps {
  students: Student[]
  stats: StudentStats
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

interface AdminEducatorsProps {
  educators: Educator[]
  stats: EducatorStats
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}

interface AdminUsersProps {
  users: User[]
  stats: UserStats
  onEditRole?: (id: string) => void
  onDelete?: (id: string) => void
}

interface AdminBankDataProps {
  bankData: BankData[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}

interface AdminOrdersProps {
  orders: Order[]
  onViewDetails?: (id: string) => void
  onMarkAsPaid?: (id: string) => void
}

interface AdminCouponsProps {
  coupons: Coupon[]
  onViewStats?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}
```

You'll need to:
- Create API endpoints for admin dashboard metrics
- Endpoints for all entity listings with filtering/search
- User role management endpoints
- Order processing endpoints (mark as paid)
- CRUD endpoints for bank data and coupons
- Course observer list endpoints

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onViewDetails` | Navigate to detail view or open modal |
| `onViewObservers` | Open modal with interested users' emails |
| `onEdit` | Open edit modal or navigate to edit page |
| `onDelete` | Delete with confirmation dialog |
| `onCreate` | Open create modal or navigate to create page |
| `onEditRole` | Change user role (admin, educator, student) |
| `onMarkAsPaid` | Process pending transfer as paid |
| `onViewStats` | Show coupon usage statistics |

### Empty States

Implement empty state UI for when no records exist:

- **No courses:** Show "No hay cursos creados todavía"
- **No students:** Show "No hay alumnos registrados"
- **No educators:** Show "No hay educadores" with create CTA
- **No orders:** Show "No hay órdenes registradas"
- **No coupons:** Show "No hay cupones" with create CTA
- **No bank accounts:** Show "Configura datos bancarios para recibir transferencias"
- **Empty filtered results:** Show "No se encontraron resultados" with clear filters

## Files to Reference

- `product-plan/sections/admin/README.md` — Feature overview and design intent
- `product-plan/sections/admin/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/admin/components/` — React components
- `product-plan/sections/admin/types.ts` — TypeScript interfaces
- `product-plan/sections/admin/sample-data.json` — Test data
- `product-plan/sections/admin/*.png` — Visual references

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: View Platform Analytics

1. Admin navigates to `/admin`
2. Admin sees total users, students, revenue, enrollments
3. Admin sees trend charts (revenue, enrollments, user growth)
4. Admin sees recent activity feed
5. Admin sees top performing courses
6. **Outcome:** Admin has complete platform overview

### Flow 2: View Course Observers

1. Admin navigates to Cursos section
2. Admin sees all courses with observer counts
3. Admin clicks observer count on a course
4. Modal opens showing email addresses of interested users
5. Admin can copy emails for marketing
6. **Outcome:** Admin can follow up with interested users

### Flow 3: Process Pending Transfer

1. Admin navigates to Órdenes section
2. Admin filters by status "PaymentSent"
3. Admin sees pending transfers with comments
4. Admin verifies payment and clicks "Marcar como pagado"
5. **Outcome:** Order status updates to "Paid", student gets enrolled

### Flow 4: Manage Coupons

1. Admin navigates to Cupones section
2. Admin clicks "Crear cupón"
3. Admin fills in: code, discount %, max uses, expiry, restrictions
4. Admin saves the coupon
5. **Outcome:** New coupon is active and usable

### Flow 5: Edit User Role

1. Admin navigates to Usuarios section
2. Admin finds a user and clicks edit role
3. Admin changes role (e.g., user → educator)
4. **Outcome:** User now has educator permissions

### Flow 6: Configure Bank Data

1. Admin navigates to Datos Bancarios section
2. Admin clicks "Agregar cuenta"
3. Admin enters bank name, account details, currency
4. **Outcome:** New bank account appears for transfer payments

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Dashboard displays all metrics, charts, and activity
- [ ] Course list shows with observer counts
- [ ] Observer modal displays emails
- [ ] Student management works with search/filter
- [ ] Educator CRUD works (superadmin only for delete)
- [ ] User role editing works
- [ ] Bank data CRUD works
- [ ] Order list displays with filtering
- [ ] Mark as paid functionality works
- [ ] Coupon CRUD works with restrictions
- [ ] Empty states display properly
- [ ] Tables have search, filter, pagination
- [ ] Responsive on mobile
- [ ] Uses AppShell with admin sidebar variant
