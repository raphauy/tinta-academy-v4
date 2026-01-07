'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface EducationSectionProps {
  onCTA?: () => void
}

/**
 * EducationSection - Promotional section about education philosophy
 * Design: Rounded image with centered text overlay
 */
export function EducationSection({ onCTA }: EducationSectionProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="relative rounded-3xl overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <Image
          src="/personas.jpg"
          alt="Educación en vinos"
          fill
          className="object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center px-6 md:px-12 lg:px-24 max-w-4xl">
          <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed mb-8">
            Creemos en el poder transformador del conocimiento y ofrecemos una educación de excelencia que combina teoría, práctica y experiencia, permitiéndote vivir y apreciar la cultura del vino de una manera significativa.
          </p>

          <Button
            onClick={onCTA}
            size="lg"
            className="rounded-full !px-12 py-6 bg-[#C4704B] text-white font-semibold hover:bg-[#B3603B] shadow-lg"
          >
            Explorar cursos
          </Button>
        </div>
      </div>
    </section>
  )
}
