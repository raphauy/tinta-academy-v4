'use client'

import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type DiplomaViewMode = 'gallery' | 'table'

type Props = {
  value: DiplomaViewMode
  onChange: (next: DiplomaViewMode) => void
}

export function DiplomaViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-md border bg-muted/40 p-0.5">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => onChange('gallery')}
        className={cn(
          'cursor-pointer rounded-sm px-3',
          value === 'gallery' && 'bg-background shadow-sm'
        )}
      >
        <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
        Galería
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => onChange('table')}
        className={cn(
          'cursor-pointer rounded-sm px-3',
          value === 'table' && 'bg-background shadow-sm'
        )}
      >
        <List className="mr-1.5 h-3.5 w-3.5" />
        Tabla
      </Button>
    </div>
  )
}
