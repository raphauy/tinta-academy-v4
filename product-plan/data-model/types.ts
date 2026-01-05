// =============================================================================
// Core User Types
// =============================================================================

export type UserRole = 'admin' | 'educator' | 'student' | 'user'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
  lastLoginAt: string
}

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
  // Billing info
  billingName: string
  billingTaxId: string
  billingAddress: string
  // Notification preferences
  notificationPreferences: NotificationPreferences
  // Stats
  enrollmentsCount?: number
  completedCourses?: number
  totalSpent?: number
  createdAt: string
  lastActivityAt?: string
}

export interface NotificationPreferences {
  emailNewCourses: boolean
  emailPromotions: boolean
  emailCourseUpdates: boolean
}

export interface Educator {
  id: string
  userId: string
  name: string
  email: string
  title: string
  bio: string
  imageUrl: string
  // Stats
  coursesCount?: number
  studentsCount?: number
  rating?: number
  createdAt: string
}

// =============================================================================
// Course Types
// =============================================================================

export type CourseType = 'wset' | 'taller' | 'cata' | 'curso'
export type CourseModality = 'presencial' | 'online'
export type CourseStatus = 'draft' | 'announced' | 'enrolling' | 'full' | 'in_progress' | 'finished' | 'available'

export interface Course {
  id: string
  slug: string
  title: string
  type: CourseType
  wsetLevel?: 1 | 2 | 3
  modality: CourseModality
  status: CourseStatus
  description: string
  imageUrl: string
  // Educator
  educatorId: string
  educatorName?: string
  // Pricing
  priceUSD: number | null
  priceUYU: number | null
  // Timing
  duration: number | string // hours or "X semanas"
  startDate?: string
  endDate?: string
  // Capacity (presencial)
  maxCapacity?: number
  enrolledCount?: number
  location?: string
  address?: string
  eventDate?: string
  eventTime?: string
  // Stats (online)
  totalStudents?: number
  activeStudents?: number
  averageProgress?: number
  totalModules?: number
  totalLessons?: number
  // Tags
  tagIds?: string[]
  // Timestamps
  createdAt: string
  publishedAt: string | null
}

export interface Tag {
  id: string
  name: string
  slug: string
}

// =============================================================================
// Course Content Types
// =============================================================================

export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessonsCount?: number
  completedByStudents?: number
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description?: string
  videoUrl: string
  videoDuration: number // seconds
  order: number
  resources?: Resource[]
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'document' | 'link'
  url: string
  size: number | string // bytes or formatted string
}

export interface Evaluation {
  id: string
  moduleId?: string
  courseId: string
  title: string
  type: 'quiz' | 'mock_test'
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctOptionIndex: number
}

// =============================================================================
// Enrollment & Progress Types
// =============================================================================

export interface Enrollment {
  id: string
  courseId: string
  studentId: string
  studentName?: string
  email?: string
  enrolledAt: string
  status: 'active' | 'completed' | 'dropped'
  progress?: number
}

export interface Progress {
  lessonId: string
  studentId: string
  completed: boolean
  completedAt?: string
}

export interface EnrolledCourse {
  id: string
  courseId: string
  courseType: 'online' | 'in_person'
  courseCategory: CourseType
  title: string
  slug: string
  thumbnail: string
  educatorName: string
  enrolledAt: string
  status: 'in_progress' | 'completed' | 'upcoming'
  progress?: CourseProgress
  modules?: ModuleWithLessons[]
  eventInfo?: EventInfo
  resources: Resource[]
}

export interface CourseProgress {
  completedLessons: number
  totalLessons: number
  percentage: number
  lastAccessedAt: string
  currentLessonId: string | null
}

export interface ModuleWithLessons extends Module {
  lessons: LessonWithProgress[]
}

export interface LessonWithProgress {
  id: string
  title: string
  duration: number
  completed: boolean
}

export interface EventInfo {
  location: string
  address: string
  dates: string[]
  schedule: string
  examDate?: string
  examResult?: 'passed' | 'failed' | 'pending'
  certificateUrl?: string
}

// =============================================================================
// Payment Types
// =============================================================================

export type OrderStatus = 'Created' | 'Pending' | 'PaymentSent' | 'Paid' | 'Rejected' | 'Refunded' | 'Cancelled'
export type PaymentMethod = 'MercadoPago' | 'Transferencia' | 'Gratuito'

export interface Order {
  id: string
  orderNumber: string
  studentId: string
  studentName?: string
  studentEmail?: string
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

// =============================================================================
// Communication Types
// =============================================================================

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  createdAt: string
  usageCount: number
}

export interface EmailCampaign {
  id: string
  templateId: string
  templateName: string
  courseId: string
  courseName: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent'
  recipientCount: number
  sentCount: number
  openRate: number | null
  scheduledAt: string | null
  sentAt: string | null
}

export interface Comment {
  id: string
  lessonId: string
  studentId: string
  studentName: string
  content: string
  createdAt: string
}

// =============================================================================
// Observer Types
// =============================================================================

export interface CourseObserver {
  id: string
  courseId: string
  userId: string
  email: string
  createdAt: string
}
