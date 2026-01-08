'use client'

import Link from 'next/link'
import { Users, TrendingUp, BookOpen, Award, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { EducatorDashboardMetrics } from '@/services/educator-service'
import { MetricCard } from './metric-card'
import { MiniChart } from './mini-chart'
import { CourseQuickCard } from './course-quick-card'

interface EducatorDashboardProps {
  educatorName: string
  metrics: EducatorDashboardMetrics
}

export function EducatorDashboard({
  educatorName,
  metrics,
}: EducatorDashboardProps) {
  // Calculate growth percentage
  const studentGrowth =
    metrics.studentsLastMonth > 0
      ? Math.round(
          ((metrics.studentsThisMonth - metrics.studentsLastMonth) /
            metrics.studentsLastMonth) *
            100
        )
      : metrics.studentsThisMonth > 0
        ? 100
        : 0

  // Get recent/active courses for quick access (max 4)
  // Prioritize active courses, but show finished ones if no active courses exist
  const activeCourses = metrics.courses.filter((c) => c.status !== 'finished')
  const quickAccessCourses =
    activeCourses.length > 0
      ? activeCourses.slice(0, 4)
      : metrics.courses.slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
            Hola, {educatorName.split(' ')[0]}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Aquí tienes un resumen de tu actividad como educador
          </p>
        </div>
        <Button asChild>
          <Link href="/educator/courses/create">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Curso
          </Link>
        </Button>
      </div>

      {/* Metrics Grid - 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Total Alumnos"
          value={metrics.totalStudents}
          icon={<Users className="w-4 h-4" />}
          variant="highlight"
          trend={
            studentGrowth !== 0
              ? {
                  value: studentGrowth,
                  label: 'vs mes anterior',
                }
              : undefined
          }
        />
        <MetricCard
          label="Alumnos Activos"
          value={metrics.activeStudents}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <MetricCard
          label="Cursos Activos"
          value={`${metrics.activeCourses}/${metrics.totalCourses}`}
          icon={<BookOpen className="w-4 h-4" />}
        />
        <MetricCard
          label="Tasa de Finalización"
          value={`${metrics.completionRate}%`}
          icon={<Award className="w-4 h-4" />}
        />
      </div>

      {/* Charts Section */}
      {(metrics.chartData.students.length > 0 ||
        metrics.chartData.progress.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {metrics.chartData.students.length > 0 && (
            <MiniChart
              data={metrics.chartData.students}
              label="Crecimiento de Alumnos"
              color="primary"
            />
          )}
          {metrics.chartData.progress.length > 0 && (
            <MiniChart
              data={metrics.chartData.progress}
              label="Progreso Promedio"
              color="secondary"
              suffix="%"
            />
          )}
        </div>
      )}

      {/* Quick Access Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Tus Cursos{' '}
            <span className="text-stone-500 dark:text-stone-400 font-normal">
              ({metrics.totalCourses})
            </span>
          </h2>
          <Link
            href="/educator/courses"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {quickAccessCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {quickAccessCourses.map((course) => (
              <CourseQuickCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-stone-50 dark:bg-stone-900/50 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-3">
              <BookOpen className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
            </div>
            <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
              Crea tu primer curso
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-sm mx-auto">
              Comienza a compartir tu conocimiento creando un curso online o
              presencial.
            </p>
            <Button asChild>
              <Link href="/educator/courses/create">
                <Plus className="w-4 h-4 mr-2" />
                Crear Curso
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
