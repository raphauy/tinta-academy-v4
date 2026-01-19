'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Course {
  id: string
  title: string
}

interface Props {
  courses: Course[]
  currentCourseId?: string
  currentStatus?: string
}

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'scheduled', label: 'Programado' },
  { value: 'sending', label: 'Enviando' },
  { value: 'sent', label: 'Enviado' },
  { value: 'partially_sent', label: 'Parcialmente enviado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function CampaignHistoryFilters({
  courses,
  currentCourseId,
  currentStatus,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all' || !value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }

    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/educator/communications/history')
  }

  const hasFilters = currentCourseId || currentStatus

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={currentCourseId || 'all'}
        onValueChange={(value) => updateFilter('courseId', value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por curso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los cursos</SelectItem>
          {courses.map((course) => (
            <SelectItem key={course.id} value={course.id}>
              {course.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentStatus || 'all'}
        onValueChange={(value) => updateFilter('status', value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
