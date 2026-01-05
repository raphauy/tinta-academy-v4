import { useState } from 'react'
import {
  Search,
  Download,
  ArrowUpDown,
  ChevronDown,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react'
import type { StudentListProps } from '@/../product/sections/educator-panel/types'
import { StudentRow } from './StudentRow'

type SortField = 'name' | 'progress' | 'enrolledAt' | 'lastAccessAt'
type SortOrder = 'asc' | 'desc'

export function StudentList({
  course,
  students,
  onViewStudent,
  onEmailStudent,
  onExport
}: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('progress')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Calculate aggregate stats
  const completedStudents = students.filter(s => s.progress === 100).length
  const averageProgress = students.length > 0
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
    : 0
  const activeThisWeek = students.filter(s => {
    const lastAccess = new Date(s.lastAccessAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return lastAccess >= weekAgo
  }).length

  // Filter students
  const filteredStudents = students.filter(student => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    )
  })

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'progress':
        comparison = a.progress - b.progress
        break
      case 'enrolledAt':
        comparison = new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime()
        break
      case 'lastAccessAt':
        comparison = new Date(a.lastAccessAt).getTime() - new Date(b.lastAccessAt).getTime()
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
    setShowSortMenu(false)
  }

  const sortLabels: Record<SortField, string> = {
    name: 'Nombre',
    progress: 'Progreso',
    enrolledAt: 'Fecha inscripción',
    lastAccessAt: 'Último acceso'
  }

  return (
    <div className="p-6 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
          Alumnos de {course.title}
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestiona los alumnos inscritos en este curso
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#143F3B]/10 dark:bg-[#143F3B]/20">
              <Users className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{students.length}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Total inscritos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{completedStudents}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Completaron</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{averageProgress}%</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Progreso promedio</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{activeThisWeek}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Activos esta semana</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus-within:ring-2 focus-within:ring-[#143F3B]/20 focus-within:border-[#143F3B] dark:focus-within:border-[#6B9B7A] transition-colors">
            <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 py-2 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">{sortLabels[sortField]}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSortMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 py-1">
                  {(Object.keys(sortLabels) as SortField[]).map((field) => (
                    <button
                      key={field}
                      onClick={() => handleSort(field)}
                      className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                        sortField === field
                          ? 'bg-[#143F3B]/10 text-[#143F3B] dark:bg-[#143F3B]/20 dark:text-[#6B9B7A]'
                          : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                      }`}
                    >
                      {sortLabels[field]}
                      {sortField === field && (
                        <span className="text-xs opacity-70">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredStudents.length === students.length
            ? `${students.length} alumnos`
            : `${filteredStudents.length} de ${students.length} alumnos`}
        </p>
      </div>

      {/* Students Table */}
      {sortedStudents.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {/* Table Header - Desktop */}
          <div className="hidden lg:flex lg:items-center gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="flex-1 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Alumno
            </div>
            <div className="w-32 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Progreso
            </div>
            <div className="w-28 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Inscripción
            </div>
            <div className="w-28 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Último acceso
            </div>
            <div className="w-20 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          {/* Student Rows */}
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {sortedStudents.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                onView={() => onViewStudent?.(student.id)}
                onEmail={() => onEmailStudent?.(student.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
          {searchQuery ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                No se encontraron alumnos
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Intenta con otros términos de búsqueda
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                <Users className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                Sin alumnos inscritos
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Este curso aún no tiene alumnos inscritos
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
