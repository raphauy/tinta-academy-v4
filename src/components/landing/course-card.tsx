import type { Course, Educator } from '@/types/landing'
import { Calendar, Clock, Users, MapPin, Monitor } from 'lucide-react'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toLocalDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CourseCardProps {
  course: Course
  educator?: Educator
  onView?: () => void
  isPast?: boolean
}

// Default placeholder image
const DEFAULT_COURSE_IMAGE = '/placeholder-course.jpg'

type BadgeVariant = 'default' | 'verde-uva' | 'muted'

/**
 * CourseCard - Clean course card with visible image
 */
export function CourseCard({ course, educator, onView, isPast }: CourseCardProps) {
  const formatDate = (date?: Date | null) => {
    if (!date) return ''
    try {
      return format(toLocalDate(date), 'd MMM. yyyy', { locale: es })
    } catch {
      return ''
    }
  }

  const getTypeLabel = (type: Course['type'], wsetLevel?: number | null) => {
    if (type === 'wset' && wsetLevel) {
      return `WSET ${wsetLevel}`
    }
    const labels: Record<string, string> = {
      wset: 'WSET',
      taller: 'Taller',
      cata: 'Cata',
      curso: 'Curso',
    }
    return labels[type] || type
  }

  const getTypeVariant = (type: Course['type']): BadgeVariant => {
    switch (type) {
      case 'wset':
        return 'default'
      case 'taller':
      case 'cata':
        return 'verde-uva'
      default:
        return 'muted'
    }
  }

  const imageUrl = course.imageUrl || DEFAULT_COURSE_IMAGE

  return (
    <article className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border h-full flex flex-col">
      {/* Image - using fill like v3 */}
      <div
        className="relative h-48 shrink-0 cursor-pointer"
        onClick={onView}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onView?.()}
      >
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant={getTypeVariant(course.type)} className="px-3 py-1 font-semibold">
            {getTypeLabel(course.type, course.wsetLevel)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-background/95 backdrop-blur-sm">
            {course.modality === 'online' ? (
              <>
                <Monitor size={12} />
                Online
              </>
            ) : (
              <>
                <MapPin size={12} />
                {course.location}
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Top section: Title + Description + Tags */}
        <div>
          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {course.title}
          </h3>

          {/* Description - always takes space */}
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 min-h-[2.5rem]">
            {course.description || '\u00A0'}
          </p>

          {/* Tags - always takes space */}
          <div className="flex flex-wrap gap-1.5 mb-4 min-h-[1.75rem]">
            {course.tags && course.tags.length > 0 && course.tags.map((tag) => (
              <Badge key={tag.id} variant="verde-uva">
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bottom section - always at bottom */}
        <div className="mt-auto">
          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
            {course.startDate ? (
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} className="text-primary" />
                {formatDate(course.startDate)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Monitor size={14} className="text-primary" />
                Acceso inmediato
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              {course.duration}h
            </span>
            {course.maxCapacity && (
              <span className="inline-flex items-center gap-1">
                <Users size={14} className="text-primary" />
                Máx. {course.maxCapacity}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            {/* Educator */}
            {educator && (
              <div className="flex items-center gap-2">
                {educator.imageUrl ? (
                  <Image
                    src={educator.imageUrl}
                    alt={educator.name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    {educator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{educator.name}</p>
                  <p className="text-xs text-muted-foreground">{educator.title}</p>
                </div>
              </div>
            )}

            {/* Price - hidden for past courses */}
            {!isPast && (
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  {course.priceUSD === 0 ? 'Gratis' : `USD ${course.priceUSD}`}
                </p>
              </div>
            )}
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={onView}
            className="mt-4 w-full"
          >
            Ver detalles
          </Button>
        </div>
      </div>
    </article>
  )
}
