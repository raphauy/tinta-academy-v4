'use client'

import { useState } from 'react'
import type { Course, Tag, CourseFilters } from '@/types/landing'
import { CourseCard } from './CourseCard'
import { Filter, X, ChevronDown, Monitor, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CourseCatalogProps {
  upcomingCourses: Course[]
  pastCourses: Course[]
  tags: Tag[]
  initialFilters?: CourseFilters
  onViewCourse?: (courseSlug: string) => void
  onFilter?: (filters: CourseFilters) => void
}

/**
 * CourseCatalog - Clean course grid with filters
 */
export function CourseCatalog({
  upcomingCourses,
  pastCourses,
  tags,
  initialFilters,
  onViewCourse,
  onFilter,
}: CourseCatalogProps) {
  const [filters, setFilters] = useState<CourseFilters>(initialFilters || {})
  const [showFilters, setShowFilters] = useState(false)
  const [showPastCourses, setShowPastCourses] = useState(false)

  // Update local filters and notify parent (for URL sync)
  const updateFilters = (newFilters: CourseFilters) => {
    setFilters(newFilters)
    onFilter?.(newFilters)
  }

  const filterCourses = (courses: Course[]) => {
    return courses.filter((course) => {
      if (filters.modality && course.modality !== filters.modality) return false
      if (filters.type && course.type !== filters.type) return false
      if (filters.tagIds && filters.tagIds.length > 0) {
        const hasMatchingTag = filters.tagIds.some((tagId) =>
          course.tags.some(tag => tag.id === tagId)
        )
        if (!hasMatchingTag) return false
      }
      return true
    })
  }

  const filteredUpcoming = filterCourses(upcomingCourses)
  const filteredPast = filterCourses(pastCourses)

  const hasActiveFilters =
    filters.modality || filters.type || (filters.tagIds && filters.tagIds.length > 0)

  const clearFilters = () => updateFilters({})

  const toggleTag = (tagId: string) => {
    const currentTags = filters.tagIds || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]
    updateFilters({ ...filters, tagIds: newTags.length > 0 ? newTags : undefined })
  }

  return (
    <section className="py-16 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">
              Próximos Cursos
            </h2>
            <p className="text-muted-foreground">
              {filteredUpcoming.length} cursos disponibles
            </p>
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-[#DDBBC0] text-foreground text-xs font-bold rounded-full flex items-center justify-center">
                {(filters.modality ? 1 : 0) + (filters.type ? 1 : 0) + (filters.tagIds?.length || 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-2xl p-6 mb-8 shadow-sm border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Modality */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Modalidad
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={!filters.modality}
                    onClick={() => updateFilters({ ...filters, modality: undefined })}
                  >
                    Todas
                  </FilterButton>
                  <FilterButton
                    active={filters.modality === 'presencial'}
                    onClick={() => updateFilters({ ...filters, modality: 'presencial' })}
                    icon={<MapPin size={14} />}
                  >
                    Presencial
                  </FilterButton>
                  <FilterButton
                    active={filters.modality === 'online'}
                    onClick={() => updateFilters({ ...filters, modality: 'online' })}
                    icon={<Monitor size={14} />}
                  >
                    Online
                  </FilterButton>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Tipo de curso
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={!filters.type}
                    onClick={() => updateFilters({ ...filters, type: undefined })}
                  >
                    Todos
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'wset'}
                    onClick={() => updateFilters({ ...filters, type: 'wset' })}
                  >
                    WSET
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'taller'}
                    onClick={() => updateFilters({ ...filters, type: 'taller' })}
                  >
                    Taller
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'cata'}
                    onClick={() => updateFilters({ ...filters, type: 'cata' })}
                  >
                    Cata
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'curso'}
                    onClick={() => updateFilters({ ...filters, type: 'curso' })}
                  >
                    Curso
                  </FilterButton>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  Temas
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant={filters.tagIds?.includes(tag.id) ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => toggleTag(tag.id)}
                      className={filters.tagIds?.includes(tag.id) ? 'bg-[#DDBBC0] text-foreground hover:bg-[#DDBBC0]/80' : ''}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="gap-2 text-muted-foreground hover:text-primary"
                >
                  <X size={16} />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Course Grid */}
        {filteredUpcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {filteredUpcoming.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                educator={course.educator}
                onView={() => onViewCourse?.(course.slug)}
              />
            ))}
          </div>
        ) : upcomingCourses.length === 0 ? (
          <div className="text-center py-16 mb-16 bg-card rounded-2xl border border-border">
            <div className="text-6xl mb-4">🍷</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No hay cursos programados
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Estamos preparando nuevos cursos. Suscribite al newsletter para enterarte cuando abramos inscripciones.
            </p>
          </div>
        ) : (
          <div className="text-center py-16 mb-16 bg-card rounded-2xl border border-border">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron cursos
            </h3>
            <p className="text-muted-foreground mb-6">
              No hay cursos que coincidan con los filtros seleccionados.
            </p>
            <Button onClick={clearFilters} className="gap-2">
              <X size={18} />
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Past Courses */}
        {pastCourses.length > 0 && (
          <div className="border-t border-border pt-12">
            <Button
              variant="ghost"
              onClick={() => setShowPastCourses(!showPastCourses)}
              className="flex items-center gap-3 mb-8 group h-auto p-0 hover:bg-transparent"
            >
              <h2 className="text-2xl font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                Cursos Finalizados
              </h2>
              <ChevronDown
                size={24}
                className={`text-muted-foreground transition-transform ${showPastCourses ? 'rotate-180' : ''}`}
              />
              <span className="text-muted-foreground">({filteredPast.length})</span>
            </Button>

            {showPastCourses && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-70">
                {filteredPast.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    educator={course.educator}
                    onView={() => onViewCourse?.(course.slug)}
                    isPast
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

interface FilterButtonProps {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}

function FilterButton({ children, active, onClick, icon }: FilterButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'secondary'}
      size="sm"
      onClick={onClick}
      className="gap-1.5"
    >
      {icon}
      {children}
    </Button>
  )
}
