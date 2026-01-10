'use client'

import { useState } from 'react'
import {
  BookOpen,
  Users,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { EducatorWithStats } from '@/services/educator-service'

interface EducatorCardProps {
  educator: EducatorWithStats
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function EducatorCard({
  educator,
  onView,
  onEdit,
  onDelete,
}: EducatorCardProps) {
  const [imgError, setImgError] = useState(false)

  const initials = educator.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-[#143F3B]/30 dark:hover:border-[#6B9B7A]/30 hover:shadow-lg hover:shadow-[#143F3B]/5 h-full">
      <div className="p-4 h-full flex flex-col">
        <div className="flex gap-4 mb-4">
          <div className="flex-shrink-0">
            {educator.imageUrl && !imgError ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src={educator.imageUrl}
                  alt={educator.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#143F3B] to-[#1e5a54] flex items-center justify-center text-xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base leading-tight mb-0.5 group-hover:text-[#143F3B] dark:group-hover:text-[#6B9B7A] transition-colors truncate">
              {educator.name}
            </h3>
            {educator.title && (
              <p className="text-sm text-[#143F3B] dark:text-[#6B9B7A] font-medium mb-1 truncate">
                {educator.title}
              </p>
            )}
            <a
              href={`mailto:${educator.user.email}`}
              className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] transition-colors truncate"
            >
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{educator.user.email}</span>
            </a>
          </div>

          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {educator.bio && (
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4 flex-1">
            {educator.bio}
          </p>
        )}

        <div className="flex gap-3 mb-4">
          <div className="flex-1 text-center py-2 px-3 rounded-lg bg-[#143F3B]/10 dark:bg-[#143F3B]/20 border border-[#143F3B]/20 dark:border-[#143F3B]/30">
            <div className="flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#143F3B] dark:text-[#6B9B7A]" />
              <span className="text-lg font-bold text-[#143F3B] dark:text-[#6B9B7A]">
                {educator.coursesCount}
              </span>
            </div>
            <p className="text-[10px] text-[#143F3B]/70 dark:text-[#6B9B7A]/70 uppercase tracking-wider mt-0.5">
              Cursos
            </p>
          </div>

          <div className="flex-1 text-center py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center justify-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {educator.studentsCount}
              </span>
            </div>
            <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mt-0.5">
              Alumnos
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-auto border-t border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Desde {formatDate(educator.createdAt)}</span>
          </div>

          <Button variant="ghost" size="sm" onClick={onView} className="h-7 px-2 text-xs">
            Ver perfil
            <Eye className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
