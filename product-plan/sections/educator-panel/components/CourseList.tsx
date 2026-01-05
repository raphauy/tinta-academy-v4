import { useState } from 'react'
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CourseListProps } from '@/../product/sections/educator-panel/types'
import { CourseListItem } from './CourseListItem'
import { CourseQuickCard } from './CourseQuickCard'

type ViewMode = 'list' | 'grid'
type ModalityFilter = 'all' | 'online' | 'presencial'
type StatusFilter = 'all' | 'draft' | 'published' | 'finished'

export function CourseList({
  courses,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onDuplicate,
  onCreate
}: CourseListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter courses
  const filteredCourses = courses.filter(course => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!course.title.toLowerCase().includes(query) &&
          !course.description.toLowerCase().includes(query)) {
        return false
      }
    }

    // Modality filter
    if (modalityFilter !== 'all' && course.modality !== modalityFilter) {
      return false
    }

    // Status filter
    if (statusFilter !== 'all' && course.status !== statusFilter) {
      return false
    }

    return true
  })

  // Count by status
  const countByStatus = {
    all: courses.length,
    draft: courses.filter(c => c.status === 'draft').length,
    published: courses.filter(c => c.status === 'published').length,
    finished: courses.filter(c => c.status === 'finished').length
  }

  // Count by modality
  const countByModality = {
    all: courses.length,
    online: courses.filter(c => c.modality === 'online').length,
    presencial: courses.filter(c => c.modality === 'presencial').length
  }

  return (
    <div className="p-6 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
            Mis Cursos
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Gestiona tus cursos online y presenciales
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Curso</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#143F3B]/20 focus:border-[#143F3B] dark:focus:border-[#6B9B7A] transition-colors"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {/* Filters (Desktop always visible, Mobile toggleable) */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
            {/* Modality Filter */}
            <Select value={modalityFilter} onValueChange={(value) => setModalityFilter(value as ModalityFilter)}>
              <SelectTrigger className="w-[220px] bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las modalidades ({countByModality.all})</SelectItem>
                <SelectItem value="online">Online ({countByModality.online})</SelectItem>
                <SelectItem value="presencial">Presencial ({countByModality.presencial})</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="w-[200px] bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados ({countByStatus.all})</SelectItem>
                <SelectItem value="draft">Borradores ({countByStatus.draft})</SelectItem>
                <SelectItem value="published">Publicados ({countByStatus.published})</SelectItem>
                <SelectItem value="finished">Finalizados ({countByStatus.finished})</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggle */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCourses.length === courses.length
            ? `${courses.length} cursos`
            : `${filteredCourses.length} de ${courses.length} cursos`}
        </p>
      </div>

      {/* Course List/Grid */}
      {filteredCourses.length > 0 ? (
        viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredCourses.map(course => (
              <CourseListItem
                key={course.id}
                course={course}
                onView={() => onView?.(course.id)}
                onEdit={() => onEdit?.(course.id)}
                onDelete={() => onDelete?.(course.id)}
                onPublish={() => onPublish?.(course.id)}
                onDuplicate={() => onDuplicate?.(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filteredCourses.map(course => (
              <CourseQuickCard
                key={course.id}
                course={course}
                onView={() => onView?.(course.id)}
                onEdit={() => onEdit?.(course.id)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
          {searchQuery || modalityFilter !== 'all' || statusFilter !== 'all' ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                No se encontraron cursos
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Intenta con otros filtros o términos de búsqueda
              </p>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setModalityFilter('all')
                  setStatusFilter('all')
                }}
                className="text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
              >
                Limpiar filtros
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-3">
                <Plus className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                Crea tu primer curso
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-sm mx-auto">
                Comienza a compartir tu conocimiento creando un curso online o presencial.
              </p>
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Curso</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
