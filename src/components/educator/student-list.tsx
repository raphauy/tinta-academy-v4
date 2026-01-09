'use client'

import { useState, useMemo } from 'react'
import { Users, UserCheck, Clock, UserX, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { StudentTable, type StudentEnrollment } from './student-table'
import type { Course, Educator, EnrollmentStatus } from '@prisma/client'

// Type matching what getEnrollmentsByCourse returns
type EnrollmentWithStudent = {
  id: string
  studentId: string
  courseId: string
  enrolledAt: Date
  status: EnrollmentStatus
  createdAt: Date
  updatedAt: Date
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    user: {
      email: string
      name: string | null
      image: string | null
    }
  }
}

type CourseWithRelations = Course & {
  educator: Educator
}

interface StudentListProps {
  course: CourseWithRelations
  enrollments: EnrollmentWithStudent[]
}

interface MetricCardProps {
  icon: React.ReactNode
  value: number
  label: string
  iconBgClass?: string
}

function MetricCard({ icon, value, label, iconBgClass = 'bg-muted' }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`p-3 rounded-xl ${iconBgClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudentList({ course, enrollments }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate metrics
  const metrics = useMemo(() => {
    const confirmed = enrollments.filter(e => e.status === 'confirmed').length
    const pending = enrollments.filter(e => e.status === 'pending').length
    const cancelled = enrollments.filter(e => e.status === 'cancelled').length
    return { total: enrollments.length, confirmed, pending, cancelled }
  }, [enrollments])

  // Filter enrollments by search
  const filteredEnrollments = useMemo(() => {
    if (!searchQuery) return enrollments

    const query = searchQuery.toLowerCase()
    return enrollments.filter(enrollment => {
      const fullName = `${enrollment.student.firstName || ''} ${enrollment.student.lastName || ''}`.toLowerCase()
      const email = enrollment.student.user.email?.toLowerCase() || ''
      return fullName.includes(query) || email.includes(query)
    })
  }, [enrollments, searchQuery])

  // Convert to StudentEnrollment type for the table
  const tableEnrollments: StudentEnrollment[] = filteredEnrollments.map(e => ({
    id: e.id,
    enrolledAt: e.enrolledAt,
    status: e.status,
    student: e.student,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Alumnos de {course.title}
        </h1>
        <p className="text-muted-foreground">
          Gestiona los alumnos inscritos en este curso
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users className="size-5 text-primary" />}
          value={metrics.total}
          label="Total inscritos"
          iconBgClass="bg-verde-uva-100"
        />
        <MetricCard
          icon={<UserCheck className="size-5 text-green-600" />}
          value={metrics.confirmed}
          label="Confirmados"
          iconBgClass="bg-green-100"
        />
        <MetricCard
          icon={<Clock className="size-5 text-amber-600" />}
          value={metrics.pending}
          label="Pendientes"
          iconBgClass="bg-amber-100"
        />
        <MetricCard
          icon={<UserX className="size-5 text-gray-500" />}
          value={metrics.cancelled}
          label="Cancelados"
          iconBgClass="bg-gray-100"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background"
        />
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredEnrollments.length} alumno{filteredEnrollments.length !== 1 ? 's' : ''}
      </p>

      {/* Student Table */}
      {filteredEnrollments.length === 0 && searchQuery ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No se encontraron estudiantes
          </h3>
          <p className="text-muted-foreground">
            No hay estudiantes que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <StudentTable enrollments={tableEnrollments} />
      )}
    </div>
  )
}
