'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, GraduationCap, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentCourseCard } from './student-course-card'
import type { getStudentEnrollments } from '@/services/enrollment-service'

type EnrollmentWithCourse = Awaited<ReturnType<typeof getStudentEnrollments>>[number]

interface StudentCourseListProps {
  enrollments: EnrollmentWithCourse[]
  currentFilter: string
  viewAs?: string
}

type FilterOption = {
  value: string
  label: string
}

const filterOptions: FilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completados' },
]

function getCourseStatus(course: EnrollmentWithCourse['course']): 'in_progress' | 'completed' | 'upcoming' {
  const now = new Date()
  const startDate = course.startDate

  if (course.status === 'finished') {
    return 'completed'
  }

  if (startDate && new Date(startDate) > now) {
    return 'upcoming'
  }

  return 'in_progress'
}

export function StudentCourseList({ enrollments, currentFilter, viewAs }: StudentCourseListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filter and sort courses
  const filteredEnrollments = useMemo(() => {
    let filtered = [...enrollments]

    // Apply status filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter((enrollment) => {
        const status = getCourseStatus(enrollment.course)
        if (currentFilter === 'in_progress') {
          return status === 'in_progress' || status === 'upcoming'
        }
        return status === currentFilter
      })
    }

    // Sort: in_progress first, then upcoming, then completed
    filtered.sort((a, b) => {
      const statusOrder = { in_progress: 0, upcoming: 1, completed: 2 }
      const statusA = getCourseStatus(a.course)
      const statusB = getCourseStatus(b.course)
      const orderDiff = statusOrder[statusA] - statusOrder[statusB]
      if (orderDiff !== 0) return orderDiff

      // Within same status, sort by start date (newest first)
      const dateA = a.course.startDate ? new Date(a.course.startDate).getTime() : 0
      const dateB = b.course.startDate ? new Date(b.course.startDate).getTime() : 0
      return dateB - dateA
    })

    return filtered
  }, [enrollments, currentFilter])

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (filter === 'all') {
      params.delete('status')
    } else {
      params.set('status', filter)
    }
    // Preserve viewAs if present
    if (viewAs) {
      params.set('viewAs', viewAs)
    }
    router.push(`/student/courses?${params.toString()}`)
  }

  const hasAnyCourses = enrollments.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Mis Cursos
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {hasAnyCourses
                ? `${enrollments.length} ${enrollments.length === 1 ? 'curso inscrito' : 'cursos inscritos'}`
                : 'Explora y encuentra tu próximo curso'}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/#catalog">
            <Search className="w-4 h-4 mr-2" />
            Explorar Cursos
          </Link>
        </Button>
      </div>

      {/* Filter Chips */}
      {hasAnyCourses && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={currentFilter === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(option.value)}
              className="rounded-full"
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}

      {/* Course List or Empty State */}
      {hasAnyCourses ? (
        filteredEnrollments.length > 0 ? (
          <div className="space-y-4">
            {filteredEnrollments.map((enrollment) => (
              <StudentCourseCard key={enrollment.id} enrollment={enrollment} viewAs={viewAs} />
            ))}
          </div>
        ) : (
          /* No filter results */
          <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-100 dark:bg-stone-800 mb-4">
              <BookOpen className="w-7 h-7 text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              No hay cursos con este filtro
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              Prueba con otro filtro o explora todos tus cursos.
            </p>
            <Button variant="outline" onClick={() => handleFilterChange('all')}>
              Ver todos los cursos
            </Button>
          </div>
        )
      ) : (
        /* No courses at all */
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-4">
            <GraduationCap className="w-7 h-7 text-[#143F3B] dark:text-[#6B9B7A]" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
            Aún no estás inscrito en ningún curso
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-md mx-auto">
            Explora nuestro catálogo de cursos de vino y comienza tu formación con los mejores educadores.
          </p>
          <Button asChild size="lg">
            <Link href="/#catalog">
              <Search className="w-4 h-4 mr-2" />
              Explorar Cursos
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
