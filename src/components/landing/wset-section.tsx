'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface WSETSectionProps {
  onCTA?: () => void
}

/**
 * WSETSection - Promotional section about WSET certification
 * Design: Two-column layout with text on left and image on right
 */
export function WSETSection({ onCTA }: WSETSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Column - Content */}
        <div className="order-2 lg:order-1">
          {/* WSET Title */}
          <h2 className="text-4xl md:text-5xl font-bold text-verde-uva-700 mb-2">WSET</h2>
          <p className="text-verde-uva-500 italic text-xl md:text-2xl mb-8">en Uruguay</p>

          {/* Description */}
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            Wine & Spirit Education Trust (WSET) es una de las instituciones de educación en vinos más reconocidas a nivel internacional. Sus certificaciones ofrecen un marco claro y estructurado para aprender vino con lenguaje común, criterio y estándares globales, y son hoy una referencia para profesionales y entusiastas en todo el mundo.
          </p>

          {/* WSET APP Logo */}
          <Image
            src="/WSET_LANDSCAPE_APP_RGB.png"
            alt="WSET Approved Programme Provider"
            width={180}
            height={60}
            className="h-12 md:h-14 w-auto mb-8"
          />

          {/* CTA Button */}
          <Button
            onClick={onCTA}
            size="lg"
            variant="outline"
            className="rounded-full !px-8 py-6 border-verde-uva-700 text-verde-uva-700 font-semibold hover:bg-verde-uva-700 hover:text-white"
          >
            Ver cursos
          </Button>
        </div>

        {/* Right Column - Image */}
        <div className="order-1 lg:order-2">
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
            <Image
              src="/WSET.jpg"
              alt="WSET Certification"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
