'use client'

import { Globe, Lock } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterPreview } from '@/components/educator/filters'
import type { AudienceFilterWithEducator } from '@/types/audience-filter'
import {
  parseConditions,
  CONDITION_OPERATORS,
  CONDITION_PROPERTIES,
  COURSE_TYPE_OPTIONS,
  COURSE_MODALITY_OPTIONS,
  WSET_LEVEL_OPTIONS,
  DATE_RANGE_OPTIONS,
} from '@/types/audience-filter'
import type {
  FilterConditions,
  FilterCondition,
  DateRangeValue,
} from '@/types/audience-filter'

interface ViewFilterClientProps {
  filter: AudienceFilterWithEducator
}

function formatConditionValue(condition: FilterCondition): string {
  switch (condition.property) {
    case 'type': {
      const opt = COURSE_TYPE_OPTIONS[condition.value as keyof typeof COURSE_TYPE_OPTIONS]
      return opt?.label || String(condition.value)
    }
    case 'modality': {
      const opt = COURSE_MODALITY_OPTIONS[condition.value as keyof typeof COURSE_MODALITY_OPTIONS]
      return opt?.label || String(condition.value)
    }
    case 'wsetLevel': {
      const opt = WSET_LEVEL_OPTIONS.find((o) => o.value === condition.value)
      return opt?.label || `Nivel ${condition.value}`
    }
    case 'tags': {
      const tags = condition.value as string[]
      return tags.length > 0 ? tags.join(', ') : 'Sin tags'
    }
    case 'dateRange': {
      const dr = condition.value as DateRangeValue
      const typeLabel = DATE_RANGE_OPTIONS[dr.type]?.label || dr.type
      if (dr.type === 'last_months') return `${typeLabel}: ${dr.months || 6} meses`
      if (dr.type === 'before' || dr.type === 'after') return `${typeLabel} ${dr.date || ''}`
      if (dr.type === 'between') return `${typeLabel} ${dr.startDate || ''} y ${dr.endDate || ''}`
      return typeLabel
    }
    default:
      return String(condition.value)
  }
}

export function ViewFilterClient({ filter }: ViewFilterClientProps) {
  const conditions: FilterConditions = parseConditions(filter.conditions)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
      {/* Left column - Details */}
      <div className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Información del filtro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p>{filter.name}</p>
            </div>

            {filter.description && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Descripcion</p>
                <p>{filter.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {filter.isPublic ? (
                <Badge variant="secondary" className="gap-1">
                  <Globe className="h-3 w-3" />
                  Publico
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Privado
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conditions summary */}
        <Card>
          <CardHeader>
            <CardTitle>Condiciones del filtro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conditions.groups.map((group, groupIndex) => (
                <div key={group.id}>
                  {groupIndex > 0 && (
                    <div className="flex items-center justify-center py-3">
                      <div className="flex-1 border-t border-dashed" />
                      <span className="mx-4 text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        O
                      </span>
                      <div className="flex-1 border-t border-dashed" />
                    </div>
                  )}
                  <div className="space-y-2">
                    {group.conditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm"
                      >
                        <Badge variant="outline">
                          {CONDITION_OPERATORS[condition.operator]?.label}
                        </Badge>
                        <span className="text-muted-foreground">
                          {CONDITION_PROPERTIES[condition.property]?.label}:
                        </span>
                        <span className="font-medium">
                          {formatConditionValue(condition)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {conditions.groups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Este filtro no tiene condiciones configuradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column - Preview */}
      <div className="lg:sticky lg:top-4 lg:h-fit">
        <FilterPreview conditions={conditions} debounceMs={0} />
      </div>
    </div>
  )
}
