'use client'

import { useState, useMemo } from 'react'
import { Users, UserCheck, Clock, UserX, Search, Wallet, Download, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  courseSpentUSD: number
  courseSpentUYU: number
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    identityDocument: string | null
    dateOfBirth: Date | null
    phone: string | null
    address: string | null
    city: string | null
    country: string | null
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
  value: number | string
  label: string
  iconBgClass?: string
}

function MetricCard({ icon, value, label, iconBgClass = 'bg-muted' }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`p-3 rounded-xl ${iconBgClass} shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-lg md:text-xl font-bold text-foreground break-words leading-tight">{value}</p>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function StudentList({ course, enrollments }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  // Calculate metrics
  const metrics = useMemo(() => {
    const confirmed = enrollments.filter(e => e.status === 'confirmed').length
    const pending = enrollments.filter(e => e.status === 'pending').length
    const cancelled = enrollments.filter(e => e.status === 'cancelled').length
    
    // Calculate total spent for the course
    const totalSpentUSD = enrollments.reduce((sum, e) => sum + e.courseSpentUSD, 0)
    const totalSpentUYU = enrollments.reduce((sum, e) => sum + e.courseSpentUYU, 0)
    
    return { 
      total: enrollments.length, 
      confirmed, 
      pending, 
      cancelled,
      totalSpentUSD,
      totalSpentUYU,
    }
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
    student: {
      firstName: e.student.firstName,
      lastName: e.student.lastName,
      identityDocument: e.student.identityDocument,
      dateOfBirth: e.student.dateOfBirth,
      phone: e.student.phone,
      address: e.student.address,
      city: e.student.city,
      country: e.student.country,
      user: e.student.user,
    },
    courseSpentUSD: e.courseSpentUSD,
    courseSpentUYU: e.courseSpentUYU,
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
        <MetricCard
          icon={<Wallet className="size-5 text-blue-600" />}
          value={`USD ${formatNumber(metrics.totalSpentUSD)}`}
          label="Total gastado USD"
          iconBgClass="bg-blue-100"
        />
        <MetricCard
          icon={<Wallet className="size-5 text-blue-600" />}
          value={`UYU ${formatNumber(metrics.totalSpentUYU)}`}
          label="Total gastado UYU"
          iconBgClass="bg-blue-100"
        />
      </div>

      {/* Search + Export */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>
        <Button
          variant="outline"
          disabled={isExporting}
          onClick={async () => {
            setIsExporting(true)
            try {
              const res = await fetch(`/api/educator/students-export/${course.id}`)
              const blob = await res.blob()
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              const disposition = res.headers.get('Content-Disposition')
              const match = disposition?.match(/filename="(.+)"/)
              a.download = match?.[1] || 'alumnos.csv'
              a.click()
              URL.revokeObjectURL(url)
            } finally {
              setIsExporting(false)
            }
          }}
        >
          {isExporting ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <Download className="size-4 mr-2" />
          )}
          Exportar CSV
        </Button>
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
