'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { toast } from 'sonner'
import type { HeroContent, FooterLinks, ContactInfo, Course, Tag, CourseFilters } from '@/types/landing'
import { LandingContent } from './landing-catalogo'
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

  // Update URL without navigation (just sync URL with current filters)
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
    const newUrl = queryString ? `/?${queryString}` : '/'

    // Update URL without causing navigation/reload
    window.history.replaceState(null, '', newUrl)
  }, [])

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

  return (
    <LandingContent
      heroContent={heroContent}
      tags={tags}
      upcomingCourses={upcomingCourses}
      pastCourses={pastCourses}
      footerLinks={footerLinks}
      contactInfo={contactInfo}
      initialFilters={initialFilters}
      onViewCourse={handleViewCourse}
      onFilter={handleFilter}
      onNavigate={handleNavigate}
      onSubscribe={handleSubscribe}
    />
  )
}
