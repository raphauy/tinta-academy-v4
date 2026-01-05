// =============================================================================
// Data Types
// =============================================================================

// Dashboard
export interface ChartDataPoint {
  month: string
  value: number
}

export interface DashboardTotals {
  users: number
  students: number
  educators: number
  courses: number
  coursesOnline: number
  coursesPresencial: number
  revenue: {
    thisMonth: number
    lastMonth: number
    currency: string
  }
  enrollments: {
    thisMonth: number
    lastMonth: number
  }
}

export interface RecentActivity {
  id: string
  type: 'enrollment' | 'payment' | 'course_completed' | 'new_user' | 'transfer_pending' | 'coupon_used'
  description: string
  timestamp: string
}

export interface TopCourse {
  id: string
  title: string
  enrollments: number
  revenue: number
}

export interface DashboardMetrics {
  totals: DashboardTotals
  charts: {
    revenue: ChartDataPoint[]
    enrollments: ChartDataPoint[]
    userGrowth: ChartDataPoint[]
  }
  recentActivity: RecentActivity[]
  topCourses: TopCourse[]
}

// Courses (Admin view)
export interface AdminCourse {
  id: string
  title: string
  slug: string
  modality: 'presencial' | 'online'
  type: 'wset' | 'taller' | 'cata' | 'curso'
  status: 'enrolling' | 'available' | 'finished' | 'draft'
  educatorId: string
  educatorName: string
  priceUSD: number
  startDate?: string
  maxCapacity?: number
  enrolledCount: number
  observersCount: number
  totalRevenue: number
  completionRate?: number
  averageProgress?: number
  imageUrl: string
}

// Course Observers (Interesados)
export interface CourseObserver {
  id: string
  courseId: string
  userId: string
  email: string
  createdAt: string
}

// Course Enrollments (Inscritos)
export interface CourseEnrollment {
  id: string
  courseId: string
  studentId: string
  studentName: string
  email: string
  enrolledAt: string
  status: 'active' | 'completed' | 'dropped'
  progress?: number
}

// Students
export interface Student {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  birthDate: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  avatarUrl: string | null
  enrollmentsCount: number
  completedCourses: number
  totalSpent: number
  createdAt: string
  lastActivityAt: string
}

export interface StudentStats {
  total: number
  newThisMonth: number
  activeThisMonth: number
  withCompletedCourses: number
}

// Educators
export interface Educator {
  id: string
  userId: string
  name: string
  email: string
  title: string
  bio: string
  imageUrl: string
  coursesCount: number
  studentsCount: number
  rating: number
  createdAt: string
}

export interface EducatorStats {
  total: number
  totalCourses: number
  totalStudents: number
  averageRating: number
}

// Users
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'educator' | 'student' | 'user'
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string
}

export interface UserStats {
  total: number
  admins: number
  educators: number
  students: number
  regularUsers: number
  newThisMonth: number
  activeThisMonth: number
}

// Bank Data
export interface BankData {
  id: string
  bankName: string
  accountHolder: string
  accountType: string
  accountNumber: string
  currency: 'USD' | 'UYU'
  isActive: boolean
  notes: string
}

// Orders
export type OrderStatus = 'Created' | 'Pending' | 'PaymentSent' | 'Paid' | 'Rejected' | 'Refunded' | 'Cancelled'
export type PaymentMethod = 'MercadoPago' | 'Transferencia' | 'Gratuito'

export interface Order {
  id: string
  orderNumber: string
  studentId: string
  studentName: string
  studentEmail: string
  courseId: string
  courseTitle: string
  amount: number
  currency: 'USD' | 'UYU'
  status: OrderStatus
  paymentMethod: PaymentMethod
  couponId: string | null
  couponCode: string | null
  discount: number
  createdAt: string
  paidAt: string | null
  transferComment: string | null
}

// Coupons
export interface Coupon {
  id: string
  code: string
  discountPercent: number
  maxUses: number
  currentUses: number
  restrictedEmail: string | null
  restrictedCourseId: string | null
  restrictedCourseName: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface AdminDashboardProps {
  /** Dashboard metrics including totals, charts, and activity */
  metrics: DashboardMetrics
}

export interface AdminCoursesProps {
  /** List of courses with admin metrics */
  courses: AdminCourse[]
  /** Called when user wants to view course details/analytics */
  onViewDetails?: (id: string) => void
  /** Called when user wants to see observers (interesados) for a course */
  onViewObservers?: (id: string) => void
}

export interface CourseObserversModalProps {
  /** Course ID to show observers for */
  courseId: string
  /** Course title for display */
  courseTitle: string
  /** List of observers (interested users) */
  observers: CourseObserver[]
  /** Called when modal is closed */
  onClose?: () => void
}

export interface AdminStudentsProps {
  /** List of students */
  students: Student[]
  /** Statistics for the stats cards */
  stats: StudentStats
  /** Called when user wants to view student details */
  onView?: (id: string) => void
  /** Called when user wants to edit student data */
  onEdit?: (id: string) => void
}

export interface AdminEducatorsProps {
  /** List of educators */
  educators: Educator[]
  /** Statistics for the stats cards */
  stats: EducatorStats
  /** Called when user wants to view educator details */
  onView?: (id: string) => void
  /** Called when user wants to edit an educator */
  onEdit?: (id: string) => void
  /** Called when user wants to delete an educator */
  onDelete?: (id: string) => void
  /** Called when user wants to create a new educator */
  onCreate?: () => void
}

export interface AdminUsersProps {
  /** List of all users */
  users: User[]
  /** Statistics for the stats cards */
  stats: UserStats
  /** Called when user wants to edit a user's role */
  onEditRole?: (id: string) => void
  /** Called when user wants to delete a user */
  onDelete?: (id: string) => void
}

export interface AdminBankDataProps {
  /** List of bank accounts */
  bankData: BankData[]
  /** Called when user wants to edit bank data */
  onEdit?: (id: string) => void
  /** Called when user wants to delete bank data */
  onDelete?: (id: string) => void
  /** Called when user wants to add new bank data */
  onCreate?: () => void
}

export interface AdminOrdersProps {
  /** List of orders */
  orders: Order[]
  /** Called when user wants to view order details */
  onViewDetails?: (id: string) => void
  /** Called when user wants to mark an order as paid (for transfers) */
  onMarkAsPaid?: (id: string) => void
}

export interface AdminCouponsProps {
  /** List of coupons */
  coupons: Coupon[]
  /** Called when user wants to view coupon usage stats */
  onViewStats?: (id: string) => void
  /** Called when user wants to edit a coupon */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a coupon */
  onDelete?: (id: string) => void
  /** Called when user wants to create a new coupon */
  onCreate?: () => void
}

export interface CouponFormData {
  code: string
  discountPercent: number
  maxUses: number
  restrictedEmail?: string
  restrictedCourseId?: string
  expiresAt?: string
}

// =============================================================================
// Full Admin Section Props
// =============================================================================

export interface AdministracionProps {
  /** Dashboard metrics */
  dashboardMetrics: DashboardMetrics
  /** All courses for admin view */
  courses: AdminCourse[]
  /** Course observers grouped by course */
  courseObservers: CourseObserver[]
  /** All students */
  students: Student[]
  /** Student statistics */
  studentStats: StudentStats
  /** All educators */
  educators: Educator[]
  /** Educator statistics */
  educatorStats: EducatorStats
  /** All users */
  users: User[]
  /** User statistics */
  userStats: UserStats
  /** Bank account data */
  bankData: BankData[]
  /** All orders */
  orders: Order[]
  /** All coupons */
  coupons: Coupon[]

  // Navigation
  /** Currently active section in admin sidebar */
  activeSection?: 'dashboard' | 'cursos' | 'estudiantes' | 'educadores' | 'usuarios' | 'datos-bancarios' | 'ordenes' | 'cupones'
  /** Called when user navigates to a different section */
  onNavigate?: (section: string) => void

  // Course actions
  onViewCourseDetails?: (id: string) => void
  onViewCourseObservers?: (id: string) => void

  // Student actions
  onViewStudent?: (id: string) => void
  onEditStudent?: (id: string) => void

  // Educator actions
  onViewEducator?: (id: string) => void
  onEditEducator?: (id: string) => void
  onDeleteEducator?: (id: string) => void
  onCreateEducator?: () => void

  // User actions
  onEditUserRole?: (id: string) => void
  onDeleteUser?: (id: string) => void

  // Bank data actions
  onEditBankData?: (id: string) => void
  onDeleteBankData?: (id: string) => void
  onCreateBankData?: () => void

  // Order actions
  onViewOrderDetails?: (id: string) => void
  onMarkOrderAsPaid?: (id: string) => void

  // Coupon actions
  onViewCouponStats?: (id: string) => void
  onEditCoupon?: (id: string) => void
  onDeleteCoupon?: (id: string) => void
  onCreateCoupon?: () => void
}
