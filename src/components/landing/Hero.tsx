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
          src="/hero.jpg"
          alt="Wine tasting"
          fill
          className="object-cover"
          priority
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl lg:max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 whitespace-nowrap">
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
            className="rounded-full !px-12 py-6 bg-white text-verde-uva-700 font-semibold hover:bg-verde-uva-300 shadow-lg"
          >
            {content.ctaText}
            <ChevronDown size={20} />
          </Button>
        </div>
      </div>
    </section>
  )
}