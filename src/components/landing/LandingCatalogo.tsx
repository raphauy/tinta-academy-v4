'use client'

import { useRef } from 'react'
import type { LandingCatalogoProps } from '@/types/landing'
import { useLandingShell } from '@/components/shell'
import { Header } from './Header'
import { Hero } from './Hero'
import { WSETSection } from './wset-section'
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
  user,
  onViewCourse,
  onHeroCTA,
  onSubscribe,
  onNavigate,
}: LandingCatalogoProps) {
  const catalogRef = useRef<HTMLDivElement>(null)

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleHeroCTA = () => {
    onHeroCTA?.()
    scrollToCatalog()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header user={user} onScrollToCatalog={scrollToCatalog} />

      {/* Hero */}
      <Hero
        content={heroContent}
        onCTA={handleHeroCTA}
      />

      {/* WSET Section */}
      <WSETSection onCTA={scrollToCatalog} />

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
 * LandingContent - Landing page content with transparent header over hero
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
  const { user } = useLandingShell()

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleHeroCTA = () => {
    onHeroCTA?.()
    scrollToCatalog()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Transparent over hero */}
      <Header user={user} onScrollToCatalog={scrollToCatalog} />

      {/* Hero */}
      <Hero
        content={heroContent}
        onCTA={handleHeroCTA}
      />

      {/* WSET Section */}
      <WSETSection onCTA={scrollToCatalog} />

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