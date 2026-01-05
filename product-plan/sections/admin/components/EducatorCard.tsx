import {
  BookOpen,
  Users,
  Calendar,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  Mail
} from 'lucide-react'
import type { Educator } from '@/../product/sections/admin/types'
import { useState } from 'react'

interface EducatorCardProps {
  educator: Educator
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-UY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function EducatorCard({ educator, onView, onEdit, onDelete }: EducatorCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [imgError, setImgError] = useState(false)

  const initials = educator.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()

  return (
    <div className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden transition-all duration-200 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-lg hover:shadow-teal-500/5">
      <div className="p-4">
        {/* Top Row: Image + Info + Menu */}
        <div className="flex gap-4 mb-4">
          {/* Profile Image */}
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
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center text-xl font-bold text-white">
                {initials}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 text-base leading-tight mb-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
              {educator.name}
            </h3>
            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium mb-1 truncate">
              {educator.title}
            </p>
            <a
              href={`mailto:${educator.email}`}
              className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors truncate"
            >
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{educator.email}</span>
            </a>
          </div>

          {/* Actions Menu */}
          <div className="flex-shrink-0 relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 w-36 py-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onView?.()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50"
                  >
                    <Eye className="w-4 h-4" />
                    Ver perfil
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit?.()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700/50"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete?.()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-2 mb-4">
          {educator.bio}
        </p>

        {/* Stats Row */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 text-center py-2 px-3 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
            <div className="flex items-center justify-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-500 dark:text-teal-400" />
              <span className="text-lg font-bold text-teal-700 dark:text-teal-300">
                {educator.coursesCount}
              </span>
            </div>
            <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70 uppercase tracking-wider mt-0.5">
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

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Desde {formatDate(educator.createdAt)}</span>
          </div>

          <button
            onClick={onView}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-md transition-colors"
          >
            Ver perfil
            <Eye className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
