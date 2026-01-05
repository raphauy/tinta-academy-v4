import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Laptop,
  MapPin,
  BookOpen,
  X,
  Eye,
  Users
} from 'lucide-react'
import type { AdminCoursesProps, AdminCourse, CourseObserver, CourseEnrollment } from '@/../product/sections/admin/types'
import { AdminCourseCard } from './AdminCourseCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

type ModalityFilter = 'all' | 'online' | 'presencial'
type StatusFilter = 'all' | 'enrolling' | 'available' | 'finished' | 'draft'
type SortOption = 'recent' | 'revenue' | 'enrolled' | 'observers' | 'title'

interface CourseObserversModalProps {
  courseId: string
  courseTitle: string
  observers: CourseObserver[]
  onClose: () => void
}

function CourseObserversModal({ courseId, courseTitle, observers, onClose }: CourseObserversModalProps) {
  const courseObservers = observers.filter(o => o.courseId === courseId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              Interesados
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
              {courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {courseObservers.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                No hay interesados en este curso
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {courseObservers.map((observer) => (
                <div
                  key={observer.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        {observer.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                        {observer.email}
                      </p>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">
                        Desde {new Date(observer.createdAt).toLocaleDateString('es-UY')}
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-1.5 rounded text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                    onClick={() => navigator.clipboard.writeText(observer.email)}
                    title="Copiar email"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {courseObservers.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850">
            <button
              onClick={() => {
                const emails = courseObservers.map(o => o.email).join(', ')
                navigator.clipboard.writeText(emails)
              }}
              className="w-full py-2 px-4 text-sm font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-lg transition-colors"
            >
              Copiar todos los emails ({courseObservers.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface CourseEnrollmentsModalProps {
  courseId: string
  courseTitle: string
  enrollments: CourseEnrollment[]
  onClose: () => void
}

function CourseEnrollmentsModal({ courseId, courseTitle, enrollments, onClose }: CourseEnrollmentsModalProps) {
  const courseEnrollments = enrollments.filter(e => e.courseId === courseId)

  const statusLabels: Record<string, { label: string; className: string }> = {
    active: { label: 'Activo', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-400' },
    completed: { label: 'Completado', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' },
    dropped: { label: 'Abandonado', className: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400' }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              Estudiantes Inscritos
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
              {courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {courseEnrollments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                No hay estudiantes inscritos en este curso
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {courseEnrollments.map((enrollment) => {
                const status = statusLabels[enrollment.status] || statusLabels.active
                return (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          {enrollment.studentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {enrollment.studentName}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          {enrollment.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {enrollment.progress !== undefined && (
                        <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400">
                          {enrollment.progress}%
                        </span>
                      )}
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {courseEnrollments.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-850">
            <button
              onClick={() => {
                const emails = courseEnrollments.map(e => e.email).join(', ')
                navigator.clipboard.writeText(emails)
              }}
              className="w-full py-2 px-4 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
            >
              Copiar todos los emails ({courseEnrollments.length})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ExtendedAdminCoursesProps extends AdminCoursesProps {
  observers?: CourseObserver[]
  enrollments?: CourseEnrollment[]
}

export function AdminCourses({
  courses,
  observers = [],
  enrollments = [],
  onViewDetails,
  onViewObservers
}: ExtendedAdminCoursesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [modalityFilter, setModalityFilter] = useState<ModalityFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [observersModal, setObserversModal] = useState<{ courseId: string; courseTitle: string } | null>(null)
  const [enrollmentsModal, setEnrollmentsModal] = useState<{ courseId: string; courseTitle: string } | null>(null)

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let result = [...courses]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.educatorName.toLowerCase().includes(query)
      )
    }

    // Modality filter
    if (modalityFilter !== 'all') {
      result = result.filter((c) => c.modality === modalityFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    // Sort
    switch (sortBy) {
      case 'revenue':
        result.sort((a, b) => b.totalRevenue - a.totalRevenue)
        break
      case 'enrolled':
        result.sort((a, b) => b.enrolledCount - a.enrolledCount)
        break
      case 'observers':
        result.sort((a, b) => b.observersCount - a.observersCount)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'recent':
      default:
        // Keep original order (assumes recent first)
        break
    }

    return result
  }, [courses, searchQuery, modalityFilter, statusFilter, sortBy])

  // Stats
  const stats = useMemo(() => {
    const online = courses.filter((c) => c.modality === 'online').length
    const presencial = courses.filter((c) => c.modality === 'presencial').length
    const totalRevenue = courses.reduce((sum, c) => sum + c.totalRevenue, 0)
    const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolledCount, 0)
    return { online, presencial, totalRevenue, totalEnrolled }
  }, [courses])

  const activeFiltersCount =
    (modalityFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0)

  const handleViewObservers = (course: AdminCourse) => {
    setObserversModal({ courseId: course.id, courseTitle: course.title })
    onViewObservers?.(course.id)
  }

  const handleViewEnrollments = (course: AdminCourse) => {
    setEnrollmentsModal({ courseId: course.id, courseTitle: course.title })
  }

  return (
    <div className="p-4 sm:p-6 pb-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Cursos
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestiona y visualiza el rendimiento de todos los cursos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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
          <div className="flex items-center gap-2 text-teal-500 dark:text-teal-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total Inscritos</span>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {stats.totalEnrolled}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-3">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o educador..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors ${
              showFilters || activeFiltersCount > 0
                ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-teal-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-700">
            {/* Modality Filter */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Modalidad
              </label>
              <Select value={modalityFilter} onValueChange={(v) => setModalityFilter(v as ModalityFilter)}>
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

            {/* Status Filter */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Estado
              </label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="enrolling">Inscribiendo</SelectItem>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="finished">Finalizado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="revenue">Mayor ingreso</SelectItem>
                  <SelectItem value="enrolled">Más inscritos</SelectItem>
                  <SelectItem value="observers">Más interesados</SelectItem>
                  <SelectItem value="title">Alfabético</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setModalityFilter('all')
                    setStatusFilter('all')
                  }}
                  className="px-3 py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredCourses.length === courses.length
            ? `${courses.length} cursos`
            : `${filteredCourses.length} de ${courses.length} cursos`}
        </p>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-850 rounded-xl border border-stone-200 dark:border-stone-700">
          <BookOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1">
            No se encontraron cursos
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Intenta ajustar los filtros o la búsqueda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onViewDetails={() => onViewDetails?.(course.id)}
              onViewObservers={() => handleViewObservers(course)}
              onViewEnrollments={() => handleViewEnrollments(course)}
            />
          ))}
        </div>
      )}

      {/* Observers Modal */}
      {observersModal && (
        <CourseObserversModal
          courseId={observersModal.courseId}
          courseTitle={observersModal.courseTitle}
          observers={observers}
          onClose={() => setObserversModal(null)}
        />
      )}

      {/* Enrollments Modal */}
      {enrollmentsModal && (
        <CourseEnrollmentsModal
          courseId={enrollmentsModal.courseId}
          courseTitle={enrollmentsModal.courseTitle}
          enrollments={enrollments}
          onClose={() => setEnrollmentsModal(null)}
        />
      )}
    </div>
  )
}
