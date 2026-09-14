'use client'

import Link from 'next/link'
import { ChevronDown, Plus } from 'lucide-react'
import type { CourseModality } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { COURSE_MODALITIES, MODALITY_LABELS } from '@/lib/course-modality'
import { MODALITY_ICONS } from '@/components/course/modality-icons'

const MODALITY_DESCRIPTIONS: Record<CourseModality, string> = {
  presencial: 'Curso con clases en ubicación física',
  semipresencial: 'Clases presenciales y virtuales + contenido grabado',
  webinar: 'Evento en vivo por Zoom/Meet',
  online: 'Curso asíncrono con materiales',
}

const MODALITY_OPTIONS = COURSE_MODALITIES.map((modality) => ({
  label: MODALITY_LABELS[modality],
  href: `/educator/courses/create?modality=${modality}`,
  icon: MODALITY_ICONS[modality],
  description: MODALITY_DESCRIPTIONS[modality],
}))

export function CreateCourseDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear Curso
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {MODALITY_OPTIONS.map((option) => (
          <DropdownMenuItem key={option.label} asChild>
            <Link href={option.href} className="flex items-start gap-3 py-2 cursor-pointer">
              <option.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
