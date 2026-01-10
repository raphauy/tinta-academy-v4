'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  MapPin,
  Monitor,
  Users,
  Wallet,
  Calendar,
  GraduationCap,
  ExternalLink,
  Loader2,
  Mail,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { toLocalDate } from '@/lib/utils'
import { getCourseEnrollmentsAction, deleteCourseAsAdminAction } from '@/app/admin/courses/actions'
import type { AdminCourse, CourseEnrollmentWithDetails } from '@/services/course-service'

interface AdminCourseCardProps {
  course: AdminCourse
  onEducatorClick?: (educatorId: string) => void
}

const DEFAULT_COURSE_IMAGE = '/placeholder-course.jpg'

function formatDate(date: Date | null): string {
  if (!date) return ''
  try {
    return format(toLocalDate(date), 'd MMM. yyyy', { locale: es })
  } catch {
    return ''
  }
}

function formatCurrencyAmount(amount: number, currency: 'USD' | 'UYU'): string {
  // Format number with thousands separator, no currency symbol
  const formatted = new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return `${currency} ${formatted}`
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

function getStatusBadge(status: string): { label: string; className: string } {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: 'Borrador', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    announced: { label: 'Anunciado', className: 'bg-purple-100 text-purple-800 border-purple-200' },
    enrolling: { label: 'Inscribiendo', className: 'bg-green-100 text-green-800 border-green-200' },
    full: { label: 'Completo', className: 'bg-amber-100 text-amber-800 border-amber-200' },
    in_progress: { label: 'En curso', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    available: { label: 'Disponible', className: 'bg-green-100 text-green-800 border-green-200' },
    finished: { label: 'Finalizado', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  }
  return config[status] || { label: status, className: 'bg-gray-100 text-gray-600 border-gray-200' }
}

function getInitials(firstName: string | null, lastName: string | null, name: string | null): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  return '??'
}

function getStudentName(enrollment: CourseEnrollmentWithDetails): string {
  const { student } = enrollment
  if (student.firstName && student.lastName) {
    return `${student.firstName} ${student.lastName}`
  }
  return student.user.name || student.user.email
}

export function AdminCourseCard({ course, onEducatorClick }: AdminCourseCardProps) {
  const [studentsModalOpen, setStudentsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [enrollments, setEnrollments] = useState<CourseEnrollmentWithDetails[]>([])
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const imageUrl = course.imageUrl || DEFAULT_COURSE_IMAGE
  const statusBadge = getStatusBadge(course.status)
  const hasEnrollments = course.enrolledCount > 0
  const capacityPercent = course.maxCapacity
    ? Math.round((course.enrolledCount / course.maxCapacity) * 100)
    : null

  const publicUrl = `/cursos/${course.slug}`

  const handleViewStudents = () => {
    setStudentsModalOpen(true)
    startTransition(async () => {
      const result = await getCourseEnrollmentsAction(course.id)
      if (result.success) {
        setEnrollments(result.data)
      }
    })
  }

  const handleViewDetails = () => {
    window.open(publicUrl, '_blank')
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteCourseAsAdminAction(course.id)
      if (result.success) {
        toast.success('Curso eliminado', {
          description: 'El curso ha sido eliminado correctamente.',
        })
        setDeleteDialogOpen(false)
      } else {
        toast.error('Error al eliminar', {
          description: result.error,
        })
      }
    })
  }

  return (
    <>
      <div className="bg-card rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Image - square, full height */}
          <Button
            variant="ghost"
            onClick={handleViewDetails}
            className="shrink-0 relative w-full sm:w-36 h-44 sm:h-auto sm:aspect-square rounded-xl overflow-hidden bg-muted hover:opacity-90 transition-opacity cursor-pointer self-stretch p-0"
          >
            <Image
              src={imageUrl}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, 144px"
              className="object-cover"
            />
          </Button>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Top row: Left content + Right info boxes */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Left: badges, title, educator, tags */}
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Type badge */}
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
                    {getTypeLabel(course.type, course.wsetLevel).toUpperCase()}
                  </span>

                  {/* Modality badge */}
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
                <Button
                  variant="link"
                  onClick={handleViewDetails}
                  className="h-auto p-0 font-semibold text-foreground mb-1 line-clamp-1 hover:text-primary transition-colors block text-left cursor-pointer justify-start"
                >
                  {course.title}
                </Button>

                {/* Educator */}
                <p className="text-sm text-muted-foreground mb-2">
                  por{' '}
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm font-medium"
                    onClick={() => onEducatorClick?.(course.educator.id)}
                  >
                    {course.educator.name}
                  </Button>
                </p>

                {/* Tags */}
                {course.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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
              </div>

              {/* Right: Info boxes side by side (square) */}
              <div className="shrink-0 flex gap-2">
                {/* Capacity box */}
                <div className="flex flex-col items-center justify-center w-28 h-28 rounded-lg bg-muted/50 border border-border">
                  <Users className="w-4 h-4 text-muted-foreground mb-1" />
                  <p className="text-base font-semibold text-foreground leading-tight">
                    {course.enrolledCount}
                    {course.maxCapacity && (
                      <span className="text-xs text-muted-foreground">/{course.maxCapacity}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Inscritos</p>
                </div>

                {/* Revenue USD box */}
                <div className="flex flex-col items-center justify-center w-28 h-28 rounded-lg bg-muted/50 border border-border px-1">
                  <Wallet className="w-4 h-4 text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold text-foreground leading-tight text-center break-word">
                    {formatCurrencyAmount(course.totalRevenueUSD, 'USD')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ingresos</p>
                </div>

                {/* Revenue UYU box */}
                <div className="flex flex-col items-center justify-center w-28 h-28 rounded-lg bg-muted/50 border border-border px-1">
                  <Wallet className="w-4 h-4 text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold text-foreground leading-tight text-center break-word">
                    {formatCurrencyAmount(course.totalRevenueUYU, 'UYU')}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ingresos</p>
                </div>
              </div>
            </div>

            {/* Bottom row: Progress bar + Actions */}
            <div className="flex items-end gap-4 mt-auto pt-3">
              {/* Left: Progress bar or date */}
              <div className="flex-1">
                {capacityPercent !== null ? (
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        Capacidad: {course.enrolledCount}/{course.maxCapacity}
                      </span>
                      <span
                        className={`font-medium ${
                          capacityPercent >= 90
                            ? 'text-red-600 dark:text-red-400'
                            : capacityPercent >= 70
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-primary'
                        }`}
                      >
                        {capacityPercent}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          capacityPercent >= 90
                            ? 'bg-red-500'
                            : capacityPercent >= 70
                              ? 'bg-amber-500'
                              : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : course.startDate ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    {formatDate(course.startDate)}
                  </div>
                ) : null}
              </div>

              {/* Right: Actions */}
              <div className="shrink-0 flex gap-2">
                {/* Delete button - only show if no enrollments */}
                {!hasEnrollments && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewStudents}
                  disabled={!hasEnrollments}
                  className="gap-2"
                >
                  <GraduationCap className="size-4" />
                  <span className="hidden sm:inline">Ver estudiantes</span>
                  <span className="sm:hidden">{course.enrolledCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewDetails}
                  className="gap-1 text-primary hover:text-primary"
                >
                  Ver curso
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students Modal */}
      <Dialog open={studentsModalOpen} onOpenChange={setStudentsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Estudiantes de {course.title}
            </DialogTitle>
          </DialogHeader>

          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hay estudiantes inscritos
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(
                          enrollment.student.firstName,
                          enrollment.student.lastName,
                          enrollment.student.user.name
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {getStudentName(enrollment)}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                        <Mail className="size-3" />
                        {enrollment.student.user.email}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        Inscrito el
                      </p>
                      <p className="text-sm font-medium">
                        {format(new Date(enrollment.enrolledAt), 'd MMM yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {enrollments.length} estudiante{enrollments.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" onClick={() => setStudentsModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El curso &quot;{course.title}&quot; será eliminado
              permanentemente junto con todo su contenido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
