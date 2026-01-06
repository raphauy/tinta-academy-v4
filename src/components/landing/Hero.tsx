import type { HeroContent } from '@/types/landing'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface HeroProps {
  content: HeroContent
  onCTA?: () => void
}

/**
 * Hero - Clean cinematic hero section
 * Design: Full-width hero with clear visual hierarchy
 */
export function Hero({ content, onCTA }: HeroProps) {
  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&q=80"
          alt="Wine tasting"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#143F3B]/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl lg:max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            {content.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8 max-w-xl lg:max-w-2xl mx-auto">
            {content.subheadline}
          </p>

          {/* CTA Button */}
          <Button
            onClick={onCTA}
            size="lg"
            className="rounded-full !px-12 py-6 bg-white text-[#143F3B] font-semibold hover:bg-[#DDBBC0] shadow-lg"
          >
            {content.ctaText}
            <ChevronDown size={20} />
          </Button>
        </div>
      </div>
    </section>
  )
}