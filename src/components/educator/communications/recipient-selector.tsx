'use client'

import { useState, useMemo } from 'react'
import { Users, UserCheck, Search, Filter, Globe, Lock, Loader2, ChevronDown } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { FilterForSelection } from '@/types/audience-filter'

const STUDENTS_PAGE_SIZE = 50

export interface CourseForSelection {
  id: string
  title: string
  slug: string
  studentCount: number
}

export interface StudentForSelection {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  courses: string[]
}

export interface RecipientValue {
  mode: 'course' | 'custom' | 'filter'
  courseId?: string
  studentIds: string[]
  filterId?: string
}

interface RecipientSelectorProps {
  courses: CourseForSelection[]
  students: StudentForSelection[]
  filters: FilterForSelection[]
  currentEducatorId: string
  value: RecipientValue
  onChange: (value: RecipientValue) => void
  // Filter count is managed by parent to avoid duplicate fetches
  filterCount?: number | null
  loadingFilterCount?: boolean
}

export function RecipientSelector({
  courses,
  students,
  filters,
  currentEducatorId,
  value,
  onChange,
  filterCount = null,
  loadingFilterCount = false,
}: RecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [displayLimit, setDisplayLimit] = useState(STUDENTS_PAGE_SIZE)

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students

    const query = searchQuery.toLowerCase()
    return students.filter((student) => {
      const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
      return (
        fullName.includes(query) ||
        student.email.toLowerCase().includes(query)
      )
    })
  }, [students, searchQuery])

  // Handler for search that also resets display limit
  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery)
    setDisplayLimit(STUDENTS_PAGE_SIZE)
  }

  // Paginated students for display
  const displayedStudents = useMemo(
    () => filteredStudents.slice(0, displayLimit),
    [filteredStudents, displayLimit]
  )

  const hasMoreStudents = filteredStudents.length > displayLimit
  const remainingStudents = filteredStudents.length - displayLimit

  const handleModeChange = (mode: 'course' | 'custom' | 'filter') => {
    onChange({
      mode,
      courseId: mode === 'course' ? value.courseId : undefined,
      studentIds: mode === 'custom' ? value.studentIds : [],
      filterId: mode === 'filter' ? value.filterId : undefined,
    })
  }

  const handleCourseChange = (courseId: string) => {
    onChange({
      ...value,
      courseId,
    })
  }

  const handleFilterChange = (filterId: string) => {
    onChange({
      ...value,
      filterId,
    })
  }

  const handleStudentToggle = (studentId: string, checked: boolean) => {
    const newStudentIds = checked
      ? [...value.studentIds, studentId]
      : value.studentIds.filter((id) => id !== studentId)

    onChange({
      ...value,
      studentIds: newStudentIds,
    })
  }

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map((s) => s.id)
    const currentIds = new Set(value.studentIds)
    const newIds = [...value.studentIds]

    for (const id of allFilteredIds) {
      if (!currentIds.has(id)) {
        newIds.push(id)
      }
    }

    onChange({
      ...value,
      studentIds: newIds,
    })
  }

  const handleDeselectAll = () => {
    const filteredIds = new Set(filteredStudents.map((s) => s.id))
    const newStudentIds = value.studentIds.filter((id) => !filteredIds.has(id))

    onChange({
      ...value,
      studentIds: newStudentIds,
    })
  }

  // Get selected count based on mode
  const selectedCount = useMemo(() => {
    if (value.mode === 'course' && value.courseId) {
      const course = courses.find((c) => c.id === value.courseId)
      return course?.studentCount || 0
    }
    if (value.mode === 'filter' && value.filterId) {
      return filterCount
    }
    return value.studentIds.length
  }, [value.mode, value.courseId, value.studentIds, courses, value.filterId, filterCount])

  const getStudentDisplayName = (student: StudentForSelection) => {
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    return student.email
  }

  // Separate own filters from public filters
  const ownFilters = filters.filter((f) => f.educatorId === currentEducatorId)
  const publicFilters = filters.filter(
    (f) => f.educatorId !== currentEducatorId && f.isPublic
  )

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value.mode}
        onValueChange={(v) => handleModeChange(v as 'course' | 'custom' | 'filter')}
        className="space-y-4"
      >
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="course" id="mode-course" />
            <Label
              htmlFor="mode-course"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Users className="h-4 w-4 text-muted-foreground" />
              Todos los estudiantes de un curso
            </Label>
          </div>

          {value.mode === 'course' && (
            <div className="ml-7 space-y-2">
              <Select
                value={value.courseId || ''}
                onValueChange={handleCourseChange}
              >
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Seleccionar curso..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <span className="flex items-center justify-between gap-4 w-full">
                        <span>{course.slug}</span>
                        <Badge variant="secondary" className="ml-2">
                          {course.studentCount} estudiantes
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Filter mode - second option */}
        {filters.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="filter" id="mode-filter" />
              <Label
                htmlFor="mode-filter"
                className="flex items-center gap-2 cursor-pointer"
              >
                <Filter className="h-4 w-4 text-muted-foreground" />
                Filtro de audiencia
              </Label>
            </div>

            {value.mode === 'filter' && (
              <div className="ml-7 space-y-2">
                <Select
                  value={value.filterId || ''}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Seleccionar filtro..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ownFilters.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Mis filtros
                        </div>
                        {ownFilters.map((filter) => (
                          <SelectItem key={filter.id} value={filter.id}>
                            <div className="flex items-center gap-2">
                              {filter.isPublic ? (
                                <Globe className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span>{filter.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {publicFilters.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          Filtros públicos
                        </div>
                        {publicFilters.map((filter) => (
                          <SelectItem key={filter.id} value={filter.id}>
                            <div className="flex items-center gap-2">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span>{filter.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({filter.educatorName})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {value.filterId && (
                  <p className="text-sm text-muted-foreground">
                    {loadingFilterCount ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Calculando estudiantes...
                      </span>
                    ) : filterCount !== null ? (
                      `${filterCount} estudiantes coinciden con este filtro`
                    ) : (
                      'Error al calcular estudiantes'
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="rounded-lg border p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="custom" id="mode-custom" />
            <Label
              htmlFor="mode-custom"
              className="flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              Selección personalizada
            </Label>
          </div>

          {value.mode === 'custom' && (
            <div className="ml-7 space-y-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  Seleccionar todos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                >
                  Deseleccionar todos
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cursos inscritos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          {searchQuery
                            ? 'No se encontraron estudiantes con esa búsqueda'
                            : 'No hay estudiantes disponibles'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={value.studentIds.includes(student.id)}
                              onCheckedChange={(checked) =>
                                handleStudentToggle(student.id, checked === true)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {getStudentDisplayName(student)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.email}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {student.courses.map((course, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {course}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Show more button */}
              {hasMoreStudents && (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {displayedStudents.length} de {filteredStudents.length} estudiantes
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDisplayLimit((prev) => prev + STUDENTS_PAGE_SIZE)}
                    className="gap-1"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Mostrar más ({remainingStudents > STUDENTS_PAGE_SIZE ? STUDENTS_PAGE_SIZE : remainingStudents} más)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </RadioGroup>

      {/* Selected count badge */}
      <div className="flex items-center gap-2 pt-2">
        {value.mode === 'filter' && loadingFilterCount ? (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Calculando...
          </Badge>
        ) : (
          <Badge variant={selectedCount !== null && selectedCount > 0 ? 'default' : 'secondary'}>
            {selectedCount ?? 0} {selectedCount === 1 ? 'destinatario' : 'destinatarios'} seleccionados
          </Badge>
        )}
      </div>
    </div>
  )
}
