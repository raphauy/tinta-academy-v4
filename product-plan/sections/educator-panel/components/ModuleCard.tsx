import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Play,
  FileText,
  Clock
} from 'lucide-react'
import type { Module, Lesson } from '@/../product/sections/educator-panel/types'

interface ModuleCardProps {
  module: Module
  lessons: Lesson[]
  index: number
  onEdit?: () => void
  onDelete?: () => void
  onCreateLesson?: () => void
  onEditLesson?: (id: string) => void
  onDeleteLesson?: (id: string) => void
}

export function ModuleCard({
  module,
  lessons,
  index,
  onEdit,
  onDelete,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    if (mins < 60) return `${mins} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}min`
  }

  // Calculate total duration
  const totalDuration = lessons.reduce((acc, l) => acc + l.videoDuration, 0)

  return (
    <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
      {/* Module Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
        <button className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400 dark:text-stone-500">
              Módulo {index + 1}
            </span>
            <span className="text-xs text-stone-300 dark:text-stone-600">•</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {lessons.length} {lessons.length === 1 ? 'lección' : 'lecciones'}
            </span>
            {totalDuration > 0 && (
              <>
                <span className="text-xs text-stone-300 dark:text-stone-600">•</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {formatDuration(totalDuration)}
                </span>
              </>
            )}
          </div>
          <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
            {module.title}
          </h4>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            title="Editar módulo"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Eliminar módulo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lessons List */}
      {isExpanded && (
        <div className="p-2">
          {lessons.length > 0 ? (
            <div className="space-y-1">
              {lessons.map((lesson, lessonIndex) => (
                <div
                  key={lesson.id}
                  className="group flex items-center gap-3 px-3 py-2 bg-white dark:bg-stone-900 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <button className="p-0.5 text-stone-300 hover:text-stone-500 dark:text-stone-600 dark:hover:text-stone-400 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center w-6 h-6 rounded bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex-shrink-0">
                    <Play className="w-3 h-3 text-[#143F3B] dark:text-[#6B9B7A]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-900 dark:text-stone-100 truncate">
                      {lessonIndex + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(lesson.videoDuration)}
                      </span>
                      {lesson.resources.length > 0 && (
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {lesson.resources.length} {lesson.resources.length === 1 ? 'recurso' : 'recursos'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditLesson?.(lesson.id)}
                      className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors"
                      title="Editar lección"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteLesson?.(lesson.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Eliminar lección"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Add Lesson Button */}
          <button
            onClick={onCreateLesson}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-1 text-sm text-stone-500 dark:text-stone-400 hover:text-[#143F3B] dark:hover:text-[#6B9B7A] hover:bg-white dark:hover:bg-stone-900 rounded-lg border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-[#143F3B]/30 dark:hover:border-[#6B9B7A]/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar lección
          </button>
        </div>
      )}
    </div>
  )
}
