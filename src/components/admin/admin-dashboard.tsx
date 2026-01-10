'use client'

import {
  Users,
  GraduationCap,
  DollarSign,
  UserPlus,
  Laptop,
  MapPin,
} from 'lucide-react'
import type { DashboardMetrics } from '@/services/admin-service'
import { AdminMetricCard } from './admin-metric-card'
import { AdminMiniChart } from './admin-mini-chart'
import { ActivityFeed } from './activity-feed'
import { TopCoursesCard } from './top-courses-card'

export interface AdminDashboardProps {
  metrics: DashboardMetrics
  onViewCourse?: (id: string) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function AdminDashboard({ metrics, onViewCourse }: AdminDashboardProps) {
  const { totals, charts, recentActivity, topCourses } = metrics

  const revenueGrowth =
    totals.revenue.lastMonth > 0
      ? Math.round(
          ((totals.revenue.thisMonth - totals.revenue.lastMonth) /
            totals.revenue.lastMonth) *
            100
        )
      : totals.revenue.thisMonth > 0
        ? 100
        : 0

  const enrollmentGrowth =
    totals.enrollments.lastMonth > 0
      ? Math.round(
          ((totals.enrollments.thisMonth - totals.enrollments.lastMonth) /
            totals.enrollments.lastMonth) *
            100
        )
      : totals.enrollments.thisMonth > 0
        ? 100
        : 0

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Resumen general de Tinta Academy
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdminMetricCard
          label="Ingresos del Mes"
          value={formatCurrency(totals.revenue.thisMonth)}
          icon={<DollarSign className="w-4 h-4" />}
          variant="primary"
          trend={{
            value: revenueGrowth,
            label: 'vs mes anterior',
          }}
        />
        <AdminMetricCard
          label="Inscripciones del Mes"
          value={totals.enrollments.thisMonth}
          icon={<UserPlus className="w-4 h-4" />}
          variant="success"
          trend={{
            value: enrollmentGrowth,
            label: 'vs mes anterior',
          }}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Usuarios"
          value={totals.users.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
          size="compact"
        />
        <AdminMetricCard
          label="Estudiantes"
          value={totals.students.toLocaleString()}
          icon={<GraduationCap className="w-4 h-4" />}
          size="compact"
        />
        <AdminMetricCard
          label="Cursos Online"
          value={totals.coursesOnline}
          icon={<Laptop className="w-4 h-4" />}
          size="compact"
        />
        <AdminMetricCard
          label="Cursos Presenciales"
          value={totals.coursesPresencial}
          icon={<MapPin className="w-4 h-4" />}
          size="compact"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <AdminMiniChart
          data={charts.revenue}
          label="Ingresos"
          color="success"
          prefix="$"
        />
        <AdminMiniChart
          data={charts.enrollments}
          label="Inscripciones"
          color="primary"
        />
        <AdminMiniChart
          data={charts.userGrowth}
          label="Usuarios"
          color="secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityFeed activities={recentActivity} maxItems={6} />
        <TopCoursesCard courses={topCourses} onViewCourse={onViewCourse} />
      </div>
    </div>
  )
}
