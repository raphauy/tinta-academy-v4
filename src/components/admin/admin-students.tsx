'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Activity,
  Award,
  Search,
  ChevronDown,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { StudentWithStats, StudentStats } from '@/services/student-service'
import { AdminMetricCard } from './admin-metric-card'
import { StudentRow } from './student-row'

type SortField = 'name' | 'email' | 'enrollments' | 'spent' | 'lastActivity'
type SortDirection = 'asc' | 'desc'

export interface AdminStudentsProps {
  students: StudentWithStats[]
  stats: StudentStats
  onView?: (id: string) => void
  onEdit?: (id: string) => void
}

export function AdminStudents({
  students,
  stats,
  onView,
  onEdit,
}: AdminStudentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('lastActivity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredStudents = useMemo(() => {
    let result = [...students]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (student) =>
          (student.firstName?.toLowerCase() || '').includes(query) ||
          (student.lastName?.toLowerCase() || '').includes(query) ||
          student.user.email.toLowerCase().includes(query) ||
          (student.city?.toLowerCase() || '').includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim()
          const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim()
          comparison = nameA.localeCompare(nameB)
          break
        case 'email':
          comparison = a.user.email.localeCompare(b.user.email)
          break
        case 'enrollments':
          comparison = a.enrollmentsCount - b.enrollmentsCount
          break
        case 'spent':
          comparison = (a.totalSpentUSD + a.totalSpentUYU) - (b.totalSpentUSD + b.totalSpentUYU)
          break
        case 'lastActivity':
          const dateA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
          const dateB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
          comparison = dateA - dateB
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [students, searchQuery, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      key={field}
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={`h-auto px-2 py-1 inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field
          ? 'text-[#143F3B] dark:text-[#6B9B7A]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
      }`}
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            sortDirection === 'asc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Estudiantes
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestion de alumnos inscritos en la plataforma
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Estudiantes"
          value={stats.total.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Nuevos este Mes"
          value={stats.newThisMonth}
          icon={<UserPlus className="w-4 h-4" />}
          trend={
            stats.total > 0
              ? {
                  value: Math.round((stats.newThisMonth / stats.total) * 100),
                  label: 'del total',
                }
              : undefined
          }
        />
        <AdminMetricCard
          label="Activos este Mes"
          value={stats.activeThisMonth}
          icon={<Activity className="w-4 h-4" />}
          trend={
            stats.total > 0
              ? {
                  value: Math.round((stats.activeThisMonth / stats.total) * 100),
                  label: 'del total',
                }
              : undefined
          }
        />
        <AdminMetricCard
          label="Con Cursos Completados"
          value={stats.withCompletedCourses}
          icon={<Award className="w-4 h-4" />}
          trend={
            stats.total > 0
              ? {
                  value: Math.round((stats.withCompletedCourses / stats.total) * 100),
                  label: 'del total',
                }
              : undefined
          }
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre, email o ciudad..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-background"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredStudents.length === 0
            ? 'No se encontraron estudiantes'
            : filteredStudents.length === 1
              ? '1 estudiante'
              : `${filteredStudents.length} estudiantes`}
          {searchQuery && students.length !== filteredStudents.length && (
            <span className="text-stone-400 dark:text-stone-500">
              {' '}de {students.length} totales
            </span>
          )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">Ordenar por:</span>
          <div className="flex items-center gap-3">
            {renderSortButton('name', 'Nombre')}
            {renderSortButton('enrollments', 'Inscripciones')}
            {renderSortButton('spent', 'Gastado')}
            {renderSortButton('lastActivity', 'Actividad')}
          </div>
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estudiante
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Ubicacion
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Inscripciones
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              Total Gastado
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredStudents.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onView={() => onView?.(student.id)}
                onEdit={() => onEdit?.(student.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery
              ? `No se encontraron estudiantes que coincidan con "${searchQuery}"`
              : 'No hay estudiantes registrados en la plataforma'}
          </p>
          {searchQuery && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              Limpiar busqueda
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
