'use client'

import { Fragment, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Mail, ChevronDown, Phone, MapPin, CreditCard, Calendar, Copy, Check, MoreVertical, UserMinus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, toLocalDate } from '@/lib/utils'
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
    identityDocument?: string | null
    dateOfBirth?: Date | null
    phone?: string | null
    address?: string | null
    city?: string | null
    country?: string | null
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
  /**
   * Si se provee, habilita la acción "Quitar del curso" por fila.
   * El padre maneja la confirmación y la llamada al server action.
   */
  onRemove?: (enrollment: StudentEnrollment) => void
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      title="Copiar"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-sm font-medium truncate">{value}</p>
          <CopyButton text={value} />
        </div>
      </div>
    </div>
  )
}

export function StudentTable({ enrollments, showCourse = false, onRemove }: StudentTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

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

  const colCount = 4 + (showCourse ? 1 : 0)

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
            const isExpanded = expandedId === enrollment.id

            return (
              <Fragment key={enrollment.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : enrollment.id)}
                >
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            {enrollment.course.title}
                          </Link>
                        )}
                      </div>
                      <ChevronDown className={cn(
                        "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </TableCell>
                  {showCourse && (
                    <TableCell className="hidden xl:table-cell">
                      {enrollment.course && (
                        <Link
                          href={`/educator/courses/${enrollment.course.id}/students`}
                          className="text-primary hover:underline line-clamp-2"
                          onClick={(e) => e.stopPropagation()}
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
                    {onRemove && enrollment.status !== 'cancelled' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-2 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Acciones"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${student.user.email}`}>
                              <Mail className="mr-2 size-4" />
                              Enviar email
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onRemove(enrollment)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserMinus className="mr-2 size-4" />
                            Quitar del curso
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <a
                        href={`mailto:${student.user.email}`}
                        className="p-2 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        title="Enviar email"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="size-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow className="hover:bg-transparent bg-muted/30">
                    <TableCell colSpan={colCount + 1} className="p-0">
                      <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <DetailItem
                          icon={<Mail className="size-4" />}
                          label="Email"
                          value={student.user.email}
                        />
                        {student.phone && (
                          <DetailItem
                            icon={<Phone className="size-4" />}
                            label="Teléfono"
                            value={student.phone}
                          />
                        )}
                        {student.identityDocument && (
                          <DetailItem
                            icon={<CreditCard className="size-4" />}
                            label="Documento"
                            value={student.identityDocument}
                          />
                        )}
                        {student.dateOfBirth && (
                          <DetailItem
                            icon={<Calendar className="size-4" />}
                            label="Fecha de nacimiento"
                            value={formatDate(student.dateOfBirth)}
                          />
                        )}
                        {(student.address || student.city || student.country) && (
                          <DetailItem
                            icon={<MapPin className="size-4" />}
                            label="Ubicación"
                            value={[student.address, student.city, student.country].filter(Boolean).join(', ')}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
