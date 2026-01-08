'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, UserCheck, Clock, UserX, Search, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toLocalDate } from '@/lib/utils'
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

function formatDate(date: Date | null): string {
  if (!date) return ''
  try {
    return format(toLocalDate(date), 'd MMM yyyy', { locale: es })
  } catch {
    return ''
  }
}

function getStatusBadge(status: string): { label: string; className: string } {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
    confirmed: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600' },
  }
  return config[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || ''
  const last = lastName?.[0]?.toUpperCase() || ''
  return first + last || '??'
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
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredEnrollments.length} alumno{filteredEnrollments.length !== 1 ? 's' : ''}
      </p>

      {/* Student List */}
      {enrollments.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Aún no hay estudiantes inscritos
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cuando los estudiantes se inscriban en este curso, aparecerán aquí.
          </p>
        </div>
      ) : filteredEnrollments.length === 0 ? (
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
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Estudiante</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Fecha inscripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => {
                const student = enrollment.student
                const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Sin nombre'
                const initials = getInitials(student.firstName, student.lastName)
                const statusBadge = getStatusBadge(enrollment.status)

                return (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-verde-uva-100 flex items-center justify-center text-sm font-semibold text-verde-uva-700">
                          {initials}
                        </div>
                        <span className="font-medium">{fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.user.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(enrollment.enrolledAt)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${student.user.email}`}
                        className="p-2 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        title="Enviar email"
                      >
                        <Mail className="size-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
