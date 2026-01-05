import { Users, BookOpen, TrendingUp, Award, Plus, ArrowRight } from 'lucide-react'
import type { EducatorDashboardProps } from '@/../product/sections/educator-panel/types'
import { MetricCard } from './MetricCard'
import { MiniChart } from './MiniChart'
import { CourseQuickCard } from './CourseQuickCard'

export function EducatorDashboard({
  educator,
  metrics,
  courses,
  onViewCourse,
  onCreateCourse
}: EducatorDashboardProps) {
  // Calculate growth percentage
  const studentGrowth = metrics.studentsLastMonth > 0
    ? Math.round(((metrics.studentsThisMonth - metrics.studentsLastMonth) / metrics.studentsLastMonth) * 100)
    : metrics.studentsThisMonth > 0 ? 100 : 0

  // Get recent/active courses for quick access (max 4)
  const quickAccessCourses = courses
    .filter(c => c.status !== 'finished')
    .slice(0, 4)

  return (
    <div className="p-6 pb-8 max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
              Hola, {educator.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Aquí tienes un resumen de tu actividad como educador
            </p>
          </div>
          <button
            onClick={onCreateCourse}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Curso</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid - 4 columns on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Total Alumnos"
          value={metrics.totalStudents}
          icon={<Users className="w-4 h-4" />}
          variant="highlight"
          trend={{
            value: studentGrowth,
            label: 'vs mes anterior'
          }}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
        <MiniChart
          data={metrics.chartData.students}
          label="Crecimiento de Alumnos"
          color="primary"
        />
        <MiniChart
          data={metrics.chartData.progress}
          label="Progreso Promedio"
          color="secondary"
          suffix="%"
        />
      </div>

      {/* Quick Access Courses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Tus Cursos
          </h2>
          <button
            onClick={() => onViewCourse?.('all')}
            className="inline-flex items-center gap-1 text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
          >
            Ver todos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quickAccessCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {quickAccessCourses.map((course) => (
              <CourseQuickCard
                key={course.id}
                course={course}
                onView={() => onViewCourse?.(course.id)}
                onEdit={() => onViewCourse?.(course.id)}
              />
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
              Comienza a compartir tu conocimiento creando un curso online o presencial.
            </p>
            <button
              onClick={onCreateCourse}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Curso</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
