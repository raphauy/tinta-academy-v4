'use client'

import { Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  showFilters: boolean
  onToggleFilters: () => void
  activeFiltersCount?: number
}

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  showFilters,
  onToggleFilters,
  activeFiltersCount = 0,
}: SearchFilterBarProps) {
  const hasActiveFilters = activeFiltersCount > 0

  return (
    <div className="flex items-center gap-3">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card"
        />
      </div>

      {/* Filter Toggle */}
      <Button
        variant={showFilters || hasActiveFilters ? 'default' : 'outline'}
        onClick={onToggleFilters}
        className="gap-2 shrink-0"
      >
        <Filter size={18} />
        Filtros
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-verde-uva-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </Button>
    </div>
  )
}
