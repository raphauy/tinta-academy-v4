'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import type { HeroContent, FooterLinks, ContactInfo, Course, Tag, CourseFilters } from '@/types/landing'
import { LandingContent } from './LandingCatalogo'
import { subscribeToNewsletter } from '@/app/(public)/actions'

interface LandingClientWrapperProps {
  heroContent: HeroContent
  tags: Tag[]
  upcomingCourses: Course[]
  pastCourses: Course[]
  footerLinks: FooterLinks
  contactInfo: ContactInfo
  initialFilters: CourseFilters
}

export function LandingClientWrapper({
  heroContent,
  tags,
  upcomingCourses,
  pastCourses,
  footerLinks,
  contactInfo,
  initialFilters,
}: LandingClientWrapperProps) {
  const router = useRouter()

  // Use filters passed from server (avoids hydration issues with useSearchParams)
  const currentFilters = initialFilters

  // Update URL with new filters
  const handleFilter = useCallback((filters: CourseFilters) => {
    const params = new URLSearchParams()

    if (filters.modality) {
      params.set('modality', filters.modality)
    }
    if (filters.type) {
      params.set('type', filters.type)
    }
    if (filters.tagIds && filters.tagIds.length > 0) {
      params.set('tagIds', filters.tagIds.join(','))
    }

    const queryString = params.toString()
    router.push(queryString ? `/?${queryString}` : '/', { scroll: false })
  }, [router])

  // Handle navigation
  const handleNavigate = useCallback((href: string) => {
    router.push(href)
  }, [router])

  // Handle view course
  const handleViewCourse = useCallback((courseSlug: string) => {
    router.push(`/cursos/${courseSlug}`)
  }, [router])

  // Handle newsletter subscription
  const handleSubscribe = useCallback(async (email: string) => {
    const result = await subscribeToNewsletter(email)
    if (result.success) {
      toast.success('¡Gracias por suscribirte!', {
        description: 'Te enviaremos noticias sobre nuestros cursos y eventos.'
      })
    } else {
      toast.error('Error al suscribirse', {
        description: result.error || 'Por favor, intenta nuevamente.'
      })
    }
    return result
  }, [])

  // Filter courses client-side based on current URL params
  const filteredUpcoming = useMemo(() => {
    return upcomingCourses.filter((course) => {
      if (currentFilters.modality && course.modality !== currentFilters.modality) return false
      if (currentFilters.type && course.type !== currentFilters.type) return false
      if (currentFilters.tagIds && currentFilters.tagIds.length > 0) {
        const hasMatchingTag = currentFilters.tagIds.some((tagId) =>
          course.tags.some(tag => tag.id === tagId)
        )
        if (!hasMatchingTag) return false
      }
      return true
    })
  }, [upcomingCourses, currentFilters])

  const filteredPast = useMemo(() => {
    return pastCourses.filter((course) => {
      if (currentFilters.modality && course.modality !== currentFilters.modality) return false
      if (currentFilters.type && course.type !== currentFilters.type) return false
      if (currentFilters.tagIds && currentFilters.tagIds.length > 0) {
        const hasMatchingTag = currentFilters.tagIds.some((tagId) =>
          course.tags.some(tag => tag.id === tagId)
        )
        if (!hasMatchingTag) return false
      }
      return true
    })
  }, [pastCourses, currentFilters])

  return (
    <LandingContent
      heroContent={heroContent}
      tags={tags}
      upcomingCourses={filteredUpcoming}
      pastCourses={filteredPast}
      footerLinks={footerLinks}
      contactInfo={contactInfo}
      onViewCourse={handleViewCourse}
      onFilter={handleFilter}
      onNavigate={handleNavigate}
      onSubscribe={handleSubscribe}
    />
  )
}
