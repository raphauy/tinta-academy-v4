'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { FilterCard } from '@/components/educator/filters'
import { getFilterCountsBatchAction } from '@/app/educator/filters/actions'
import type { AudienceFilterWithEducator } from '@/types/audience-filter'

interface FiltersListClientProps {
  initialFilters: AudienceFilterWithEducator[]
  currentEducatorId: string
}

export function FiltersListClient({
  initialFilters,
  currentEducatorId,
}: FiltersListClientProps) {
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState('')
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({})
  const [loadingCounts, setLoadingCounts] = useState(true)
  const mountedRef = useRef(true)

  // Create a stable key from filter IDs to detect changes
  const filterIdsKey = initialFilters.map((f) => f.id).join(',')

  // Batch fetch all filter counts when filters change
  useEffect(() => {
    mountedRef.current = true
    setLoadingCounts(true)
    setFilterCounts({})
    setFilters(initialFilters)

    async function fetchCounts() {
      const filterIds = initialFilters.map((f) => f.id)
      if (filterIds.length === 0) {
        setLoadingCounts(false)
        return
      }

      const result = await getFilterCountsBatchAction(filterIds)

      if (!mountedRef.current) return

      if (result.success && result.data) {
        setFilterCounts(result.data)
      }
      setLoadingCounts(false)
    }

    fetchCounts()

    return () => {
      mountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filterIdsKey captures initialFilters changes
  }, [filterIdsKey])

  const filteredFilters = search
    ? filters.filter(
        (f) =>
          f.name.toLowerCase().includes(search.toLowerCase()) ||
          f.description?.toLowerCase().includes(search.toLowerCase())
      )
    : filters

  const ownFilters = filteredFilters.filter(
    (f) => f.educatorId === currentEducatorId
  )
  const publicFilters = filteredFilters.filter(
    (f) => f.educatorId !== currentEducatorId && f.isPublic
  )

  const handleDeleted = (filterId: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== filterId))
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar filtros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-background"
        />
      </div>

      {filteredFilters.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No hay filtros</h3>
          <p className="text-muted-foreground">
            {search
              ? 'No se encontraron filtros con esa búsqueda'
              : 'Crea tu primer filtro de audiencia para segmentar estudiantes'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Own filters */}
          {ownFilters.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Mis filtros</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {ownFilters.map((filter) => (
                  <FilterCard
                    key={filter.id}
                    filter={filter}
                    currentEducatorId={currentEducatorId}
                    studentCount={filterCounts[filter.id] ?? null}
                    loadingCount={loadingCounts}
                    onDeleted={() => handleDeleted(filter.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Public filters from others */}
          {publicFilters.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Filtros públicos</h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {publicFilters.map((filter) => (
                  <FilterCard
                    key={filter.id}
                    filter={filter}
                    currentEducatorId={currentEducatorId}
                    studentCount={filterCounts[filter.id] ?? null}
                    loadingCount={loadingCounts}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
