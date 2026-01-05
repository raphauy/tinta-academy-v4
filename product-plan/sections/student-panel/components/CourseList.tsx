import { useState } from 'react'
import { BookOpen, Filter, GraduationCap, Wine } from 'lucide-react'
import type { CourseListProps, EnrolledCourse } from '@/../product/sections/student-panel/types'
import { CourseCard } from './CourseCard'

type FilterType = 'all' | 'in_progress' | 'completed' | 'upcoming'
type CourseTypeFilter = 'all' | 'online' | 'in_person'

interface FilterButtonProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}

function FilterButton({ active, onClick, children, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-[#143F3B] text-white shadow-sm'
          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          active
            ? 'bg-white/20'
            : 'bg-stone-200 dark:bg-stone-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

export function CourseList({
  courses,
  onContinueCourse,
  onViewCourseDetails,
  onDownloadResource
}: CourseListProps) {
  const [statusFilter, setStatusFilter] = useState<FilterType>('all')
  const [typeFilter, setTypeFilter] = useState<CourseTypeFilter>('all')

  // Count courses by status
  const counts = {
    all: courses.length,
    in_progress: courses.filter(c => c.status === 'in_progress').length,
    completed: courses.filter(c => c.status === 'completed').length,
    upcoming: courses.filter(c => c.status === 'upcoming').length,
    online: courses.filter(c => c.courseType === 'online').length,
    in_person: courses.filter(c => c.courseType === 'in_person').length,
  }

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    const matchesType = typeFilter === 'all' || course.courseType === typeFilter
    return matchesStatus && matchesType
  })

  // Sort: in_progress first, then upcoming, then completed
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const order: Record<EnrolledCourse['status'], number> = {
      in_progress: 0,
      upcoming: 1,
      completed: 2
    }
    return order[a.status] - order[b.status]
  })

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#143F3B]/10 dark:bg-[#143F3B]/20">
            <GraduationCap className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Mis Cursos
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {courses.length} {courses.length === 1 ? 'curso inscrito' : 'cursos inscritos'}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-3">
        {/* Status filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          <FilterButton
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
            count={counts.all}
          >
            Todos
          </FilterButton>
          <FilterButton
            active={statusFilter === 'in_progress'}
            onClick={() => setStatusFilter('in_progress')}
            count={counts.in_progress}
          >
            En progreso
          </FilterButton>
          <FilterButton
            active={statusFilter === 'upcoming'}
            onClick={() => setStatusFilter('upcoming')}
            count={counts.upcoming}
          >
            Próximamente
          </FilterButton>
          <FilterButton
            active={statusFilter === 'completed'}
            onClick={() => setStatusFilter('completed')}
            count={counts.completed}
          >
            Completados
          </FilterButton>
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-4" /> {/* Spacer to align with status filters */}
          <FilterButton
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Todas las modalidades
          </FilterButton>
          <FilterButton
            active={typeFilter === 'online'}
            onClick={() => setTypeFilter('online')}
            count={counts.online}
          >
            Online
          </FilterButton>
          <FilterButton
            active={typeFilter === 'in_person'}
            onClick={() => setTypeFilter('in_person')}
            count={counts.in_person}
          >
            Presencial
          </FilterButton>
        </div>
      </div>

      {/* Course list */}
      {sortedCourses.length > 0 ? (
        <div className="space-y-4">
          {sortedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onContinueCourse={(lessonId) => onContinueCourse?.(course.courseId, lessonId)}
              onViewCourseDetails={() => onViewCourseDetails?.(course.courseId)}
              onDownloadResource={onDownloadResource}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
            <Wine className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100 mb-1">
            No hay cursos
          </h3>
          <p className="text-stone-500 dark:text-stone-400">
            {statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No hay cursos que coincidan con los filtros seleccionados.'
              : 'Aún no estás inscrito en ningún curso.'}
          </p>
        </div>
      )}
    </div>
  )
}
