import { useState } from 'react'
import { Plus, Search, Mail } from 'lucide-react'
import type { EmailTemplateListProps } from '@/../product/sections/educator-panel/types'
import { EmailTemplateCard } from './EmailTemplateCard'

export function EmailTemplateList({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onCreate,
  onUseTemplate
}: EmailTemplateListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query) ||
      template.subject.toLowerCase().includes(query)
    )
  })

  // Sort by most used
  const sortedTemplates = [...filteredTemplates].sort((a, b) => b.usageCount - a.usageCount)

  return (
    <div className="p-6 pb-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-0.5">
            Templates de Email
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Plantillas reutilizables para comunicaciones con alumnos
          </p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Template</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 mb-6">
        <div className="flex items-center gap-2 px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg focus-within:ring-2 focus-within:ring-[#143F3B]/20 focus-within:border-[#143F3B] dark:focus-within:border-[#6B9B7A] transition-colors">
          <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 py-2 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredTemplates.length === templates.length
            ? `${templates.length} templates`
            : `${filteredTemplates.length} de ${templates.length} templates`}
        </p>
      </div>

      {/* Templates Grid */}
      {sortedTemplates.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedTemplates.map(template => (
            <EmailTemplateCard
              key={template.id}
              template={template}
              onEdit={() => onEdit?.(template.id)}
              onDelete={() => onDelete?.(template.id)}
              onDuplicate={() => onDuplicate?.(template.id)}
              onUseTemplate={() => onUseTemplate?.(template.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-stone-50 dark:bg-stone-900/50 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
          {searchQuery ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 dark:bg-stone-800 mb-3">
                <Search className="w-6 h-6 text-stone-400" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                No se encontraron templates
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                Intenta con otros términos de búsqueda
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm font-medium text-[#143F3B] dark:text-[#6B9B7A] hover:underline"
              >
                Limpiar búsqueda
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#143F3B]/10 dark:bg-[#143F3B]/20 mb-3">
                <Mail className="w-6 h-6 text-[#143F3B] dark:text-[#6B9B7A]" />
              </div>
              <h3 className="text-base font-medium text-stone-900 dark:text-stone-100 mb-1">
                Crea tu primer template
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-sm mx-auto">
                Los templates te permiten enviar comunicaciones consistentes y personalizadas a tus alumnos.
              </p>
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#143F3B] hover:bg-[#1a524d] text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Template</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
