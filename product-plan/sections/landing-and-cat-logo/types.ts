// =============================================================================
// Data Types
// =============================================================================

export interface Educator {
  id: string
  name: string
  title: string
  bio: string
  imageUrl: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Course {
  id: string
  slug: string
  title: string
  type: 'wset' | 'taller' | 'cata' | 'curso'
  wsetLevel?: 1 | 2 | 3
  modality: 'presencial' | 'online'
  description: string
  /** Start date - only for presencial courses */
  startDate?: string
  /** End date - only for presencial courses */
  endDate?: string
  /** Duration in hours */
  duration: number
  /** Max capacity - only for presencial courses */
  maxCapacity?: number
  /** Enrolled count - only for presencial courses */
  enrolledCount?: number
  priceUSD: number
  /** Location - "Online" for online courses, city name for presencial */
  location: string
  address?: string | null
  imageUrl: string
  educatorId: string
  tagIds: string[]
  /** Status - online courses are always 'available' */
  status: 'announced' | 'enrolling' | 'full' | 'in_progress' | 'finished' | 'available'
}

export interface HeroContent {
  headline: string
  subheadline: string
  ctaText: string
  videoUrl: string
}

export interface FooterLink {
  label: string
  href: string
  icon?: string
}

export interface FooterLinks {
  about: FooterLink[]
  courses: FooterLink[]
  legal: FooterLink[]
  social: FooterLink[]
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
}

// =============================================================================
// Filter Types
// =============================================================================

export interface CourseFilters {
  modality?: 'presencial' | 'online' | null
  type?: 'wset' | 'taller' | 'cata' | 'curso' | null
  tagIds?: string[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface LandingCatalogoProps {
  /** Content for the hero section */
  heroContent: HeroContent
  /** List of educators to display on course cards */
  educators: Educator[]
  /** Available tags for filtering */
  tags: Tag[]
  /** Upcoming courses (with future dates) */
  upcomingCourses: Course[]
  /** Past courses (already finished) */
  pastCourses: Course[]
  /** Footer link columns */
  footerLinks: FooterLinks
  /** Contact information for footer */
  contactInfo: ContactInfo
  /** Called when user clicks on a course card to view details */
  onViewCourse?: (courseSlug: string) => void
  /** Called when user applies filters */
  onFilter?: (filters: CourseFilters) => void
  /** Called when user clicks CTA in hero */
  onHeroCTA?: () => void
  /** Called when user subscribes to newsletter */
  onSubscribe?: (email: string) => void
  /** Called when user clicks a navigation link */
  onNavigate?: (href: string) => void
  /** Called when user clicks login button */
  onLogin?: () => void
  /** Called when user clicks register button */
  onRegister?: () => void
}
