'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Download,
  GraduationCap,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MetricCard } from '@/components/educator/metric-card'
import { CourseCard } from '@/components/course'
import type { StudentDashboardMetrics, StudentCourseQuickAccess } from '@/services/student-service'
import type { DiplomaIssueForStudent } from '@/services/diploma-service'

interface StudentDashboardProps {
  studentName: string
  metrics: StudentDashboardMetrics
  diplomaIssues: DiplomaIssueForStudent[]
  viewAs?: string
}

function getStatusBadge(course: StudentCourseQuickAccess) {
  const now = new Date()
  const displayDate = course.effectiveDate ?? course.startDate

  if (course.status === 'finished') {
    return { label: 'Completado', variant: 'success' as const }
  }

  if (displayDate && new Date(displayDate) > now) {
    return { label: 'Próximamente', variant: 'info' as const }
  }

  if (course.status === 'in_progress') {
    return { label: 'En curso', variant: 'warning' as const }
  }

  return undefined
}

export function StudentDashboard({
  studentName,
  metrics,
  diplomaIssues,
  viewAs,
}: StudentDashboardProps) {
  const hasAnyCourses = metrics.totalCourses > 0
  const firstName = studentName.split(' ')[0]

  // Helper to build URLs with viewAs preserved
  const buildUrl = (path: string) => viewAs ? `${path}?viewAs=${viewAs}` : path

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
            Hola, {firstName}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {hasAnyCourses
              ? 'Aquí tienes un resumen de tus cursos'
              : 'Comienza tu viaje en el mundo del vino'}
          </p>
        </div>
        <Button asChild>
          <Link href="/#catalog">
            <Search className="w-4 h-4 mr-2" />
            Explorar Cursos
          </Link>
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Cursos Inscritos"
          value={metrics.totalCourses}
          icon={<BookOpen className="w-4 h-4" />}
          variant="highlight"
        />
        <MetricCard
          label="En Curso"
          value={metrics.inProgressCourses}
          icon={<GraduationCap className="w-4 h-4" />}
        />
        <MetricCard
          label="Completados"
          value={metrics.completedCourses}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <MetricCard
          label="Próximos"
          value={metrics.upcomingCoursesCount}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Courses Section */}
      {hasAnyCourses ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Tus Cursos Recientes
            </h2>
            <Link
              href={buildUrl('/student/courses')}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {metrics.recentCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.recentCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    slug: course.slug,
                    title: course.title,
                    type: course.type,
                    modality: course.modality,
                    status: course.status,
                    imageUrl: course.imageUrl,
                    location: course.location,
                    description: course.description,
                    duration: course.duration,
                    wsetLevel: course.wsetLevel,
                    displayDate: course.effectiveDate ?? course.startDate,
                    educator: course.educator,
                    tags: course.tags,
                  }}
                  href={course.modality === 'online' ? buildUrl(`/learn/${course.slug}`) : buildUrl(`/student/courses/${course.id}`)}
                  statusBadge={getStatusBadge(course)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-500 dark:text-stone-400">
              No tienes cursos recientes.
            </p>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-4">
            <GraduationCap className="w-7 h-7 text-[#143F3B] dark:text-[#6B9B7A]" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Aún no estás inscrito en ningún curso
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
            Explora nuestro catálogo de cursos de vino y comienza tu formación con los mejores educadores.
          </p>
          <Button asChild size="lg">
            <Link href="/#catalog">
              <Search className="w-4 h-4 mr-2" />
              Explorar Cursos
            </Link>
          </Button>
        </div>
      )}

      {/* Mis diplomas */}
      {diplomaIssues.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Mis diplomas
          </h2>
          <div className="flex flex-col gap-4">
            {diplomaIssues.map((issue) => (
              <Card key={issue.id} className="overflow-hidden">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <Link
                    href={buildUrl(`/student/courses/${issue.courseId}`)}
                    className="block shrink-0 cursor-pointer"
                  >
                    <div className="aspect-[1.414/1] w-full overflow-hidden rounded-md border bg-muted sm:w-48">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={issue.pngUrl}
                        alt={`Diploma de ${issue.courseTitle}`}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col gap-2 min-w-0">
                    <div>
                      <Link
                        href={buildUrl(`/student/courses/${issue.courseId}`)}
                        className="text-base font-semibold text-stone-900 dark:text-stone-100 hover:underline"
                      >
                        {issue.courseTitle}
                      </Link>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        Diploma emitido el{' '}
                        {format(
                          issue.issuedDate,
                          "d 'de' MMMM 'de' yyyy",
                          { locale: es }
                        )}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        <a
                          href={issue.pngUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Descargar PNG
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="cursor-pointer"
                      >
                        <a
                          href={issue.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" />
                          Descargar PDF
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="cursor-pointer"
                      >
                        <Link href={buildUrl(`/student/courses/${issue.courseId}`)}>
                          Ver detalle del curso
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Courses Section - only show if different from recent */}
      {metrics.upcomingCourses.length > 0 && metrics.upcomingCourses[0]?.id !== metrics.recentCourses[0]?.id && (
        <div>
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-4">
            Próximos Cursos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.upcomingCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id,
                  slug: course.slug,
                  title: course.title,
                  type: course.type,
                  modality: course.modality,
                  status: course.status,
                  imageUrl: course.imageUrl,
                  location: course.location,
                  description: course.description,
                  duration: course.duration,
                  wsetLevel: course.wsetLevel,
                  displayDate: course.effectiveDate ?? course.startDate,
                  educator: course.educator,
                  tags: course.tags,
                }}
                href={buildUrl(`/student/courses/${course.id}`)}
                statusBadge={{ label: 'Próximamente', variant: 'info' }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
