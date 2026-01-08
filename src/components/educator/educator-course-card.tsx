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
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  _count: {
    enrollments: number
  }
}

interface EducatorCourseCardProps {
  course: CourseWithRelations
  onPublish?: (courseId: string) => Promise<void>
  onUnpublish?: (courseId: string) => Promise<void>
  onDelete?: (courseId: string) => void
}

// Same images as landing CourseCard
const courseImages: Record<string, string> = {
  'wset': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80',
  'taller': 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=600&q=80',
  'cata': 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80',
  'curso': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  announced: { label: 'Anunciado', variant: 'default' },
  enrolling: { label: 'Inscribiendo', variant: 'default' },
  available: { label: 'Disponible', variant: 'default' },
  finished: { label: 'Finalizado', variant: 'outline' },
}

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

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    wset: 'bg-primary text-primary-foreground',
    taller: 'bg-verde-uva-500 text-white',
    cata: 'bg-verde-uva-500 text-white',
    curso: 'bg-muted-foreground text-white',
  }
  return colors[type] || 'bg-muted-foreground text-white'
}

export function EducatorCourseCard({
  course,
  onPublish,
  onUnpublish,
  onDelete
}: EducatorCourseCardProps) {
  const statusInfo = statusConfig[course.status] || { label: course.status, variant: 'outline' as const }
  const isDraft = course.status === 'draft'
  const isFinished = course.status === 'finished'
  const imageUrl = course.imageUrl || courseImages[course.type] || courseImages['curso']

  return (
    <article className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border h-full flex flex-col">
      {/* Image - same style as landing */}
      <div className="relative h-48 shrink-0">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
        {/* Type badge - top left */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
            {getTypeLabel(course.type, course.wsetLevel)}
          </span>
        </div>
        {/* Location/modality badge - top right */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-background/95 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
            {course.modality === 'online' ? (
              <>
                <Monitor size={12} />
                Online
              </>
            ) : (
              <>
                <MapPin size={12} />
                {course.location || 'Presencial'}
              </>
            )}
          </span>
        </div>
        {/* Status badge - bottom left */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={statusInfo.variant}>
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <Link
          href={`/educator/courses/${course.id}/edit`}
          className="text-lg font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors block"
        >
          {course.title}
        </Link>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {course.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 bg-verde-uva-500 text-white text-xs rounded-full font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

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
              Sin fecha
            </span>
          )}
          {course.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock size={14} className="text-primary" />
              {course.duration}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Users size={14} className="text-primary" />
            {course.enrolledCount}{course.maxCapacity ? ` / ${course.maxCapacity}` : ''} inscritos
          </span>
        </div>

        {/* Footer - pushed to bottom */}
        <div className="border-t border-border pt-4 mt-auto">
          <div className="flex items-center justify-between gap-2">
            {/* Edit button */}
            <Button variant="outline" asChild className="flex-1">
              <Link href={`/educator/courses/${course.id}/edit`}>
                <Pencil size={14} className="mr-2" />
                Editar
              </Link>
            </Button>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical size={16} />
                  <span className="sr-only">Más acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/educator/courses/${course.id}/students`}>
                    <Users className="h-4 w-4 mr-2" />
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
    </article>
  )
}
