'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { BookOpen, Users, Calendar, Plus, List, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { EducatorDashboardMetrics } from '@/services/educator-service'
import { toLocalDate } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
}

function MetricCard({ title, value, icon, description }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface EducatorDashboardProps {
  educatorName: string
  metrics: EducatorDashboardMetrics
}

export function EducatorDashboard({ educatorName, metrics }: EducatorDashboardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return 'Sin fecha'
    try {
      return format(toLocalDate(date), 'd MMM. yyyy', { locale: es })
    } catch {
      return 'Sin fecha'
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {educatorName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de tu actividad como educador.
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Cursos"
          value={metrics.totalCourses}
          icon={<BookOpen className="h-5 w-5" />}
          description="Cursos creados"
        />
        <MetricCard
          title="Cursos Publicados"
          value={metrics.publishedCourses}
          icon={<BookOpen className="h-5 w-5" />}
          description="Visibles al público"
        />
        <MetricCard
          title="Total Inscripciones"
          value={metrics.totalEnrollments}
          icon={<Users className="h-5 w-5" />}
          description="Estudiantes inscritos"
        />
        <MetricCard
          title="Próximos Cursos"
          value={metrics.upcomingCourses.length}
          icon={<Calendar className="h-5 w-5" />}
          description="Por comenzar"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/educator/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Curso
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/educator/courses">
            <List className="h-4 w-4 mr-2" />
            Ver Cursos
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/educator/students">
            <GraduationCap className="h-4 w-4 mr-2" />
            Ver Estudiantes
          </Link>
        </Button>
      </div>

      {/* Upcoming courses list */}
      {metrics.upcomingCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Próximos Cursos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.upcomingCourses.slice(0, 3).map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base line-clamp-1">
                    {course.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(course.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {course.enrolledCount}
                      {course.maxCapacity ? ` / ${course.maxCapacity}` : ''} inscritos
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-2" asChild>
                    <Link href={`/educator/courses/${course.id}/edit`}>
                      Ver detalles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {metrics.upcomingCourses.length > 3 && (
            <div className="mt-4 text-center">
              <Button variant="link" asChild>
                <Link href="/educator/courses?status=announced,enrolling">
                  Ver todos los próximos cursos
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty state for no courses */}
      {metrics.totalCourses === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Aún no has creado ningún curso
            </h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando tu primer curso para compartir tus conocimientos.
            </p>
            <Button asChild>
              <Link href="/educator/courses/create">
                <Plus className="h-4 w-4 mr-2" />
                Crear mi primer curso
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
