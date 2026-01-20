'use client'

import { Globe, Lock } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { FilterForSelection } from '@/types/audience-filter'

interface FilterSelectorProps {
  filters: FilterForSelection[]
  value: string | undefined
  onChange: (filterId: string | undefined) => void
  currentEducatorId: string
}

export function FilterSelector({
  filters,
  value,
  onChange,
  currentEducatorId,
}: FilterSelectorProps) {
  // Separate own filters from public filters
  const ownFilters = filters.filter((f) => f.educatorId === currentEducatorId)
  const publicFilters = filters.filter(
    (f) => f.educatorId !== currentEducatorId && f.isPublic
  )

  const handleChange = (newValue: string) => {
    if (newValue === '__none__') {
      onChange(undefined)
    } else {
      onChange(newValue)
    }
  }

  return (
    <Select
      value={value || '__none__'}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleccionar filtro..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">
          <span className="text-muted-foreground">Sin filtro</span>
        </SelectItem>

        {ownFilters.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Mis filtros
            </div>
            {ownFilters.map((filter) => (
              <SelectItem key={filter.id} value={filter.id}>
                <div className="flex items-center gap-2">
                  {filter.isPublic ? (
                    <Globe className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span>{filter.name}</span>
                </div>
              </SelectItem>
            ))}
          </>
        )}

        {publicFilters.length > 0 && (
          <>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Filtros públicos
            </div>
            {publicFilters.map((filter) => (
              <SelectItem key={filter.id} value={filter.id}>
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span>{filter.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({filter.educatorName})
                  </span>
                </div>
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
