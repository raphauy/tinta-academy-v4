// =============================================================================
// Data Types
// =============================================================================

export interface Educator {
  id: string
  name: string
  title: string
  bio: string
  email: string
  image: string
}

export interface ChartDataPoint {
  month: string
  value: number
}

export interface DashboardChartData {
  students: ChartDataPoint[]
  progress: ChartDataPoint[]
}

export interface DashboardMetrics {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  activeCourses: number
  averageProgress: number
  completionRate: number
  studentsThisMonth: number
  studentsLastMonth: number
  chartData: DashboardChartData
}

export interface Course {
  id: string
  title: string
  slug: string
  type: 'wset' | 'taller' | 'cata' | 'curso'
  modality: 'online' | 'presencial'
  status: 'draft' | 'published' | 'finished'
  description: string
  image: string
  duration: string
  priceUSD: number | null
  priceUYU: number | null
  // Online course fields
  totalStudents?: number
  activeStudents?: number
  averageProgress?: number
  totalModules?: number
  totalLessons?: number
  // Presencial course fields
  maxCapacity?: number
  enrolledCount?: number
  location?: string
  eventDate?: string
  eventTime?: string
  // Timestamps
  createdAt: string
  publishedAt: string | null
}

export interface Module {
  id: string
  courseId: string
  title: string
  description: string
  order: number
  lessonsCount: number
  completedByStudents: number
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'document' | 'link'
  size: string
  url: string
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  description: string
  videoUrl: string
  videoDuration: number
  order: number
  resources: Resource[]
}

export interface EnrolledStudent {
  id: string
  courseId: string
  name: string
  email: string
  image: string | null
  enrolledAt: string
  lastAccessAt: string
  completedLessons: number
  totalLessons: number
  progress: number
}

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

// =============================================================================
// Component Props
// =============================================================================

export interface EducatorDashboardProps {
  /** The educator's profile information */
  educator: Educator
  /** Aggregated metrics for the dashboard */
  metrics: DashboardMetrics
  /** List of educator's courses for quick access */
  courses: Course[]
  /** Called when user wants to view a course */
  onViewCourse?: (id: string) => void
  /** Called when user wants to create a new course */
  onCreateCourse?: () => void
}

export interface CourseListProps {
  /** List of courses to display */
  courses: Course[]
  /** Called when user wants to view a course */
  onView?: (id: string) => void
  /** Called when user wants to edit a course */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a course */
  onDelete?: (id: string) => void
  /** Called when user wants to publish a draft course */
  onPublish?: (id: string) => void
  /** Called when user wants to duplicate a course */
  onDuplicate?: (id: string) => void
  /** Called when user wants to create a new course */
  onCreate?: () => void
}

export interface CourseEditorProps {
  /** The course being edited (null for new course) */
  course: Course | null
  /** Modules for the course (online only) */
  modules: Module[]
  /** Lessons organized by module */
  lessons: Lesson[]
  /** Called when user saves course changes */
  onSave?: (course: Partial<Course>) => void
  /** Called when user cancels editing */
  onCancel?: () => void
  /** Called when user publishes the course */
  onPublish?: () => void
  /** Called when user creates a new module */
  onCreateModule?: () => void
  /** Called when user edits a module */
  onEditModule?: (id: string) => void
  /** Called when user deletes a module */
  onDeleteModule?: (id: string) => void
  /** Called when user reorders modules */
  onReorderModules?: (moduleIds: string[]) => void
  /** Called when user creates a new lesson in a module */
  onCreateLesson?: (moduleId: string) => void
  /** Called when user edits a lesson */
  onEditLesson?: (id: string) => void
  /** Called when user deletes a lesson */
  onDeleteLesson?: (id: string) => void
  /** Called when user reorders lessons within a module */
  onReorderLessons?: (moduleId: string, lessonIds: string[]) => void
}

export interface StudentListProps {
  /** Course the students are enrolled in */
  course: Course
  /** List of enrolled students with progress */
  students: EnrolledStudent[]
  /** Called when user wants to view student details */
  onViewStudent?: (id: string) => void
  /** Called when user wants to send email to a student */
  onEmailStudent?: (id: string) => void
  /** Called when user wants to export student list */
  onExport?: () => void
}

export interface EmailTemplateListProps {
  /** List of email templates */
  templates: EmailTemplate[]
  /** Called when user wants to view/edit a template */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a template */
  onDelete?: (id: string) => void
  /** Called when user wants to duplicate a template */
  onDuplicate?: (id: string) => void
  /** Called when user wants to create a new template */
  onCreate?: () => void
  /** Called when user wants to use a template for a campaign */
  onUseTemplate?: (id: string) => void
}

export interface EmailCampaignListProps {
  /** List of email campaigns */
  campaigns: EmailCampaign[]
  /** Called when user wants to view campaign details */
  onView?: (id: string) => void
  /** Called when user wants to edit a draft campaign */
  onEdit?: (id: string) => void
  /** Called when user wants to delete a campaign */
  onDelete?: (id: string) => void
  /** Called when user wants to duplicate a campaign */
  onDuplicate?: (id: string) => void
  /** Called when user wants to create a new campaign */
  onCreate?: () => void
}

export interface SendEmailProps {
  /** Available courses to send to */
  courses: Course[]
  /** Available templates to use */
  templates: EmailTemplate[]
  /** Called when user sends the email */
  onSend?: (courseId: string, templateId: string, scheduledAt: string | null) => void
  /** Called when user cancels */
  onCancel?: () => void
}
