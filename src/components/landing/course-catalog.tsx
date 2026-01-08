'use client'

import { useState, useMemo } from 'react'
import type { Course, Tag, CourseFilters } from '@/types/landing'
import { CourseCard } from './course-card'
import { X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchFilterBar } from '@/components/shared/search-filter-bar'
import { FiltersPanel } from '@/components/shared/filters-panel'

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
  const [searchQuery, setSearchQuery] = useState('')

  // Update local filters and notify parent (for URL sync)
  const updateFilters = (newFilters: CourseFilters) => {
    setFilters(newFilters)
    onFilter?.(newFilters)
  }

  // Filter and search courses
  const filterCourses = useMemo(() => {
    return (courses: Course[]) => {
      return courses.filter((course) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          const matchesTitle = course.title.toLowerCase().includes(query)
          const matchesDescription = course.description?.toLowerCase().includes(query)
          if (!matchesTitle && !matchesDescription) {
            return false
          }
        }

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
  }, [filters, searchQuery])

  const filteredUpcoming = filterCourses(upcomingCourses)
  const filteredPast = filterCourses(pastCourses)

  const activeFiltersCount =
    (filters.modality ? 1 : 0) + (filters.type ? 1 : 0) + (filters.tagIds?.length || 0)
  const hasActiveFilters = activeFiltersCount > 0

  const clearFilters = () => {
    updateFilters({})
    setSearchQuery('')
  }

  const handleModalityChange = (modality: string | undefined) => {
    updateFilters({ ...filters, modality: modality as CourseFilters['modality'] })
  }

  const handleTypeChange = (type: string) => {
    updateFilters({ ...filters, type: type === 'all' ? undefined : type as CourseFilters['type'] })
  }

  const handleTagToggle = (tagId: string) => {
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">
              Próximos Cursos
            </h2>
            <p className="text-muted-foreground">
              {filteredUpcoming.length} cursos disponibles
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchFilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Buscar cursos..."
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8">
            <FiltersPanel
              showModality={true}
              currentModality={filters.modality || undefined}
              onModalityChange={handleModalityChange}
              showType={true}
              currentType={filters.type || 'all'}
              onTypeChange={handleTypeChange}
              showTags={tags.length > 0}
              tags={tags}
              selectedTagIds={filters.tagIds || []}
              onTagToggle={handleTagToggle}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
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
              No hay cursos que coincidan con tu búsqueda o filtros.
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
