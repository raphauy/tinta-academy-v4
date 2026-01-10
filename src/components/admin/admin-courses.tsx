'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Laptop, MapPin, BookOpen, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminCourse } from '@/services/course-service'
import { AdminCourseCard } from './admin-course-card'

type ModalityFilter = 'all' | 'online' | 'presencial'
type StatusFilter =
  | 'all'
  | 'announced'
  | 'enrolling'
  | 'full'
  | 'in_progress'
  | 'available'
  | 'finished'
  | 'draft'
type SortOption = 'recent' | 'revenue' | 'enrolled' | 'title'

export interface AdminCoursesProps {
  courses: AdminCourse[]
  onViewDetails?: (id: string) => void
  onViewEnrollments?: (id: string) => void
}

export function AdminCourses({
  courses,
  onViewDetails,
  onViewEnrollments,
}: AdminCoursesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showFilters, setShowFilters] = useState(false)

  const filteredCourses = useMemo(() => {
    let result = [...courses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.educator.name.toLowerCase().includes(query)
      )
    }

    if (modalityFilter !== 'all') {
      result = result.filter((c) => c.modality === modalityFilter)
    }

    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    switch (sortBy) {
      case 'revenue':
        result.sort((a, b) => b.totalRevenue - a.totalRevenue)
        break
      case 'enrolled':
        result.sort((a, b) => b.enrolledCount - a.enrolledCount)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'recent':
      default:
        break
    }

    return result
  }, [courses, searchQuery, modalityFilter, statusFilter, sortBy])

  const stats = useMemo(() => {
    const online = courses.filter((c) => c.modality === 'online').length
    const presencial = courses.filter((c) => c.modality === 'presencial').length
    const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolledCount, 0)
    return { online, presencial, totalEnrolled }
  }, [courses])

  const activeFiltersCount =
    (modalityFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Cursos
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestiona y visualiza el rendimiento de todos los cursos
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium">Total Cursos</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {courses.length}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 mb-2">
            <Laptop className="w-4 h-4" />
            <span className="text-xs font-medium">Online</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.online}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-2">
            <MapPin className="w-4 h-4" />
            <span className="text-xs font-medium">Presenciales</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.presencial}
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#143F3B] dark:text-[#6B9B7A] mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total Inscritos</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalEnrolled}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o educador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant={
              showFilters || activeFiltersCount > 0 ? 'default' : 'outline'
            }
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#143F3B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Modalidad
              </label>
              <Select
                value={modalityFilter}
                onValueChange={(v) => setModalityFilter(v as ModalityFilter)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las modalidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="presencial">Presencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Estado
              </label>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="announced">Anunciado</SelectItem>
                  <SelectItem value="enrolling">Inscribiendo</SelectItem>
                  <SelectItem value="full">Completo</SelectItem>
                  <SelectItem value="in_progress">En curso</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Ordenar por
              </label>
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mas recientes</SelectItem>
                  <SelectItem value="revenue">Mayor ingreso</SelectItem>
                  <SelectItem value="enrolled">Mas inscritos</SelectItem>
                  <SelectItem value="title">Alfabetico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModalityFilter('all')
                    setStatusFilter('all')
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCourses.length === courses.length
            ? `${courses.length} cursos`
            : `${filteredCourses.length} de ${courses.length} cursos`}
        </p>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-700">
          <BookOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
            No se encontraron cursos
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Intenta ajustar los filtros o la busqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onViewDetails={() => onViewDetails?.(course.id)}
              onViewEnrollments={() => onViewEnrollments?.(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
