'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Testimonial {
  name: string
  course: string
  comment: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Danis Machado',
    course: 'Pasaporte a la Cultura del Vino',
    comment: 'Directo al punto sin rodeos en la presentación. Clara y informativa destacando la posibilidad de responder inquietudes. Muy recomendable.',
  },
  {
    name: 'Micaela Ficotto',
    course: 'Pasaporte a la Cultura del Vino',
    comment: 'Todo el taller completo, muy interesante y muy bien dictado. Se nota que Gabi tiene pasión por todo lo que explica y eso lo hace aun mucho mejor.',
  },
  {
    name: 'Macarena Acotto',
    course: 'Pasaporte a la Cultura del Vino',
    comment: 'Fue muy didáctico y nos respondieron todas nuestras consultas.',
  },
  {
    name: 'Gabriela Aguiar',
    course: 'Pasaporte a la Cultura del Vino',
    comment: 'Muchas gracias por el taller, es una breve introducción super interesante que te deja con ganas de seguir aprendiendo sobre el mundo del vino.',
  },
  {
    name: 'Christian Viera',
    course: 'WSET Nivel 1',
    comment: 'Fue mi primer experiencia y fue súper positiva. La dinámica me gustó mucho, el timing excelente, las explicaciones de cada duda que surgía y los vinos seleccionados.',
  },
  {
    name: 'Bruno Galeazzi',
    course: 'WSET Nivel 1',
    comment: 'El curso en su totalidad es muy enriquecedor, superó expectativas.',
  },
  {
    name: 'Agustín Deicas',
    course: 'WSET Nivel 2',
    comment: 'Me gustó mucho comprender mejor el impacto de las regiones en los tipos de uva y por tanto en los vinos que se hacen. Quedé muy entusiasmado por haber participado.',
  },
  {
    name: 'Álvaro Bandomo Montes de Oca',
    course: 'WSET Nivel 1',
    comment: 'WSET es un paso que todo sommelier y personal gastronómico debería incorporar a su capacitación. Te prepara desde una base sólida, con una guía de estudio práctica pero objetiva que va subiendo de dificultad a medida que avanzas de nivel.',
  },
  {
    name: 'Cristina Santoro',
    course: 'WSET Nivel 2',
    comment: 'Fue muy claro y ordenado el material, hermoso grupo y vinos deliciosos.',
  },
  {
    name: 'Álvaro Moré',
    course: 'WSET Nivel 2',
    comment: 'Destaco el conocimiento de Gabi Zimmer, la puntualidad y la calidad del grupo. Esta formación es muy importante para avanzar en el mundo del vino, no es solo un curso es una certificación profesional.',
  },
]

/**
 * TestimonialsSection - Carousel of customer testimonials
 */
export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
    },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onInit = useCallback(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onInit()
    onSelect()
    emblaApi.on('reInit', onInit)
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('reInit', onInit)
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <section className="w-full py-16 lg:py-24 bg-[#F9F7F4] dark:bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#143F3B] dark:text-white mb-4">
            Lo que dicen nuestros estudiantes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experiencias de quienes ya han recorrido el camino de la formación en vinos con nosotros.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative -ml-6">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-6"
                >
                  <div className="h-full bg-white dark:bg-[#2a2a2a] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                    {/* Quote Icon */}
                    <Quote className="w-8 h-8 text-[#C4704B] mb-4 flex-shrink-0" />

                    {/* Comment */}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 flex-grow">
                      "{testimonial.comment}"
                    </p>

                    {/* Author */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="font-semibold text-[#143F3B] dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-[#C4704B]">{testimonial.course}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-6 top-1/2 -translate-y-1/2 -translate-x-4 hidden lg:flex rounded-full bg-white dark:bg-[#143F3B] shadow-md border-gray-200 dark:border-[#143F3B] hover:bg-gray-50 dark:hover:bg-[#1a524d] text-gray-700 dark:text-white"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden lg:flex rounded-full bg-white dark:bg-[#143F3B] shadow-md border-gray-200 dark:border-[#143F3B] hover:bg-gray-50 dark:hover:bg-[#1a524d] text-gray-700 dark:text-white"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                selectedIndex === index
                  ? 'bg-[#143F3B] dark:bg-white w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
