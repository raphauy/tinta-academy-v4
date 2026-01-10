'use client'

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { SearchFilterBar } from '@/components/shared/search-filter-bar'
import { FiltersPanel } from '@/components/shared/filters-panel'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EducatorCourseRow } from './educator-course-row'
import {
  publishCourseAction,
  unpublishCourseAction,
  deleteCourseAction
} from '@/app/educator/actions'
import type { Course, Educator, Tag } from '@prisma/client'

type CourseWithRelations = Course & {
  educator: Educator
  tags: Tag[]
  totalRevenueUSD: number
  totalRevenueUYU: number
  _count: {
    enrollments: number
  }
}

interface CourseListProps {
  courses: CourseWithRelations[]
  tags: Tag[]
}

type StatusFilter = 'all' | 'draft' | 'enrolling' | 'full' | 'in_progress' | 'finished'
type TypeFilter = 'all' | 'wset' | 'taller' | 'cata' | 'curso'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'enrolling', label: 'Inscribiendo' },
  { value: 'full', label: 'Completo' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'finished', label: 'Finalizado' },
]

export function CourseList({ courses, tags }: CourseListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

  // Get filters from URL
  const statusParam = searchParams.get('status') as StatusFilter | null
  const typeParam = searchParams.get('type') as TypeFilter | null
  const modalityParam = searchParams.get('modality')
  const currentStatus: StatusFilter = statusParam || 'all'
  const currentType: TypeFilter = typeParam || 'all'
  const currentModality = modalityParam || undefined

  // Calculate active filters count
  const activeFiltersCount =
    (currentStatus !== 'all' ? 1 : 0) +
    (currentType !== 'all' ? 1 : 0) +
    (currentModality ? 1 : 0) +
    selectedTagIds.length

  const hasActiveFilters = activeFiltersCount > 0

  // Filter and search courses
  const filteredCourses = useMemo(() => {
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

      // Status filter
      if (currentStatus !== 'all' && course.status !== currentStatus) {
        return false
      }

      // Type filter
      if (currentType !== 'all' && course.type !== currentType) {
        return false
      }

      // Modality filter
      if (currentModality && course.modality !== currentModality) {
        return false
      }

      // Tags filter
      if (selectedTagIds.length > 0) {
        const hasMatchingTag = selectedTagIds.some((tagId) =>
          course.tags.some(tag => tag.id === tagId)
        )
        if (!hasMatchingTag) return false
      }

      return true
    })
  }, [courses, searchQuery, currentStatus, currentType, currentModality, selectedTagIds])

  const updateFilters = (status: StatusFilter, type: TypeFilter, modality: string | undefined) => {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (type !== 'all') params.set('type', type)
    if (modality) params.set('modality', modality)
    const queryString = params.toString()
    router.push(`/educator/courses${queryString ? `?${queryString}` : ''}`)
  }

  const clearFilters = () => {
    updateFilters('all', 'all', undefined)
    setSearchQuery('')
    setSelectedTagIds([])
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handlePublish = async (courseId: string) => {
    startTransition(async () => {
      const result = await publishCourseAction(courseId)
      if (result.success) {
        toast.success('Curso publicado', {
          description: 'El curso ahora es visible para el público.'
        })
      } else {
        toast.error('Error al publicar', {
          description: result.error
        })
      }
    })
  }

  const handleUnpublish = async (courseId: string) => {
    startTransition(async () => {
      const result = await unpublishCourseAction(courseId)
      if (result.success) {
        toast.success('Curso despublicado', {
          description: 'El curso ha vuelto a estado borrador.'
        })
      } else {
        toast.error('Error al despublicar', {
          description: result.error
        })
      }
    })
  }

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return

    startTransition(async () => {
      const result = await deleteCourseAction(courseToDelete)
      if (result.success) {
        toast.success('Curso eliminado', {
          description: 'El curso ha sido eliminado correctamente.'
        })
      } else {
        toast.error('Error al eliminar', {
          description: result.error
        })
      }
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus cursos presenciales
          </p>
        </div>

        <Button asChild>
          <Link href="/educator/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso Presencial
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar cursos..."
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Filters Panel */}
      {showFilters && (
        <FiltersPanel
          showModality={true}
          currentModality={currentModality}
          onModalityChange={(modality) => updateFilters(currentStatus, currentType, modality)}
          showType={true}
          currentType={currentType}
          onTypeChange={(type) => updateFilters(currentStatus, type as TypeFilter, currentModality)}
          showTags={tags.length > 0}
          tags={tags}
          selectedTagIds={selectedTagIds}
          onTagToggle={handleTagToggle}
          showStatus={true}
          currentStatus={currentStatus}
          onStatusChange={(status) => updateFilters(status as StatusFilter, currentType, currentModality)}
          statusOptions={STATUS_OPTIONS}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}

      {/* Course count */}
      <p className="text-sm text-muted-foreground">
        {filteredCourses.length} cursos
      </p>

      {/* Course list or empty state */}
      {courses.length === 0 ? (
        // No courses at all
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="text-6xl mb-4">🍷</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Aún no has creado ningún curso
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Comienza creando tu primer curso para compartir tus conocimientos.
          </p>
          <Button asChild>
            <Link href="/educator/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear mi primer curso
            </Link>
          </Button>
        </div>
      ) : filteredCourses.length === 0 ? (
        // Courses exist but filters/search return empty
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
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
      ) : (
        // Show course list
        <div className={`space-y-4 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          {filteredCourses.map((course) => (
            <EducatorCourseRow
              key={course.id}
              course={course}
              onPublish={handlePublish}
              onUnpublish={handleUnpublish}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El curso será eliminado
              permanentemente junto con todo su contenido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
