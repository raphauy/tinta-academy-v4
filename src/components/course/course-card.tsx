import { Calendar, Clock, MapPin, Monitor } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toLocalDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Default images for different course types
const courseImages: Record<string, string> = {
  wset: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80',
  taller: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=600&q=80',
  cata: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80',
  curso: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
}

type BadgeVariant = 'default' | 'verde-uva' | 'muted'

export interface CourseCardData {
  id: string
  slug: string
  title: string
  type: string
  modality: string
  status: string
  imageUrl: string | null
  location: string | null
  description?: string | null
  duration?: string | null
  wsetLevel?: number | null
  /** Date to display (could be startDate, effectiveDate, etc.) */
  displayDate?: Date | null
  educator: {
    name: string
    imageUrl?: string | null
  }
  tags?: Array<{ id: string; name: string }>
}

interface CourseCardProps {
  course: CourseCardData
  /** Link href - defaults to /cursos/[slug] */
  href?: string
  /** Show price section */
  priceUSD?: number
  /** Hide the date display */
  hideDate?: boolean
  /** Custom badge to show (e.g., "Inscrito", "Completado") */
  statusBadge?: {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'verde-uva' | 'muted' | 'info' | 'success' | 'warning'
  }
  /** CTA button configuration - if not provided, card is just a link */
  cta?: {
    label: string
    href?: string
  }
}

function formatDate(date: Date | null | undefined) {
  if (!date) return null
  try {
    const localDate = toLocalDate(date)
    const currentYear = new Date().getFullYear()
    const dateYear = localDate.getFullYear()

    if (dateYear !== currentYear) {
      return format(localDate, "d 'de' MMMM yyyy", { locale: es })
    }
    return format(localDate, "d 'de' MMMM", { locale: es })
  } catch {
    return null
  }
}

function getTypeLabel(type: string, wsetLevel?: number | null) {
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

function getTypeVariant(type: string): BadgeVariant {
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

/**
 * Reusable CourseCard component for displaying course information
 * Used in landing page catalog, student dashboard, etc.
 */
export function CourseCard({
  course,
  href,
  priceUSD,
  hideDate,
  statusBadge,
  cta,
}: CourseCardProps) {
  const imageUrl = course.imageUrl || courseImages[course.type] || courseImages['curso']
  const linkHref = href ?? `/cursos/${course.slug}`
  const formattedDate = formatDate(course.displayDate)

  const cardContent = (
    <article className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 shrink-0">
          <Image
            src={imageUrl}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={getTypeVariant(course.type)} className="px-3 py-1 font-semibold shadow-sm">
              {getTypeLabel(course.type, course.wsetLevel)}
            </Badge>
          </div>
          {/* Modality/Location Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-background/95 backdrop-blur-sm shadow-sm">
              {course.modality === 'online' ? (
                <>
                  <Monitor size={12} className="mr-1" />
                  Online
                </>
              ) : (
                <>
                  <MapPin size={12} className="mr-1" />
                  {course.location || 'Presencial'}
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Status Badge (if provided) */}
          {statusBadge && (
            <div className="mb-2">
              <Badge variant={statusBadge.variant} className="text-xs">
                {statusBadge.label}
              </Badge>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {course.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.id} variant="verde-uva" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Spacer to push footer to bottom */}
          <div className="flex-1" />

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
            {!hideDate && formattedDate && (
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} className="text-primary" />
                {formattedDate}
              </span>
            )}
            {course.duration && (
              <span className="inline-flex items-center gap-1">
                <Clock size={14} className="text-primary" />
                {course.duration}
              </span>
            )}
          </div>

          {/* Footer: Educator + Price */}
          <div className="border-t border-border pt-3 flex items-center justify-between">
            {/* Educator */}
            <div className="flex items-center gap-2">
              {course.educator.imageUrl ? (
                <Image
                  src={course.educator.imageUrl}
                  alt={course.educator.name}
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  {course.educator.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
              )}
              <span className="text-sm font-medium text-foreground">
                {course.educator.name}
              </span>
            </div>

            {/* Price (if provided) */}
            {priceUSD !== undefined && (
              <p className="text-lg font-bold text-primary">
                {priceUSD === 0 ? 'Gratis' : `USD ${priceUSD}`}
              </p>
            )}
          </div>

          {/* CTA Button (if provided) */}
          {cta && (
            <Button asChild className="mt-4 w-full">
              <Link href={cta.href ?? linkHref}>{cta.label}</Link>
            </Button>
          )}
        </div>
      </article>
  )

  // If CTA is provided, the card itself is not a link (button handles navigation)
  if (cta) {
    return <div className="group block h-full">{cardContent}</div>
  }

  // Otherwise, entire card is clickable
  return (
    <Link href={linkHref} className="group block h-full">
      {cardContent}
    </Link>
  )
}
