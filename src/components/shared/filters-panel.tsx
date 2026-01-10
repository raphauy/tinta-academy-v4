'use client'

import { X, Monitor, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterButton } from './filter-button'

export interface StatusOption {
  value: string
  label: string
}

export interface FiltersPanelConfig {
  // Status filter (for educator)
  showStatus?: boolean
  currentStatus?: string
  onStatusChange?: (status: string) => void
  statusOptions?: StatusOption[] // Custom status options, defaults to educator statuses

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

const DEFAULT_STATUS_OPTIONS: StatusOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'finished', label: 'Finalizado' },
]

export function FiltersPanel({
  showStatus = false,
  currentStatus = 'all',
  onStatusChange,
  statusOptions = DEFAULT_STATUS_OPTIONS,

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
  // Calculate grid columns based on visible filters (2 columns for better readability)
  const visibleFilters = [showStatus, showModality, showType, showTags].filter(Boolean).length
  const gridCols = visibleFilters <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-2'

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
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

        {/* Status filter */}
        {showStatus && onStatusChange && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <FilterButton
                  key={option.value}
                  active={currentStatus === option.value}
                  onClick={() => onStatusChange(option.value)}
                >
                  {option.label}
                </FilterButton>
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
