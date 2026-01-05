// =============================================================================
// Data Types
// =============================================================================

export interface NotificationPreferences {
  emailNewCourses: boolean
  emailPromotions: boolean
  emailCourseUpdates: boolean
}

export interface Student {
  id: string
  email: string
  firstName: string
  lastName: string
  birthDate: string
  avatarUrl: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  billingName: string
  billingTaxId: string
  billingAddress: string
  notificationPreferences: NotificationPreferences
}

export interface Lesson {
  id: string
  title: string
  duration: number
  completed: boolean
}

export interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'document' | 'link'
  url: string
  size: number
}

export interface Progress {
  completedLessons: number
  totalLessons: number
  percentage: number
  lastAccessedAt: string
  currentLessonId: string | null
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

export interface EnrolledCourse {
  id: string
  courseId: string
  courseType: 'online' | 'in_person'
  courseCategory: 'wset' | 'workshop' | 'tasting' | 'course'
  title: string
  slug: string
  thumbnail: string
  educatorName: string
  enrolledAt: string
  status: 'in_progress' | 'completed' | 'upcoming'
  progress?: Progress
  modules?: Module[]
  eventInfo?: EventInfo
  resources: Resource[]
}

export interface Order {
  id: string
  orderNumber: string
  courseId: string
  courseTitle: string
  createdAt: string
  amount: number
  currency: 'USD' | 'UYU'
  paymentMethod: 'mercadopago' | 'transfer' | 'free'
  status: 'created' | 'pending' | 'payment_sent' | 'paid' | 'rejected' | 'refunded' | 'cancelled'
}

// =============================================================================
// Component Props
// =============================================================================

export interface StudentPanelProps {
  /** Student profile data */
  student: Student
  /** List of courses the student is enrolled in */
  enrolledCourses: EnrolledCourse[]
  /** Student's order history */
  orders: Order[]
}

export interface CourseListProps {
  /** List of enrolled courses to display */
  courses: EnrolledCourse[]
  /** Called when user wants to continue/access an online course */
  onContinueCourse?: (courseId: string, lessonId?: string) => void
  /** Called when user wants to view in-person course details */
  onViewCourseDetails?: (courseId: string) => void
  /** Called when user wants to download a resource */
  onDownloadResource?: (resourceId: string) => void
}

export interface OrderHistoryProps {
  /** List of orders to display */
  orders: Order[]
  /** Called when user wants to view order details */
  onViewOrder?: (orderId: string) => void
}

export interface ProfileProps {
  /** Student profile data */
  student: Student
  /** Called when user saves profile changes */
  onSaveProfile?: (updates: Partial<Student>) => void
  /** Called when user updates notification preferences */
  onUpdateNotifications?: (preferences: NotificationPreferences) => void
}

export interface LessonPlayerProps {
  /** The lesson to play */
  lesson: Lesson
  /** All lessons in the module for navigation */
  moduleLessons: Lesson[]
  /** Course resources available for download */
  resources: Resource[]
  /** Called when lesson is marked as complete */
  onMarkComplete?: (lessonId: string) => void
  /** Called when user navigates to another lesson */
  onNavigateLesson?: (lessonId: string) => void
  /** Called when user downloads a resource */
  onDownloadResource?: (resourceId: string) => void
}
