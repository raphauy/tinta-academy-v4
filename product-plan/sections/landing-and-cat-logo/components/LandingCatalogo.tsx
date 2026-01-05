import { useRef } from 'react'
import type { LandingCatalogoProps } from '@/../product/sections/landing-and-cat-logo/types'
import { Header } from './Header'
import { Hero } from './Hero'
import { CourseCatalog } from './CourseCatalog'
import { Footer } from './Footer'

/**
 * LandingCatalogo - Complete landing page with header, hero, catalog, and footer
 */
export function LandingCatalogo({
  heroContent,
  educators,
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
          educators={educators}
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
