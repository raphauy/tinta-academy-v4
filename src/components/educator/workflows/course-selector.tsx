'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CourseForWorkflow } from '@/services/workflow-execution-service'

type Course = CourseForWorkflow

interface CourseSelectorProps {
  courses: Course[]
  selectedCourseId: string | null
  onSelect: (course: Course | null) => void
  disabled?: boolean
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return format(new Date(date), 'd MMM yyyy', { locale: es })
}

function getCourseDateSummary(course: Course): string[] {
  const summary: string[] = []
  if (course.startDate) summary.push(`Inicio: ${formatDate(course.startDate)}`)
  if (course.classDates.length > 0) summary.push(`${course.classDates.length} clases`)
  if (course.examDate) summary.push('Con examen')
  return summary
}

export function CourseSelector({
  courses,
  selectedCourseId,
  onSelect,
  disabled,
}: CourseSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10"
          disabled={disabled}
        >
          {selectedCourse ? (
            <div className="flex flex-col items-start gap-1">
              <span className="font-medium">{selectedCourse.title}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedCourse.enrolledCount} inscritos
                </span>
                {selectedCourse.startDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedCourse.startDate)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Selecciona un curso...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar curso..." />
          <CommandList>
            <CommandEmpty>No se encontraron cursos.</CommandEmpty>
            <CommandGroup>
              {courses.map((course) => (
                <CommandItem
                  key={course.id}
                  value={course.title}
                  onSelect={() => {
                    onSelect(course.id === selectedCourseId ? null : course)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex items-center gap-2 w-full">
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        selectedCourseId === course.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <span className="font-medium flex-1">{course.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {course.enrolledCount}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-6">
                    {getCourseDateSummary(course).map((item, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs font-normal"
                      >
                        {item}
                      </Badge>
                    ))}
                    {getCourseDateSummary(course).length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        Sin fechas configuradas
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
