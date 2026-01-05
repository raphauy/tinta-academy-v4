# Test Instructions: Admin Panel

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, etc.).

## Overview

The Admin Panel is the comprehensive administrative dashboard. Test platform analytics, user management, order processing, and coupon management.

---

## User Flow Tests

### Flow 1: View Platform Analytics

**Scenario:** Admin views dashboard with platform-wide metrics

#### Success Path

**Setup:**
- Admin is authenticated with admin role
- Platform has users, courses, and orders

**Steps:**
1. Admin navigates to `/admin`
2. Admin sees dashboard with totals
3. Admin sees trend charts
4. Admin sees recent activity feed
5. Admin sees top courses

**Expected Results:**
- [ ] Metric cards show: Usuarios, Estudiantes, Cursos, Ingresos
- [ ] Revenue shows current month vs last month
- [ ] Trend charts show 6-month data
- [ ] Activity feed shows recent events with timestamps
- [ ] Top courses show by enrollments and revenue

### Flow 2: View Course Observers

**Scenario:** Admin views users interested in a course

**Steps:**
1. Admin navigates to Cursos section
2. Admin sees courses with observer counts
3. Admin clicks observer count badge (e.g., "15 interesados")
4. Modal opens with email list

**Expected Results:**
- [ ] Courses show badge with observer count
- [ ] `onViewObservers` called with courseId
- [ ] Modal shows list of emails
- [ ] Copy all emails button works

### Flow 3: Process Pending Transfer

**Scenario:** Admin marks a bank transfer as paid

**Steps:**
1. Admin navigates to Órdenes section
2. Admin filters by status "PaymentSent"
3. Admin sees pending orders with transfer comments
4. Admin clicks "Marcar como pagado" on an order

**Expected Results:**
- [ ] Filter dropdown works for status
- [ ] Orders show: order number, student, course, amount, status
- [ ] Transfer comment visible for pending transfers
- [ ] `onMarkAsPaid` called with orderId
- [ ] Order status updates to "Paid"

### Flow 4: Manage Coupons

**Scenario:** Admin creates a new coupon

**Steps:**
1. Admin navigates to Cupones section
2. Admin clicks "Crear cupón"
3. Admin fills: code, discount %, max uses, expiry
4. Admin optionally restricts to email or course
5. Admin saves coupon

**Expected Results:**
- [ ] Coupon list shows existing coupons with usage stats
- [ ] `onCreate` called
- [ ] Create modal/form opens
- [ ] All restriction options available
- [ ] Coupon appears in list after creation

### Flow 5: Edit User Role

**Scenario:** Admin changes a user's role

**Steps:**
1. Admin navigates to Usuarios section
2. Admin finds user via search
3. Admin clicks "Editar rol" on user row
4. Admin changes role from "user" to "educator"
5. Admin confirms change

**Expected Results:**
- [ ] Search filters users in real-time
- [ ] User roles displayed with badges
- [ ] `onEditRole` called with userId
- [ ] Role selector shows available roles
- [ ] User role updates after confirmation

### Flow 6: Configure Bank Data

**Scenario:** Admin adds bank account for transfers

**Steps:**
1. Admin navigates to Datos Bancarios section
2. Admin clicks "Agregar cuenta"
3. Admin fills: bank name, account holder, account number, currency
4. Admin saves

**Expected Results:**
- [ ] Existing bank accounts displayed as cards
- [ ] `onCreate` called
- [ ] Form has all required fields
- [ ] Currency selector (USD/UYU)
- [ ] New account appears after saving

---

## Empty State Tests

### No Courses

**Scenario:** Platform has no courses

**Setup:**
- `courses` array is empty

**Expected Results:**
- [ ] Empty state: "No hay cursos creados todavía"
- [ ] Dashboard metrics show zeros for course-related data

### No Students

**Scenario:** No students registered

**Setup:**
- `students` array is empty

**Expected Results:**
- [ ] Student section shows "No hay alumnos registrados"
- [ ] Stats cards show zeros

### No Orders

**Scenario:** No orders exist

**Setup:**
- `orders` array is empty

**Expected Results:**
- [ ] Order section shows "No hay órdenes registradas"
- [ ] Revenue metrics show $0

### No Coupons

**Scenario:** No coupons created

**Setup:**
- `coupons` array is empty

**Expected Results:**
- [ ] Coupon section shows "No hay cupones"
- [ ] CTA "Crear primer cupón" visible

### No Bank Accounts

**Scenario:** No bank data configured

**Setup:**
- `bankData` array is empty

**Expected Results:**
- [ ] Bank section shows "Configura datos bancarios para recibir transferencias"
- [ ] CTA to add bank account

---

## Component Interaction Tests

### AdminDashboard

**Renders correctly:**
- [ ] 4 main metric cards (users, students, courses, revenue)
- [ ] Revenue shows month comparison
- [ ] Trend charts render with data
- [ ] Activity feed shows recent items
- [ ] Top courses section visible

### ActivityFeed

**Renders correctly:**
- [ ] List of recent activities
- [ ] Each item shows: type icon, description, timestamp
- [ ] Activity types: enrollment, payment, course_completed, new_user, transfer_pending

### AdminCourses

**Renders correctly:**
- [ ] Course cards with: image, title, type badge (presencial/online)
- [ ] Observer count badge
- [ ] Enrollment count
- [ ] Revenue total

**User interactions:**
- [ ] Clicking card calls `onViewDetails`
- [ ] Clicking observer badge calls `onViewObservers`

### AdminStudents / AdminEducators / AdminUsers

**Renders correctly:**
- [ ] Stats cards at top (totals, active, etc.)
- [ ] Search input
- [ ] Table with relevant columns
- [ ] Action buttons per row

**User interactions:**
- [ ] Search filters list
- [ ] View button calls `onView`
- [ ] Edit button calls `onEdit`
- [ ] Delete button calls `onDelete` (with confirmation)

### AdminOrders

**Renders correctly:**
- [ ] Filter dropdown by status
- [ ] Table columns: Order #, Student, Course, Amount, Status, Method, Date
- [ ] Status badges with colors
- [ ] "Marcar pagado" button for pending transfers

**User interactions:**
- [ ] Filter changes visible orders
- [ ] `onMarkAsPaid` for transfer orders
- [ ] `onViewDetails` for order details

### AdminCoupons

**Renders correctly:**
- [ ] Coupon rows with: code, discount %, uses (current/max), status, expiry
- [ ] Active/inactive badge
- [ ] Restriction info (if any)

**User interactions:**
- [ ] `onCreate` for new coupon
- [ ] `onEdit` for editing
- [ ] `onDelete` for deleting
- [ ] `onViewStats` for usage details

---

## Edge Cases

- [ ] Very high numbers format correctly (e.g., "$10,500 USD")
- [ ] Expired coupons show appropriate status
- [ ] Fully used coupons (currentUses >= maxUses) show depleted
- [ ] Long email addresses truncate in observer modal
- [ ] Many activity items scroll properly
- [ ] Pagination works for large data sets

---

## Accessibility Checks

- [ ] Sidebar navigation keyboard accessible
- [ ] Tables are proper HTML tables with headers
- [ ] Modal dialogs trap focus
- [ ] Confirmation dialogs have proper labels
- [ ] Charts have text alternatives

---

## Sample Test Data

```typescript
const mockDashboardMetrics = {
  totals: {
    users: 342,
    students: 127,
    educators: 2,
    courses: 9,
    revenue: { thisMonth: 4850, lastMonth: 3920, currency: "USD" }
  },
  recentActivity: [
    { id: "act-001", type: "enrollment", description: "Carolina se inscribió en WSET 2", timestamp: "2024-12-30T14:23:00Z" }
  ],
  topCourses: [
    { id: "course-001", title: "WSET Nivel 1", enrollments: 45, revenue: 15750 }
  ]
}

const mockOrders = [
  {
    id: "ord-003",
    orderNumber: "TA-2024-1199",
    studentName: "Diego Martínez",
    courseTitle: "WSET Nivel 1",
    amount: 350,
    currency: "USD",
    status: "PaymentSent",
    paymentMethod: "Transferencia",
    transferComment: "Transferencia realizada el 28/12"
  }
]

const mockCoupons = [
  {
    id: "coup-001",
    code: "NAVIDAD20",
    discountPercent: 20,
    maxUses: 50,
    currentUses: 12,
    isActive: true,
    expiresAt: "2025-01-06"
  }
]

// Empty states
const mockEmptyCourses = []
const mockEmptyOrders = []
const mockEmptyCoupons = []
const mockEmptyBankData = []
```
