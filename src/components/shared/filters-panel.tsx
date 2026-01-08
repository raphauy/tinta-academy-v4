'use client'

import { X, Monitor, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterButton } from './filter-button'

export interface FiltersPanelConfig {
  // Status filter (for educator)
  showStatus?: boolean
  currentStatus?: string
  onStatusChange?: (status: string) => void

  // Modality filter
  showModality?: boolean
  currentModality?: string
  onModalityChange?: (modality: string | undefined) => void

  // Type filter
  showType?: boolean
  currentType?: string
  onTypeChange?: (type: string) => void

  // Tags filter
  showTags?: boolean
  tags?: { id: string; name: string }[]
  selectedTagIds?: string[]
  onTagToggle?: (tagId: string) => void

  // Clear all
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function FiltersPanel({
  showStatus = false,
  currentStatus = 'all',
  onStatusChange,

  showModality = false,
  currentModality,
  onModalityChange,

  showType = true,
  currentType = 'all',
  onTypeChange,

  showTags = false,
  tags = [],
  selectedTagIds = [],
  onTagToggle,

  hasActiveFilters,
  onClearFilters,
}: FiltersPanelConfig) {
  // Calculate grid columns based on visible filters
  const visibleFilters = [showStatus, showModality, showType, showTags].filter(Boolean).length
  const gridCols = visibleFilters <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
        {/* Status filter (educator specific) */}
        {showStatus && onStatusChange && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={currentStatus === 'all'}
                onClick={() => onStatusChange('all')}
              >
                Todos
              </FilterButton>
              <FilterButton
                active={currentStatus === 'draft'}
                onClick={() => onStatusChange('draft')}
              >
                Borrador
              </FilterButton>
              <FilterButton
                active={currentStatus === 'published'}
                onClick={() => onStatusChange('published')}
              >
                Publicado
              </FilterButton>
              <FilterButton
                active={currentStatus === 'finished'}
                onClick={() => onStatusChange('finished')}
              >
                Finalizado
              </FilterButton>
            </div>
          </div>
        )}

        {/* Modality filter */}
        {showModality && onModalityChange && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Modalidad
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={!currentModality}
                onClick={() => onModalityChange(undefined)}
              >
                Todas
              </FilterButton>
              <FilterButton
                active={currentModality === 'presencial'}
                onClick={() => onModalityChange('presencial')}
                icon={<MapPin size={14} />}
              >
                Presencial
              </FilterButton>
              <FilterButton
                active={currentModality === 'online'}
                onClick={() => onModalityChange('online')}
                icon={<Monitor size={14} />}
              >
                Online
              </FilterButton>
            </div>
          </div>
        )}

        {/* Type filter */}
        {showType && onTypeChange && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Tipo de curso
            </label>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                active={currentType === 'all' || !currentType}
                onClick={() => onTypeChange('all')}
              >
                Todos
              </FilterButton>
              <FilterButton
                active={currentType === 'wset'}
                onClick={() => onTypeChange('wset')}
              >
                WSET
              </FilterButton>
              <FilterButton
                active={currentType === 'taller'}
                onClick={() => onTypeChange('taller')}
              >
                Taller
              </FilterButton>
              <FilterButton
                active={currentType === 'cata'}
                onClick={() => onTypeChange('cata')}
              >
                Cata
              </FilterButton>
              <FilterButton
                active={currentType === 'curso'}
                onClick={() => onTypeChange('curso')}
              >
                Curso
              </FilterButton>
            </div>
          </div>
        )}

        {/* Tags filter */}
        {showTags && tags.length > 0 && onTagToggle && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Temas
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Button
                  key={tag.id}
                  variant={selectedTagIds.includes(tag.id) ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => onTagToggle(tag.id)}
                  className={selectedTagIds.includes(tag.id) ? 'bg-verde-uva-500 text-white hover:bg-verde-uva-500/80' : ''}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 text-muted-foreground hover:text-primary"
          >
            <X size={16} />
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
