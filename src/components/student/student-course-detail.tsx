'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Monitor,
  FileText,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Link2,
  File,
  User,
  Users,
  GraduationCap,
  FolderOpen,
  BookOpen
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toLocalDate } from '@/lib/utils'
import type { getStudentEnrollmentByCourse } from '@/services/enrollment-service'
import type { MaterialType } from '@prisma/client'

type EnrollmentWithCourse = NonNullable<Awaited<ReturnType<typeof getStudentEnrollmentByCourse>>>

interface StudentCourseDetailProps {
  enrollment: EnrollmentWithCourse
  viewAs?: string
}

// Default placeholder image (same as landing)
const DEFAULT_COURSE_IMAGE = '/placeholder-course.jpg'

function formatDate(date: Date | null): string {
  if (!date) return ''
  try {
    return format(toLocalDate(date), "EEEE d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return ''
  }
}

function formatShortDate(date: Date | null): string {
  if (!date) return ''
  try {
    return format(toLocalDate(date), "d 'de' MMM. yyyy", { locale: es })
  } catch {
    return ''
  }
}

function formatClassDate(date: Date): string {
  return format(toLocalDate(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
}

function getEndTime(startTime: string | null, durationMinutes: number | null): string {
  if (!startTime || !durationMinutes) return ''
  try {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + durationMinutes
    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  } catch {
    return ''
  }
}

function getTypeLabel(type: string, wsetLevel?: number | null): string {
  if (type === 'wset' && wsetLevel) {
    return `WSET Nivel ${wsetLevel}`
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

function buildGoogleMapsUrl(address: string, location?: string | null): string {
  const query = encodeURIComponent(location ? `${location}, ${address}` : address)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

export function StudentCourseDetail({ enrollment, viewAs }: StudentCourseDetailProps) {
  const course = enrollment.course
  const educator = course.educator
  const materials = course.materials || []
  const imageUrl = course.imageUrl || DEFAULT_COURSE_IMAGE
  const statusBadge = getStatusBadge(course)

  const backUrl = viewAs ? `/student/courses?viewAs=${viewAs}` : '/student/courses'

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 -ml-2">
        <Link href={backUrl}>
          <ArrowLeft className="size-4" />
          Volver a Mis Cursos
        </Link>
      </Button>

      {/* Header with image */}
      <div className="relative rounded-2xl overflow-hidden bg-muted h-48 sm:h-64">
        <Image
          src={imageUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Type badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
              {getTypeLabel(course.type, course.wsetLevel).toUpperCase()}
            </span>
            {/* Status badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {/* Modality badge */}
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 rounded-full text-xs font-medium text-stone-700">
              {course.modality === 'online' ? (
                <>
                  <Monitor size={12} />
                  Online
                </>
              ) : (
                <>
                  <MapPin size={12} />
                  Presencial
                </>
              )}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{course.title}</h1>
        </div>
      </div>

      {/* Tags */}
      {course.tags && course.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="bg-verde-uva-100 text-verde-uva-800 border-verde-uva-200"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Educator info card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4 text-primary" />
            Educador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {educator.imageUrl ? (
              <Image
                src={educator.imageUrl}
                alt={educator.name}
                width={56}
                height={56}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="size-14 rounded-full bg-verde-uva-100 flex items-center justify-center">
                <User className="size-6 text-verde-uva-600" />
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{educator.name}</p>
              {educator.title && (
                <p className="text-sm text-muted-foreground">{educator.title}</p>
              )}
            </div>
          </div>
          {educator.bio && (
            <p className="mt-4 text-sm text-muted-foreground">{educator.bio}</p>
          )}
        </CardContent>
      </Card>

      {/* Class dates card */}
      {course.classDates && course.classDates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              Fechas del Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {course.classDates.map((date, index) => {
              const endTime = getEndTime(course.startTime, course.classDuration)
              return (
                <div key={index} className="flex items-start gap-3">
                  <BookOpen className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="font-medium">Clase {index + 1}:</span>{' '}
                    <span className="capitalize">
                      {formatClassDate(new Date(date))}
                    </span>
                    {course.startTime && endTime && (
                      <span className="text-muted-foreground">
                        {' '}- {course.startTime} a {endTime} hs
                      </span>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Exam date for WSET */}
            {course.type === 'wset' && course.examDate && (
              <div className="flex items-start gap-3 pt-2 border-t">
                <GraduationCap className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-medium">Examen:</span>{' '}
                  <span className="capitalize">
                    {formatClassDate(new Date(course.examDate))}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event details card (for presencial) */}
      {course.modality === 'presencial' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-primary" />
              Detalles del Evento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location */}
            {(course.location || course.address) && (
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {course.location && (
                    <p className="font-medium text-foreground">{course.location}</p>
                  )}
                  {course.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">{course.address}</p>
                      <a
                        href={buildGoogleMapsUrl(course.address, course.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        Ver en Google Maps
                        <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            {(course.startDate || course.endDate) && (
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  {course.startDate && (
                    <p className="font-medium text-foreground">
                      {formatDate(course.startDate)}
                    </p>
                  )}
                  {course.endDate && course.startDate !== course.endDate && (
                    <p className="text-sm text-muted-foreground">
                      hasta {formatShortDate(course.endDate)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Duration */}
            {course.duration && (
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-muted-foreground" />
                <p className="text-foreground">{course.duration}</p>
              </div>
            )}

            {/* Capacity */}
            {course.maxCapacity && (
              <div className="flex items-center gap-3">
                <Users className="size-5 text-muted-foreground" />
                <p className="text-foreground">
                  Máximo {course.maxCapacity} {course.maxCapacity === 1 ? 'persona' : 'personas'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* WSET Exam info (if applicable) */}
      {course.type === 'wset' && course.wsetLevel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="size-4 text-primary" />
              Certificación WSET
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Este curso prepara para la certificación WSET Nivel {course.wsetLevel} en Vinos.
            </p>
            <p className="text-sm text-muted-foreground">
              Al finalizar el curso, recibirás información sobre el examen de certificación.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Materials section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="size-4 text-primary" />
            Materiales del Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {materials.length > 0 ? (
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
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors group"
                    >
                      <div className="shrink-0 size-10 rounded-lg bg-verde-uva-100 text-verde-uva-700 flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {material.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getMaterialTypeLabel(material.type)}
                          {material.description && ` · ${material.description}`}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0 gap-2 min-h-[44px] min-w-[44px]">
                        {isExternal ? (
                          <>
                            <span className="hidden sm:inline">Abrir</span>
                            <ExternalLink className="size-4" />
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Descargar</span>
                            <Download className="size-4" />
                          </>
                        )}
                      </Button>
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-3">
                <FolderOpen className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No hay materiales disponibles para este curso aún.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
