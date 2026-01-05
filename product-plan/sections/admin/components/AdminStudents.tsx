import { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Activity,
  Award,
  Search,
  ChevronDown,
  X
} from 'lucide-react'
import type { AdminStudentsProps } from '@/../product/sections/admin/types'
import { AdminMetricCard } from './AdminMetricCard'
import { StudentRow } from './StudentRow'

type SortField = 'name' | 'email' | 'enrollments' | 'spent' | 'lastActivity'
type SortDirection = 'asc' | 'desc'

export function AdminStudents({
  students,
  stats,
  onView,
  onEdit
}: AdminStudentsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('lastActivity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        student =>
          student.firstName.toLowerCase().includes(query) ||
          student.lastName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.city.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'enrollments':
          comparison = a.enrollmentsCount - b.enrollmentsCount
          break
        case 'spent':
          comparison = a.totalSpent - b.totalSpent
          break
        case 'lastActivity':
          comparison = new Date(a.lastActivityAt).getTime() - new Date(b.lastActivityAt).getTime()
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

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field
          ? 'text-verde-uva-700 dark:text-verde-uva-400'
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
    </button>
  )

  return (
    <div className="p-4 sm:p-6 pb-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Estudiantes
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestión de alumnos inscritos en la plataforma
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
          trend={{
            value: Math.round((stats.newThisMonth / stats.total) * 100),
            label: 'del total'
          }}
        />
        <AdminMetricCard
          label="Activos este Mes"
          value={stats.activeThisMonth}
          icon={<Activity className="w-4 h-4" />}
          trend={{
            value: Math.round((stats.activeThisMonth / stats.total) * 100),
            label: 'del total'
          }}
        />
        <AdminMetricCard
          label="Con Cursos Completados"
          value={stats.withCompletedCourses}
          icon={<Award className="w-4 h-4" />}
          trend={{
            value: Math.round((stats.withCompletedCourses / stats.total) * 100),
            label: 'del total'
          }}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o ciudad..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gris-tinta-900 border border-stone-200 dark:border-gris-tinta-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-verde-uva-500/20 focus:border-verde-uva-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Sort Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
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

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">Ordenar por:</span>
          <div className="flex items-center gap-3">
            <SortButton field="name" label="Nombre" />
            <SortButton field="enrollments" label="Inscripciones" />
            <SortButton field="spent" label="Gastado" />
            <SortButton field="lastActivity" label="Actividad" />
          </div>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length > 0 ? (
        <div className="bg-white dark:bg-gris-tinta-900 border border-stone-200 dark:border-gris-tinta-700 rounded-xl overflow-hidden">
          {/* Table Header - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-gris-tinta-800/50 border-b border-stone-200 dark:border-gris-tinta-700">
            <div className="col-span-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Estudiante
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Ubicación
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

          {/* Table Body */}
          <div className="divide-y divide-stone-100 dark:divide-gris-tinta-700">
            {filteredStudents.map(student => (
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
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-gris-tinta-900 border border-stone-200 dark:border-gris-tinta-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-gris-tinta-800 flex items-center justify-center mb-4">
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
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm text-verde-uva-600 dark:text-verde-uva-400 hover:text-verde-uva-700 dark:hover:text-verde-uva-300"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}
    </div>
  )
}
