import { useState } from 'react'
import { MoreHorizontal, Pencil, Copy, Trash2, Send, Mail } from 'lucide-react'
import type { EmailTemplate } from '@/../product/sections/educator-panel/types'

interface EmailTemplateCardProps {
  template: EmailTemplate
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onUseTemplate?: () => void
}

export function EmailTemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onUseTemplate
}: EmailTemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Truncate body preview
  const getBodyPreview = (body: string, maxLength = 120) => {
    const cleaned = body.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
    if (cleaned.length <= maxLength) return cleaned
    return cleaned.slice(0, maxLength).trim() + '...'
  }

  return (
    <div className="group bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#143F3B]/10 dark:bg-[#143F3B]/20 flex-shrink-0">
            <Mail className="w-5 h-5 text-[#143F3B] dark:text-[#6B9B7A]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
              {template.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Usado {template.usageCount} {template.usageCount === 1 ? 'vez' : 'veces'}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    onEdit?.()
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDuplicate?.()
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>
                <button
                  onClick={() => {
                    onUseTemplate?.()
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Usar en campaña
                </button>
                <hr className="my-1 border-stone-200 dark:border-stone-700" />
                <button
                  onClick={() => {
                    onDelete?.()
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="mb-3">
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Asunto:</p>
        <p className="text-sm text-stone-800 dark:text-stone-200 font-medium">
          {template.subject}
        </p>
      </div>

      {/* Body Preview */}
      <div className="mb-4">
        <p className="text-xs text-stone-500 dark:text-stone-400 mb-1">Vista previa:</p>
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          {getBodyPreview(template.body)}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
        {/* Variables */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {template.variables.map(variable => (
            <span
              key={variable}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            >
              {`{{${variable}}}`}
            </span>
          ))}
        </div>

        {/* Date */}
        <span className="text-xs text-stone-400 dark:text-stone-500 flex-shrink-0 ml-2">
          {formatDate(template.createdAt)}
        </span>
      </div>
    </div>
  )
}
