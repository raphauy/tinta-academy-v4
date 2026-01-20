'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConditionGroup } from './condition-group'
import type {
  FilterConditions,
  ConditionGroup as ConditionGroupType,
} from '@/types/audience-filter'
import { createEmptyGroup } from '@/types/audience-filter'

interface TagOption {
  slug: string
  name: string
}

interface FilterBuilderProps {
  conditions: FilterConditions
  onChange: (conditions: FilterConditions) => void
  tags: TagOption[]
}

export function FilterBuilder({
  conditions,
  onChange,
  tags,
}: FilterBuilderProps) {
  const handleGroupChange = (index: number, group: ConditionGroupType) => {
    const newGroups = [...conditions.groups]
    newGroups[index] = group
    onChange({ ...conditions, groups: newGroups })
  }

  const handleGroupRemove = (index: number) => {
    const newGroups = conditions.groups.filter((_, i) => i !== index)
    onChange({ ...conditions, groups: newGroups })
  }

  const handleAddGroup = () => {
    onChange({
      ...conditions,
      groups: [...conditions.groups, createEmptyGroup()],
    })
  }

  return (
    <div className="space-y-4">
      {conditions.groups.map((group, index) => (
        <div key={group.id}>
          {index > 0 && (
            <div className="flex items-center justify-center py-3">
              <div className="flex-1 border-t border-dashed" />
              <span className="mx-4 text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                O
              </span>
              <div className="flex-1 border-t border-dashed" />
            </div>
          )}
          <ConditionGroup
            group={group}
            groupIndex={index}
            onChange={(g) => handleGroupChange(index, g)}
            onRemove={() => handleGroupRemove(index)}
            canRemove={conditions.groups.length > 1}
            tags={tags}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={handleAddGroup}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar grupo (O)
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Los grupos se combinan con OR (cualquier grupo que coincida incluye al estudiante)
      </p>
    </div>
  )
}
