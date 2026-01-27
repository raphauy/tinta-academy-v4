'use client'

import Link from 'next/link'
import { ChevronDown, MapPin, Video, Monitor, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MODALITY_OPTIONS = [
  {
    label: 'Presencial',
    href: '/educator/courses/create?modality=presencial',
    icon: MapPin,
    description: 'Curso con clases en ubicación física',
  },
  {
    label: 'Webinar',
    href: '/educator/courses/create?modality=webinar',
    icon: Video,
    description: 'Evento en vivo por Zoom/Meet',
  },
  {
    label: 'Online',
    href: '/educator/courses/create?modality=online',
    icon: Monitor,
    description: 'Curso asíncrono con materiales',
  },
]

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
