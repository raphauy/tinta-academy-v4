'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Monitor,
  MoreVertical,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  GraduationCap,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toLocalDate } from '@/lib/utils'
import type { Course, Educator, Tag } from '@prisma/client'

type CourseWithRelations = Course & {
  educator: Educator
  tags: Tag[]
  totalRevenueUSD: number
  totalRevenueUYU: number
  _count: {
    enrollments: number
  }
}

interface EducatorCourseRowProps {
  course: CourseWithRelations
  onPublish?: (courseId: string) => Promise<void>
  onUnpublish?: (courseId: string) => Promise<void>
  onDelete?: (courseId: string) => void
}

// Default placeholder image (same as landing)
const DEFAULT_COURSE_IMAGE = '/placeholder-course.jpg'

function formatDate(date: Date | null): string {
  if (!date) return ''
  try {
    return format(toLocalDate(date), 'd MMM. yyyy', { locale: es })
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

function getStatusBadge(status: string): { label: string; className: string } {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Borrador', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    announced: { label: 'Publicado', className: 'bg-green-100 text-green-800 border-green-200' },
    enrolling: { label: 'Inscribiendo', className: 'bg-green-100 text-green-800 border-green-200' },
    available: { label: 'Disponible', className: 'bg-green-100 text-green-800 border-green-200' },
    finished: { label: 'Finalizado', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  return config[status] || { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCurrencyAmount(amount: number, currency: 'USD' | 'UYU'): string {
  return `${currency} ${formatNumber(amount)}`
}

function formatRevenue(usd: number, uyu: number): string {
  const parts: string[] = []
  if (usd > 0) parts.push(`USD ${formatNumber(usd)}`)
  if (uyu > 0) parts.push(`UYU ${formatNumber(uyu)}`)
  return parts.length > 0 ? parts.join(' / ') : ''
}

export function EducatorCourseRow({
  course,
  onPublish,
  onUnpublish,
  onDelete
}: EducatorCourseRowProps) {
  const isDraft = course.status === 'draft'
  const isFinished = course.status === 'finished'
  const imageUrl = course.imageUrl || DEFAULT_COURSE_IMAGE
  const statusBadge = getStatusBadge(course.status)

  const enrollmentText = course.maxCapacity
    ? `${course._count.enrollments}/${course.maxCapacity} inscritos`
    : `${course._count.enrollments} alumnos`

  return (
    <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image - clickable to edit */}
        <Link
          href={`/educator/courses/${course.id}/edit`}
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
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Type badge - same style as landing */}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
                {getTypeLabel(course.type, course.wsetLevel).toUpperCase()}
              </span>

              {/* Modality badge - same style as landing */}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-background border border-border rounded-full text-xs font-medium text-foreground">
                {course.modality === 'online' ? (
                  <>
                    <Monitor size={12} className="text-primary" />
                    Online
                  </>
                ) : (
                  <>
                    <MapPin size={12} className="text-primary" />
                    Presencial
                  </>
                )}
              </span>

              {/* Status badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* Title */}
            <Link
              href={`/educator/courses/${course.id}/edit`}
              className="font-semibold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors block"
            >
              {course.title}
            </Link>

            {/* Description - always takes space even if empty */}
            <p className="text-sm text-muted-foreground line-clamp-1 min-h-[1.25rem]">
              {course.description || '\u00A0'}
            </p>
          </div>

          {/* Meta row - always at bottom */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-auto pt-2">
            <span className="inline-flex items-center gap-1">
              <Users size={14} />
              {enrollmentText}
            </span>

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

            {course.priceUSD > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                USD {formatNumber(course.priceUSD)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                Gratis
              </span>
            )}
          </div>
        </div>

        {/* Right side: Revenue + Actions */}
        <div className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-end sm:justify-between gap-2">
          {/* Revenue - at top on desktop */}
          {formatRevenue(course.totalRevenueUSD, course.totalRevenueUYU) && (
            <span className="text-lg font-bold text-primary order-1 sm:order-none">
              {formatRevenue(course.totalRevenueUSD, course.totalRevenueUYU)}
            </span>
          )}

          {/* Action buttons - always at bottom */}
          <div className="flex items-center gap-2 order-2 sm:order-none sm:mt-auto">
            {/* Ver estudiantes button */}
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href={`/educator/courses/${course.id}/students`}>
                <GraduationCap className="size-4" />
                <span className="hidden sm:inline">{course._count.enrollments} Estudiantes</span>
                <span className="sm:hidden">{course._count.enrollments}</span>
              </Link>
            </Button>

            {/* Actions dropdown */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
                <span className="sr-only">Más acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/educator/courses/${course.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href={`/educator/courses/${course.id}/students`}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Ver estudiantes
                </Link>
              </DropdownMenuItem>

              {isDraft && onPublish && (
                <DropdownMenuItem onClick={() => onPublish(course.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Publicar
                </DropdownMenuItem>
              )}

              {!isDraft && !isFinished && onUnpublish && (
                <DropdownMenuItem onClick={() => onUnpublish(course.id)}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Despublicar
                </DropdownMenuItem>
              )}

              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(course.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}
