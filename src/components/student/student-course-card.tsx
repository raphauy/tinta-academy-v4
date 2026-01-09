'use client'

import { useState } from 'react'
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
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Link2,
  File
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toLocalDate } from '@/lib/utils'
import type { getStudentEnrollments } from '@/services/enrollment-service'
import type { MaterialType } from '@prisma/client'

type EnrollmentWithCourse = Awaited<ReturnType<typeof getStudentEnrollments>>[number]

interface StudentCourseCardProps {
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

// Get icon component for material type
function getMaterialIcon(type: MaterialType) {
  const icons: Record<MaterialType, typeof FileText> = {
    document: FileText,
    image: ImageIcon,
    video: Video,
    link: Link2,
    other: File,
  }
  return icons[type] || File
}

// Get label for material type
function getMaterialTypeLabel(type: MaterialType): string {
  const labels: Record<MaterialType, string> = {
    document: 'Documento',
    image: 'Imagen',
    video: 'Video',
    link: 'Enlace',
    other: 'Archivo',
  }
  return labels[type] || 'Archivo'
}

export function StudentCourseCard({ enrollment, viewAs }: StudentCourseCardProps) {
  const [showMaterials, setShowMaterials] = useState(false)
  const course = enrollment.course
  const imageUrl = course.imageUrl || courseImages[course.type] || courseImages['curso']
  const statusBadge = getStatusBadge(course)
  const materials = course.materials || []
  const materialsCount = materials.length

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
                <button
                  onClick={() => setShowMaterials(!showMaterials)}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <FileText size={14} />
                  {materialsCount} {materialsCount === 1 ? 'material' : 'materiales'}
                  {showMaterials ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
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

      {/* Collapsible Materials Section */}
      {materialsCount > 0 && showMaterials && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-3">Materiales del curso</h4>
          <ul className="space-y-2">
            {materials.map((material) => {
              const Icon = getMaterialIcon(material.type)
              const isExternal = material.type === 'link' || material.type === 'video'

              return (
                <li key={material.id}>
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="shrink-0 size-8 rounded-lg bg-verde-uva-100 text-verde-uva-700 flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {material.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getMaterialTypeLabel(material.type)}
                        {material.description && ` · ${material.description}`}
                      </p>
                    </div>
                    <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                      {isExternal ? <ExternalLink size={16} /> : <Download size={16} />}
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
