'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Check, ChevronsUpDown, X, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { EnrollmentStatus } from '@prisma/client'

// Type matching what getEducatorStudents returns (students with enrollments)
type StudentWithEnrollments = {
  id: string
  firstName: string | null
  lastName: string | null
  user: {
    email: string
    name: string | null
    image: string | null
  }
  enrollments: {
    id: string
    enrolledAt: Date
    status: EnrollmentStatus
    course: {
      id: string
      title: string
      slug: string
    }
  }[]
}

type CourseOption = {
  id: string
  title: string
  slug: string
}

interface AllStudentsListProps {
  students: StudentWithEnrollments[]
  courses: CourseOption[]
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const first = firstName?.[0]?.toUpperCase() || ''
  const last = lastName?.[0]?.toUpperCase() || ''
  return first + last || '??'
}

export function AllStudentsList({ students, courses }: AllStudentsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseFilterOpen, setCourseFilterOpen] = useState(false)

  // Get selected course
  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  // Filter students
  const filteredStudents = useMemo(() => {
    let result = students

    // Filter by course
    if (selectedCourseId) {
      result = result.filter((student) =>
        student.enrollments.some((e) => e.course.id === selectedCourseId)
      )
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((student) => {
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase()
        const email = student.user.email.toLowerCase()
        return fullName.includes(query) || email.includes(query)
      })
    }

    return result
  }, [students, selectedCourseId, searchQuery])

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Estudiantes</h1>
        <p className="text-muted-foreground">
          {students.length} estudiante{students.length !== 1 ? 's' : ''} en {courses.length} curso{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row gap-4 min-w-0">
        {/* Search */}
        <div className="relative xl:flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Course filter */}
        <Popover open={courseFilterOpen} onOpenChange={setCourseFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={courseFilterOpen}
              className="w-full xl:flex-1 min-w-0 justify-between bg-background"
            >
              {selectedCourse ? (
                <span className="truncate">{selectedCourse.title}</span>
              ) : (
                <span className="text-muted-foreground">Todos los cursos</span>
              )}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar curso..." />
              <CommandList>
                <CommandEmpty>No se encontraron cursos.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="all"
                    onSelect={() => {
                      setSelectedCourseId(null)
                      setCourseFilterOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        selectedCourseId === null ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    Todos los cursos
                  </CommandItem>
                  {courses.map((course) => (
                    <CommandItem
                      key={course.id}
                      value={`${course.title} ${course.slug}`}
                      onSelect={() => {
                        setSelectedCourseId(course.id)
                        setCourseFilterOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 size-4',
                          selectedCourseId === course.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{course.title}</span>
                        <span className="text-xs text-muted-foreground truncate">{course.slug}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear filter button */}
        {(searchQuery || selectedCourseId) && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchQuery('')
              setSelectedCourseId(null)
            }}
            className="shrink-0"
          >
            <X className="size-4" />
            <span className="sr-only">Limpiar filtros</span>
          </Button>
        )}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''}
        {selectedCourse && ` en "${selectedCourse.title}"`}
      </p>

      {/* Student List */}
      {students.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Aún no hay estudiantes inscritos
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cuando los estudiantes se inscriban en tus cursos, aparecerán aquí.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No se encontraron estudiantes
          </h3>
          <p className="text-muted-foreground">
            No hay estudiantes que coincidan con tu búsqueda.
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Estudiante</TableHead>
                <TableHead>Cursos</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Sin nombre'
                const initials = getInitials(student.firstName, student.lastName)

                return (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {student.user.image ? (
                          <Image
                            src={student.user.image}
                            alt={fullName}
                            width={40}
                            height={40}
                            className="hidden sm:block size-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="hidden sm:flex size-10 rounded-full bg-verde-uva-100 items-center justify-center text-sm font-semibold text-verde-uva-700 shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium truncate">{fullName}</span>
                          <span className="text-sm text-muted-foreground truncate">
                            {student.user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {student.enrollments.map((enrollment) => (
                          <Link
                            key={enrollment.id}
                            href={`/educator/courses/${enrollment.course.id}/students`}
                          >
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-verde-uva-200 transition-colors text-xs rounded-md"
                            >
                              {enrollment.course.slug}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`mailto:${student.user.email}`}
                        className="p-2 rounded-lg hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        title="Enviar email"
                      >
                        <Mail className="size-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
