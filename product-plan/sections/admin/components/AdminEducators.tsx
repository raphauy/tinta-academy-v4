import { useState, useMemo } from 'react'
import {
  Users,
  BookOpen,
  GraduationCap,
  Search,
  Plus,
  X,
  ChevronDown
} from 'lucide-react'
import type { AdminEducatorsProps } from '@/../product/sections/admin/types'
import { AdminMetricCard } from './AdminMetricCard'
import { EducatorCard } from './EducatorCard'

type SortField = 'name' | 'courses' | 'students'
type SortDirection = 'asc' | 'desc'

export function AdminEducators({
  educators,
  stats,
  onView,
  onEdit,
  onDelete,
  onCreate
}: AdminEducatorsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('students')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Filter and sort educators
  const filteredEducators = useMemo(() => {
    let result = [...educators]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        educator =>
          educator.name.toLowerCase().includes(query) ||
          educator.email.toLowerCase().includes(query) ||
          educator.title.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'courses':
          comparison = a.coursesCount - b.coursesCount
          break
        case 'students':
          comparison = a.studentsCount - b.studentsCount
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [educators, searchQuery, sortField, sortDirection])

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
          ? 'text-teal-700 dark:text-teal-400'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Educadores
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gestión de instructores de la plataforma
          </p>
        </div>

        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-xl shadow-sm shadow-teal-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Educador</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <AdminMetricCard
          label="Total Educadores"
          value={stats.total}
          icon={<GraduationCap className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Total Cursos"
          value={stats.totalCourses}
          icon={<BookOpen className="w-4 h-4" />}
          subtitle={`${Math.round(stats.totalCourses / stats.total)} cursos por educador`}
        />
        <AdminMetricCard
          label="Total Alumnos"
          value={stats.totalStudents}
          icon={<Users className="w-4 h-4" />}
          subtitle={`${Math.round(stats.totalStudents / stats.total)} alumnos por educador`}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o título..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
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
          {filteredEducators.length === 0
            ? 'No se encontraron educadores'
            : filteredEducators.length === 1
              ? '1 educador'
              : `${filteredEducators.length} educadores`}
          {searchQuery && educators.length !== filteredEducators.length && (
            <span className="text-stone-400 dark:text-stone-500">
              {' '}de {educators.length} totales
            </span>
          )}
        </p>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">Ordenar por:</span>
          <div className="flex items-center gap-3">
            <SortButton field="name" label="Nombre" />
            <SortButton field="courses" label="Cursos" />
            <SortButton field="students" label="Alumnos" />
          </div>
        </div>
      </div>

      {/* Educators Grid */}
      {filteredEducators.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEducators.map(educator => (
            <EducatorCard
              key={educator.id}
              educator={educator}
              onView={() => onView?.(educator.id)}
              onEdit={() => onEdit?.(educator.id)}
              onDelete={() => onDelete?.(educator.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery
              ? `No se encontraron educadores que coincidan con "${searchQuery}"`
              : 'No hay educadores registrados en la plataforma'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              Limpiar búsqueda
            </button>
          ) : (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar primer educador
            </button>
          )}
        </div>
      )}
    </div>
  )
}
