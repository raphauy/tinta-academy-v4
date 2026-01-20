'use client'

import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ConditionRow } from './condition-row'
import type { ConditionGroup as ConditionGroupType, FilterCondition } from '@/types/audience-filter'
import { createEmptyCondition } from '@/types/audience-filter'

interface TagOption {
  slug: string
  name: string
}

interface ConditionGroupProps {
  group: ConditionGroupType
  groupIndex: number
  onChange: (group: ConditionGroupType) => void
  onRemove: () => void
  canRemove: boolean
  tags: TagOption[]
}

export function ConditionGroup({
  group,
  groupIndex,
  onChange,
  onRemove,
  canRemove,
  tags,
}: ConditionGroupProps) {
  const handleConditionChange = (index: number, condition: FilterCondition) => {
    const newConditions = [...group.conditions]
    newConditions[index] = condition
    onChange({ ...group, conditions: newConditions })
  }

  const handleConditionRemove = (index: number) => {
    const newConditions = group.conditions.filter((_, i) => i !== index)
    onChange({ ...group, conditions: newConditions })
  }

  const handleAddCondition = () => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    })
  }

  return (
    <Card className="relative">
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="absolute right-2 top-2 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Grupo {groupIndex + 1}
          </span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
            Las condiciones se combinan con AND
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {group.conditions.map((condition, index) => (
          <div key={condition.id}>
            {index > 0 && (
              <div className="flex items-center justify-center py-1">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Y
                </span>
              </div>
            )}
            <ConditionRow
              condition={condition}
              onChange={(c) => handleConditionChange(index, c)}
              onRemove={() => handleConditionRemove(index)}
              canRemove={group.conditions.length > 1}
              tags={tags}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCondition}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar condición
        </Button>
      </CardContent>
    </Card>
  )
}
