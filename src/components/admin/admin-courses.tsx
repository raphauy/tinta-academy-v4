'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Laptop, MapPin, BookOpen, Users } from 'lucide-react'
import { SearchFilterBar } from '@/components/shared/search-filter-bar'
import { FiltersPanel } from '@/components/shared/filters-panel'
import type { AdminCourse } from '@/services/course-service'
import type { Tag } from '@prisma/client'
import { AdminCourseCard } from './admin-course-card'
import { AdminMetricCard } from './admin-metric-card'

const ADMIN_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'enrolling', label: 'Inscribiendo' },
  { value: 'full', label: 'Completo' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'finished', label: 'Finalizado' },
]

type TypeFilter = 'all' | 'wset' | 'taller' | 'cata' | 'curso'

export interface AdminCoursesProps {
  courses: AdminCourse[]
  tags: Tag[]
  onEducatorClick?: (educatorId: string) => void
}

export function AdminCourses({
  courses,
  tags,
  onEducatorClick,
}: AdminCoursesProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Get filters from URL
  const statusParam = searchParams.get('status')
  const modalityParam = searchParams.get('modality')
  const typeParam = searchParams.get('type') as TypeFilter | null
  const currentStatus = statusParam || 'all'
  const currentModality = modalityParam || undefined
  const currentType: TypeFilter = typeParam || 'all'

  // Calculate active filters count
  const activeFiltersCount =
    (currentStatus !== 'all' ? 1 : 0) +
    (currentModality ? 1 : 0) +
    (currentType !== 'all' ? 1 : 0) +
    selectedTagIds.length

  const hasActiveFilters = activeFiltersCount > 0 || searchQuery.length > 0

  // Filter and search courses
  const filteredCourses = useMemo(() => {
    let result = [...courses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.educator.name.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (currentStatus !== 'all') {
      result = result.filter((c) => c.status === currentStatus)
    }

    // Modality filter
    if (currentModality) {
      result = result.filter((c) => c.modality === currentModality)
    }

    // Type filter
    if (currentType !== 'all') {
      result = result.filter((c) => c.type === currentType)
    }

    // Tags filter
    if (selectedTagIds.length > 0) {
      result = result.filter((c) =>
        selectedTagIds.some((tagId) => c.tags.some((tag) => tag.id === tagId))
      )
    }

    return result
  }, [courses, searchQuery, currentStatus, currentModality, currentType, selectedTagIds])

  const stats = useMemo(() => {
    const online = courses.filter((c) => c.modality === 'online').length
    const presencial = courses.filter((c) => c.modality === 'presencial').length
    const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolledCount, 0)
    return { online, presencial, totalEnrolled }
  }, [courses])

  const updateFilters = (
    status: string,
    modality: string | undefined,
    type: TypeFilter
  ) => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (modality) params.set('modality', modality)
    if (type !== 'all') params.set('type', type)
    const queryString = params.toString()
    router.push(`/admin/courses${queryString ? `?${queryString}` : ''}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedTagIds([])
    router.push('/admin/courses')
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cursos</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona y visualiza el rendimiento de todos los cursos
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Cursos"
          value={courses.length}
          icon={<BookOpen className="w-4 h-4" />}
          size="compact"
        />
        <AdminMetricCard
          label="Online"
          value={stats.online}
          icon={<Laptop className="w-4 h-4" />}
          size="compact"
        />
        <AdminMetricCard
          label="Presenciales"
          value={stats.presencial}
          icon={<MapPin className="w-4 h-4" />}
          size="compact"
        />
        <AdminMetricCard
          label="Total Inscritos"
          value={stats.totalEnrolled}
          icon={<Users className="w-4 h-4" />}
          size="compact"
        />
      </div>

      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar por nombre o educador..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeFiltersCount}
      />

      {showFilters && (
        <FiltersPanel
          showModality={true}
          currentModality={currentModality}
          onModalityChange={(modality) =>
            updateFilters(currentStatus, modality, currentType)
          }
          showType={true}
          currentType={currentType}
          onTypeChange={(type) =>
            updateFilters(currentStatus, currentModality, type as TypeFilter)
          }
          showTags={tags.length > 0}
          tags={tags}
          selectedTagIds={selectedTagIds}
          onTagToggle={handleTagToggle}
          showStatus={true}
          currentStatus={currentStatus}
          onStatusChange={(status) =>
            updateFilters(status, currentModality, currentType)
          }
          statusOptions={ADMIN_STATUS_OPTIONS}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      <p className="text-sm text-muted-foreground">
        {filteredCourses.length === courses.length
          ? `${courses.length} cursos`
          : `${filteredCourses.length} de ${courses.length} cursos`}
      </p>

      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No se encontraron cursos
          </h3>
          <p className="text-muted-foreground">
            Intenta ajustar los filtros o la búsqueda
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onEducatorClick={onEducatorClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
