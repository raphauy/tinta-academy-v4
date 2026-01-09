'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  FileText,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toLocalDate } from '@/lib/utils'
import type { getStudentEnrollments } from '@/services/enrollment-service'

type EnrollmentWithCourse = Awaited<ReturnType<typeof getStudentEnrollments>>[number]

interface StudentCourseRowProps {
  enrollment: EnrollmentWithCourse
  viewAs?: string
}

// Same images as landing CourseCard
const courseImages: Record<string, string> = {
  wset: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80',
  taller: 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=600&q=80',
  cata: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80',
  curso: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  try {
    return format(toLocalDate(date), "d 'de' MMM. yyyy", { locale: es })
  } catch {
    return ''
  }
}

function getTypeLabel(type: string, wsetLevel?: number | null): string {
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

// Same colors as landing CourseCard
function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    wset: 'bg-primary text-primary-foreground',
    taller: 'bg-verde-uva-500 text-white',
    cata: 'bg-verde-uva-500 text-white',
    curso: 'bg-muted-foreground text-white',
  }
  return colors[type] || 'bg-muted-foreground text-white'
}

function getStatusBadge(course: EnrollmentWithCourse['course']): { label: string; className: string } {
  const now = new Date()
  const startDate = course.startDate

  if (course.status === 'finished') {
    return { label: 'Completado', className: 'bg-green-100 text-green-800 border-green-200' }
  }

  if (startDate && new Date(startDate) > now) {
    return { label: 'Próximamente', className: 'bg-blue-100 text-blue-800 border-blue-200' }
  }

  return { label: 'En curso', className: 'bg-amber-100 text-amber-800 border-amber-200' }
}

export function StudentCourseRow({ enrollment, viewAs }: StudentCourseRowProps) {
  const course = enrollment.course
  const imageUrl = course.imageUrl || courseImages[course.type] || courseImages['curso']
  const statusBadge = getStatusBadge(course)
  const materialsCount = course.materials?.length || 0

  // Build course detail URL with viewAs if present
  const courseDetailUrl = viewAs
    ? `/student/courses/${course.id}?viewAs=${viewAs}`
    : `/student/courses/${course.id}`

  return (
    <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image - clickable to course detail */}
        <Link
          href={courseDetailUrl}
          className="shrink-0 relative w-full sm:w-28 h-40 sm:h-28 rounded-xl overflow-hidden bg-muted hover:opacity-90 transition-opacity"
        >
          <Image
            src={imageUrl}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, 112px"
            className="object-cover"
          />
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top section: badges + title + description */}
          <div>
            {/* Badges row */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              {/* Left badges: Type + Status */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
                  {getTypeLabel(course.type, course.wsetLevel).toUpperCase()}
                </span>

                {/* Status badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Right badge: Modality/Location */}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-foreground">
                {course.modality === 'online' ? (
                  <>
                    <Monitor size={12} className="text-primary" />
                    Online
                  </>
                ) : (
                  <>
                    <MapPin size={12} className="text-primary" />
                    {course.location || 'Presencial'}
                  </>
                )}
              </span>
            </div>

            {/* Title */}
            <Link
              href={courseDetailUrl}
              className="font-semibold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors block"
            >
              {course.title}
            </Link>

            {/* Educator name */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {course.educator.name}
            </p>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {course.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 bg-verde-uva-100 text-verde-uva-800 rounded text-xs font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta row + Action button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-auto pt-2">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {course.startDate && (
                <span className="inline-flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(course.startDate)}
                </span>
              )}

              {course.duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} />
                  {course.duration}
                </span>
              )}

              {materialsCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <FileText size={14} />
                  {materialsCount} {materialsCount === 1 ? 'material' : 'materiales'}
                </span>
              )}
            </div>

            <Button asChild size="sm" className="gap-2">
              <Link href={courseDetailUrl}>
                Ver detalles
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
