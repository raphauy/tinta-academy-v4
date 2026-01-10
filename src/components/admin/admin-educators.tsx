'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  BookOpen,
  GraduationCap,
  Search,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { EducatorWithStats, EducatorStats } from '@/services/educator-service'
import { AdminMetricCard } from './admin-metric-card'
import { EducatorCard } from './educator-card'

type SortField = 'name' | 'courses' | 'students'
type SortDirection = 'asc' | 'desc'

export interface AdminEducatorsProps {
  educators: EducatorWithStats[]
  stats: EducatorStats
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}

export function AdminEducators({
  educators,
  stats,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: AdminEducatorsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('students')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredEducators = useMemo(() => {
    let result = [...educators]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (educator) =>
          educator.name.toLowerCase().includes(query) ||
          educator.user.email.toLowerCase().includes(query) ||
          (educator.title?.toLowerCase() || '').includes(query)
      )
    }

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

  const renderSortButton = (field: SortField, label: string) => (
    <Button
      key={field}
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={`h-auto px-2 py-1 text-xs font-medium ${
        sortField === field
          ? 'text-[#143F3B] dark:text-[#6B9B7A]'
          : 'text-stone-500 dark:text-stone-400'
      }`}
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={`w-3 h-3 ml-1 transition-transform ${
            sortDirection === 'asc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            Educadores
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gestion de instructores de la plataforma
          </p>
        </div>

        <Button onClick={onCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Educador
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
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
          subtitle={
            stats.total > 0
              ? `${Math.round(stats.totalCourses / stats.total)} cursos por educador`
              : undefined
          }
        />
        <AdminMetricCard
          label="Total Alumnos"
          value={stats.totalStudents}
          icon={<Users className="w-4 h-4" />}
          subtitle={
            stats.total > 0
              ? `${Math.round(stats.totalStudents / stats.total)} alumnos por educador`
              : undefined
          }
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
        <Input
          type="text"
          placeholder="Buscar por nombre, email o titulo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-600"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchQuery('')}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Limpiar busqueda</span>
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 dark:text-stone-500">Ordenar por:</span>
          <div className="flex items-center gap-1">
            {renderSortButton('name', 'Nombre')}
            {renderSortButton('courses', 'Cursos')}
            {renderSortButton('students', 'Alumnos')}
          </div>
        </div>
      </div>

      {filteredEducators.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredEducators.map((educator) => (
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
            <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>
              Limpiar busqueda
            </Button>
          ) : (
            <Button className="mt-4" onClick={onCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar primer educador
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
