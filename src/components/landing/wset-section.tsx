'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'

interface WSETSectionProps {
  onCTA?: () => void
}

/**
 * WSETSection - Promotional section about WSET certification
 * Design: Rounded image with centered text overlay
 */
export function WSETSection({ onCTA }: WSETSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="relative rounded-3xl overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center justify-center">
        {/* Background Image */}
        <Image
          src="/WSET.jpg"
          alt="WSET Certification"
          fill
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 md:px-12 lg:px-24 max-w-4xl">
          <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed mb-8">
            <span className="font-semibold">Wine & Spirit Education Trust (WSET)</span> es una de
            las instituciones de educación en vinos más reconocidas
            a nivel internacional. Sus certificaciones ofrecen un marco
            claro y estructurado para aprender vino con lenguaje común,
            criterio y estándares globales, y son hoy una referencia
            para profesionales y entusiastas en todo el mundo.
          </p>

          <Button
            onClick={onCTA}
            size="lg"
            className="rounded-full !px-12 py-6 bg-white text-[#143F3B] font-semibold hover:bg-[#DDBBC0] shadow-lg"
          >
            Encuentra tu curso
            <ChevronDown size={20} />
          </Button>
        </div>
      </div>
    </section>
  )
}
