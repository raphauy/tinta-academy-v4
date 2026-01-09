'use client'

import { useState, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Eye, X, Check, ChevronsUpDown } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { StudentForSelection } from '@/services/student-service'

interface ViewAsBannerProps {
  currentStudent: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  } | null
  availableStudents: StudentForSelection[]
  isViewingAs: boolean
}

function getStudentDisplayName(student: {
  firstName: string | null
  lastName: string | null
  user: { name: string | null; email: string }
}) {
  const name = `${student.firstName || ''} ${student.lastName || ''}`.trim()
  return name || student.user.name || student.user.email
}

export function ViewAsBanner({
  currentStudent,
  availableStudents,
  isViewingAs,
}: ViewAsBannerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const currentStudentName = useMemo(() => {
    if (!currentStudent) return null
    const name = `${currentStudent.firstName || ''} ${currentStudent.lastName || ''}`.trim()
    return name || currentStudent.email
  }, [currentStudent])

  const handleSelectStudent = (studentId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('viewAs', studentId)
    router.push(`${pathname}?${params.toString()}`)
    setOpen(false)
  }

  const handleExitViewAs = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('viewAs')
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 max-w-screen-xl mx-auto px-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Eye className="size-4 shrink-0" />
          <span className="text-sm font-medium">
            {isViewingAs ? 'Viendo como:' : 'Seleccionar estudiante:'}
          </span>
        </div>

        <div className="flex flex-1 items-center gap-2 min-w-0">
          {/* Student Selector */}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between bg-white dark:bg-stone-900 border-amber-300 dark:border-amber-700 min-w-0 max-w-md"
              >
                <span className={cn('truncate', !currentStudentName && 'text-muted-foreground')}>
                  {currentStudentName || 'Seleccionar estudiante...'}
                </span>
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar estudiante..." />
                <CommandList>
                  <CommandEmpty>No se encontraron estudiantes.</CommandEmpty>
                  <CommandGroup>
                    {availableStudents.map((student) => {
                      const displayName = getStudentDisplayName(student)
                      return (
                        <CommandItem
                          key={student.id}
                          value={`${displayName} ${student.user.email}`}
                          onSelect={() => handleSelectStudent(student.id)}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              currentStudent?.id === student.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="truncate">{displayName}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              {student.user.email}
                            </span>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Exit Button */}
          {isViewingAs && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExitViewAs}
              className="shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
            >
              <X className="size-4 mr-1" />
              Salir
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
