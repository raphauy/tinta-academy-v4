'use client'

import { useState, useMemo } from 'react'
import { Users, UserCheck, Search } from 'lucide-react'

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

export interface CourseForSelection {
  id: string
  title: string
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
  mode: 'course' | 'custom'
  courseId?: string
  studentIds: string[]
}

interface RecipientSelectorProps {
  courses: CourseForSelection[]
  students: StudentForSelection[]
  value: RecipientValue
  onChange: (value: RecipientValue) => void
}

export function RecipientSelector({
  courses,
  students,
  value,
  onChange,
}: RecipientSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleModeChange = (mode: 'course' | 'custom') => {
    onChange({
      mode,
      courseId: mode === 'course' ? value.courseId : undefined,
      studentIds: mode === 'custom' ? value.studentIds : [],
    })
  }

  const handleCourseChange = (courseId: string) => {
    onChange({
      ...value,
      courseId,
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
    return value.studentIds.length
  }, [value.mode, value.courseId, value.studentIds, courses])

  const getStudentDisplayName = (student: StudentForSelection) => {
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    return student.email
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value.mode}
        onValueChange={(v) => handleModeChange(v as 'course' | 'custom')}
        className="space-y-3"
      >
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
      </RadioGroup>

      {/* Course selection mode */}
      {value.mode === 'course' && (
        <div className="ml-7 space-y-2">
          <Select value={value.courseId || ''} onValueChange={handleCourseChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Seleccionar curso..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  <span className="flex items-center justify-between gap-4 w-full">
                    <span>{course.title}</span>
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

      {/* Custom selection mode */}
      {value.mode === 'custom' && (
        <div className="ml-7 space-y-4">
          {/* Search input */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Select/Deselect all buttons */}
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

          {/* Students table */}
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
                  filteredStudents.map((student) => (
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
        </div>
      )}

      {/* Selected count badge */}
      <div className="flex items-center gap-2 pt-2">
        <Badge variant={selectedCount > 0 ? 'default' : 'secondary'}>
          {selectedCount} {selectedCount === 1 ? 'destinatario' : 'destinatarios'} seleccionados
        </Badge>
      </div>
    </div>
  )
}
