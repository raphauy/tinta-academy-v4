'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Mail } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toLocalDate } from '@/lib/utils'
import type { EnrollmentStatus } from '@prisma/client'

// Base student type for the table
export type StudentEnrollment = {
  id: string
  enrolledAt: Date
  status: EnrollmentStatus
  courseSpentUSD?: number
  courseSpentUYU?: number
  student: {
    firstName: string | null
    lastName: string | null
    user: {
      email: string
      image?: string | null
    }
  }
  course?: {
    id: string
    title: string
  }
}

interface StudentTableProps {
  enrollments: StudentEnrollment[]
  showCourse?: boolean
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

function formatNumber(amount: number): string {
  return new Intl.NumberFormat('es-UY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatSpent(usd: number, uyu: number): string {
  const parts: string[] = []
  if (usd > 0) parts.push(`USD ${formatNumber(usd)}`)
  if (uyu > 0) parts.push(`UYU ${formatNumber(uyu)}`)
  return parts.length > 0 ? parts.join(' / ') : '-'
}

export function StudentTable({ enrollments, showCourse = false }: StudentTableProps) {
  if (enrollments.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border border-border">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Aún no hay estudiantes inscritos
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Cuando los estudiantes se inscriban, aparecerán aquí.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Estudiante</TableHead>
            {showCourse && (
              <TableHead className="hidden xl:table-cell">Curso</TableHead>
            )}
            <TableHead className="hidden md:table-cell">Inscripción</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Gastado</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment) => {
            const student = enrollment.student
            const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Sin nombre'
            const initials = getInitials(student.firstName, student.lastName)
            const statusBadge = getStatusBadge(enrollment.status)

            return (
              <TableRow key={enrollment.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {student.user.image ? (
                      <Image
                        src={student.user.image}
                        alt={fullName}
                        width={40}
                        height={40}
                        className="hidden sm:block size-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="hidden sm:flex size-10 rounded-full bg-verde-uva-100 items-center justify-center text-sm font-semibold text-verde-uva-700 shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{fullName}</span>
                      <span className="text-sm text-muted-foreground truncate">
                        {student.user.email}
                      </span>
                      {showCourse && enrollment.course && (
                        <Link
                          href={`/educator/courses/${enrollment.course.id}/students`}
                          className="xl:hidden text-xs text-primary hover:underline truncate"
                        >
                          {enrollment.course.title}
                        </Link>
                      )}
                    </div>
                  </div>
                </TableCell>
                {showCourse && (
                  <TableCell className="hidden xl:table-cell">
                    {enrollment.course && (
                      <Link
                        href={`/educator/courses/${enrollment.course.id}/students`}
                        className="text-primary hover:underline line-clamp-2"
                      >
                        {enrollment.course.title}
                      </Link>
                    )}
                  </TableCell>
                )}
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatDate(enrollment.enrolledAt)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-center">
                  <p className="text-sm font-semibold text-foreground">
                    {formatSpent(
                      enrollment.courseSpentUSD || 0,
                      enrollment.courseSpentUYU || 0
                    )}
                  </p>
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusBadge.className}`}>
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
  )
}
