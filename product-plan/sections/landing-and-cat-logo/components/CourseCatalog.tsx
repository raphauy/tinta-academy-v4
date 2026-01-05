import { useState } from 'react'
import type { Course, Educator, Tag, CourseFilters } from '@/../product/sections/landing-and-cat-logo/types'
import { CourseCard } from './CourseCard'
import { Filter, X, ChevronDown, Monitor, MapPin } from 'lucide-react'

interface CourseCatalogProps {
  upcomingCourses: Course[]
  pastCourses: Course[]
  educators: Educator[]
  tags: Tag[]
  onViewCourse?: (courseSlug: string) => void
}

/**
 * CourseCatalog - Clean course grid with filters
 */
export function CourseCatalog({
  upcomingCourses,
  pastCourses,
  educators,
  tags,
  onViewCourse,
}: CourseCatalogProps) {
  const [filters, setFilters] = useState<CourseFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showPastCourses, setShowPastCourses] = useState(false)

  const getEducator = (educatorId: string) =>
    educators.find((e) => e.id === educatorId)

  const filterCourses = (courses: Course[]) => {
    return courses.filter((course) => {
      if (filters.modality && course.modality !== filters.modality) return false
      if (filters.type && course.type !== filters.type) return false
      if (filters.tagIds && filters.tagIds.length > 0) {
        const hasMatchingTag = filters.tagIds.some((tagId) =>
          course.tagIds.includes(tagId)
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

  const clearFilters = () => setFilters({})

  const toggleTag = (tagId: string) => {
    const currentTags = filters.tagIds || []
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId]
    setFilters({ ...filters, tagIds: newTags.length > 0 ? newTags : undefined })
  }

  return (
    <section className="py-16 bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#2E2E2E] mb-1">
              Próximos Cursos
            </h2>
            <p className="text-[#666]">
              {filteredUpcoming.length} cursos disponibles
            </p>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-[#143F3B] text-white'
                : 'bg-white text-[#2E2E2E] border border-[#DDD] hover:border-[#143F3B]'
            }`}
          >
            <Filter size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-[#DDBBC0] text-[#2E2E2E] text-xs font-bold rounded-full flex items-center justify-center">
                {(filters.modality ? 1 : 0) + (filters.type ? 1 : 0) + (filters.tagIds?.length || 0)}
              </span>
            )}
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border border-[#E5E5E5]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Modality */}
              <div>
                <label className="block text-sm font-semibold text-[#2E2E2E] mb-3">
                  Modalidad
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={!filters.modality}
                    onClick={() => setFilters({ ...filters, modality: undefined })}
                  >
                    Todas
                  </FilterButton>
                  <FilterButton
                    active={filters.modality === 'presencial'}
                    onClick={() => setFilters({ ...filters, modality: 'presencial' })}
                    icon={<MapPin size={14} />}
                  >
                    Presencial
                  </FilterButton>
                  <FilterButton
                    active={filters.modality === 'online'}
                    onClick={() => setFilters({ ...filters, modality: 'online' })}
                    icon={<Monitor size={14} />}
                  >
                    Online
                  </FilterButton>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-[#2E2E2E] mb-3">
                  Tipo de curso
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterButton
                    active={!filters.type}
                    onClick={() => setFilters({ ...filters, type: undefined })}
                  >
                    Todos
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'wset'}
                    onClick={() => setFilters({ ...filters, type: 'wset' })}
                  >
                    WSET
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'taller'}
                    onClick={() => setFilters({ ...filters, type: 'taller' })}
                  >
                    Taller
                  </FilterButton>
                  <FilterButton
                    active={filters.type === 'cata'}
                    onClick={() => setFilters({ ...filters, type: 'cata' })}
                  >
                    Cata
                  </FilterButton>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-[#2E2E2E] mb-3">
                  Temas
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        filters.tagIds?.includes(tag.id)
                          ? 'bg-[#DDBBC0] text-[#2E2E2E] font-medium'
                          : 'bg-[#F5F5F5] text-[#666] hover:bg-[#E5E5E5]'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-6 pt-4 border-t border-[#E5E5E5]">
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#143F3B]"
                >
                  <X size={16} />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Course Grid */}
        {filteredUpcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredUpcoming.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                educator={getEducator(course.educatorId)}
                onView={() => onViewCourse?.(course.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-16">
            <p className="text-[#666] text-lg mb-4">
              No hay cursos que coincidan con los filtros.
            </p>
            <button
              onClick={clearFilters}
              className="text-[#143F3B] font-medium hover:underline"
            >
              Ver todos los cursos
            </button>
          </div>
        )}

        {/* Past Courses */}
        {pastCourses.length > 0 && (
          <div className="border-t border-[#DDD] pt-12">
            <button
              onClick={() => setShowPastCourses(!showPastCourses)}
              className="flex items-center gap-3 mb-8 group"
            >
              <h2 className="text-2xl font-bold text-[#999] group-hover:text-[#666] transition-colors">
                Cursos Finalizados
              </h2>
              <ChevronDown
                size={24}
                className={`text-[#999] transition-transform ${showPastCourses ? 'rotate-180' : ''}`}
              />
              <span className="text-[#999]">({filteredPast.length})</span>
            </button>

            {showPastCourses && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-70">
                {filteredPast.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    educator={getEducator(course.educatorId)}
                    onView={() => onViewCourse?.(course.slug)}
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
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-[#143F3B] text-white'
          : 'bg-[#F5F5F5] text-[#2E2E2E] hover:bg-[#E5E5E5]'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
