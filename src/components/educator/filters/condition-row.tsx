'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  FilterCondition,
  ConditionOperator,
  ConditionProperty,
  DateRangeValue,
  DateRangeType,
} from '@/types/audience-filter'
import {
  CONDITION_OPERATORS,
  CONDITION_PROPERTIES,
  DATE_RANGE_OPTIONS,
  COURSE_TYPE_OPTIONS,
  COURSE_MODALITY_OPTIONS,
  WSET_LEVEL_OPTIONS,
} from '@/types/audience-filter'

interface TagOption {
  slug: string
  name: string
}

interface ConditionRowProps {
  condition: FilterCondition
  onChange: (condition: FilterCondition) => void
  onRemove: () => void
  canRemove: boolean
  tags: TagOption[]
}

export function ConditionRow({
  condition,
  onChange,
  onRemove,
  canRemove,
  tags,
}: ConditionRowProps) {
  const handleOperatorChange = (operator: ConditionOperator) => {
    onChange({ ...condition, operator })
  }

  const handlePropertyChange = (property: ConditionProperty) => {
    // Reset value when property changes
    let defaultValue: FilterCondition['value']

    switch (property) {
      case 'type':
        defaultValue = 'wset'
        break
      case 'modality':
        defaultValue = 'presencial'
        break
      case 'wsetLevel':
        defaultValue = 1
        break
      case 'tags':
        defaultValue = []
        break
      case 'dateRange':
        defaultValue = { type: 'this_year' } as DateRangeValue
        break
    }

    onChange({ ...condition, property, value: defaultValue })
  }

  const handleValueChange = (value: FilterCondition['value']) => {
    onChange({ ...condition, value })
  }

  return (
    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
      {/* Operator selector */}
      <Select
        value={condition.operator}
        onValueChange={(v) => handleOperatorChange(v as ConditionOperator)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CONDITION_OPERATORS).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Property selector */}
      <Select
        value={condition.property}
        onValueChange={(v) => handlePropertyChange(v as ConditionProperty)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CONDITION_PROPERTIES).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value selector - dynamic based on property */}
      <div className="flex-1 min-w-[200px]">
        <ValueSelector
          property={condition.property}
          value={condition.value}
          onChange={handleValueChange}
          tags={tags}
        />
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface ValueSelectorProps {
  property: ConditionProperty
  value: FilterCondition['value']
  onChange: (value: FilterCondition['value']) => void
  tags: TagOption[]
}

function ValueSelector({ property, value, onChange, tags }: ValueSelectorProps) {
  switch (property) {
    case 'type':
      return (
        <Select
          value={value as string}
          onValueChange={(v) => onChange(v as FilterCondition['value'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COURSE_TYPE_OPTIONS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'modality':
      return (
        <Select
          value={value as string}
          onValueChange={(v) => onChange(v as FilterCondition['value'])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar modalidad..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COURSE_MODALITY_OPTIONS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'wsetLevel':
      return (
        <Select
          value={String(value as number)}
          onValueChange={(v) => onChange(parseInt(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar nivel..." />
          </SelectTrigger>
          <SelectContent>
            {WSET_LEVEL_OPTIONS.map(({ value: v, label }) => (
              <SelectItem key={v} value={String(v)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case 'tags':
      return (
        <TagsSelector
          selectedTags={value as string[]}
          availableTags={tags}
          onChange={(tags) => onChange(tags)}
        />
      )

    case 'dateRange':
      return (
        <DateRangeSelector
          value={value as DateRangeValue}
          onChange={onChange}
        />
      )

    default:
      return null
  }
}

interface TagsSelectorProps {
  selectedTags: string[]
  availableTags: TagOption[]
  onChange: (tags: string[]) => void
}

function TagsSelector({
  selectedTags,
  availableTags,
  onChange,
}: TagsSelectorProps) {
  const handleTagToggle = (slug: string) => {
    if (selectedTags.includes(slug)) {
      onChange(selectedTags.filter((t) => t !== slug))
    } else {
      onChange([...selectedTags, slug])
    }
  }

  if (availableTags.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No hay tags disponibles
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-1">
      {availableTags.map((tag) => (
        <Button
          key={tag.slug}
          type="button"
          variant={selectedTags.includes(tag.slug) ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleTagToggle(tag.slug)}
        >
          {tag.name}
        </Button>
      ))}
    </div>
  )
}

interface DateRangeSelectorProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
}

function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const handleTypeChange = (type: DateRangeType) => {
    // Reset to default values for the new type
    const newValue: DateRangeValue = { type }

    if (type === 'last_months') {
      newValue.months = 6
    } else if (type === 'before' || type === 'after') {
      newValue.date = new Date().toISOString().split('T')[0]
    } else if (type === 'between') {
      const now = new Date()
      const yearAgo = new Date()
      yearAgo.setFullYear(yearAgo.getFullYear() - 1)
      newValue.startDate = yearAgo.toISOString().split('T')[0]
      newValue.endDate = now.toISOString().split('T')[0]
    }

    onChange(newValue)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value.type}
        onValueChange={(v) => handleTypeChange(v as DateRangeType)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DATE_RANGE_OPTIONS).map(([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.type === 'last_months' && (
        <Input
          type="number"
          min={1}
          max={60}
          className="w-[80px]"
          value={value.months || 6}
          onChange={(e) =>
            onChange({ ...value, months: parseInt(e.target.value) || 6 })
          }
        />
      )}

      {(value.type === 'before' || value.type === 'after') && (
        <Input
          type="date"
          className="w-[160px]"
          value={value.date || ''}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
        />
      )}

      {value.type === 'between' && (
        <>
          <Input
            type="date"
            className="w-[150px]"
            value={value.startDate || ''}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          />
          <span className="text-sm text-muted-foreground">y</span>
          <Input
            type="date"
            className="w-[150px]"
            value={value.endDate || ''}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </>
      )}
    </div>
  )
}
