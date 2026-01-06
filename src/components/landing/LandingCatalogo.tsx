'use client'

import { useRef } from 'react'
import type { LandingCatalogoProps } from '@/types/landing'
import { Header } from './Header'
import { Hero } from './Hero'
import { CourseCatalog } from './CourseCatalog'
import { Footer } from './Footer'

/**
 * LandingCatalogo - Complete landing page with header, hero, catalog, and footer
 */
export function LandingCatalogo({
  heroContent,
  tags,
  upcomingCourses,
  pastCourses,
  footerLinks,
  contactInfo,
  onViewCourse,
  onHeroCTA,
  onSubscribe,
  onNavigate,
  onLogin,
  onRegister,
}: LandingCatalogoProps) {
  const catalogRef = useRef<HTMLDivElement>(null)

  const handleHeroCTA = () => {
    onHeroCTA?.()
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        onNavigate={onNavigate}
        onLogin={onLogin}
        onRegister={onRegister}
      />

      {/* Hero */}
      <Hero
        content={heroContent}
        onCTA={handleHeroCTA}
      />

      {/* Catalog */}
      <div ref={catalogRef}>
        <CourseCatalog
          upcomingCourses={upcomingCourses}
          pastCourses={pastCourses}
          tags={tags}
          onViewCourse={onViewCourse}
        />
      </div>

      {/* Footer */}
      <Footer
        links={footerLinks}
        contactInfo={contactInfo}
        onNavigate={onNavigate}
        onSubscribe={onSubscribe}
      />
    </div>
  )
}

/**
 * LandingContent - Landing page content without header (for use with AppShell)
 */
export function LandingContent({
  heroContent,
  tags,
  upcomingCourses,
  pastCourses,
  footerLinks,
  contactInfo,
  onViewCourse,
  onHeroCTA,
  onSubscribe,
  onNavigate,
  initialFilters,
  onFilter,
}: Omit<LandingCatalogoProps, 'educators' | 'onLogin' | 'onRegister'>) {
  const catalogRef = useRef<HTMLDivElement>(null)

  const handleHeroCTA = () => {
    onHeroCTA?.()
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Hero
        content={heroContent}
        onCTA={handleHeroCTA}
      />

      {/* Catalog */}
      <div ref={catalogRef} id="catalog">
        <CourseCatalog
          upcomingCourses={upcomingCourses}
          pastCourses={pastCourses}
          tags={tags}
          initialFilters={initialFilters}
          onViewCourse={onViewCourse}
          onFilter={onFilter}
        />
      </div>

      {/* Footer */}
      <Footer
        links={footerLinks}
        contactInfo={contactInfo}
        onNavigate={onNavigate}
        onSubscribe={onSubscribe}
      />
    </div>
  )
}