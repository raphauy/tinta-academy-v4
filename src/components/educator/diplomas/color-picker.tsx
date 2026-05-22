'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

// Paleta predefinida: negros + grises + paleta verde-uva de Tinta + dorado + blanco.
const PRESET_COLORS = [
  '#0A0A0A',
  '#000000',
  '#2A2A2A',
  '#525252',
  '#737373',
  '#143F3B', // verde-uva-700 (primary Tinta)
  '#1E5048', // verde-uva-600
  '#37635E', // verde-uva-500
  '#A07C2C', // dorado
  '#FFFFFF',
] as const

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/

type Props = {
  value: string
  onChange: (hex: string) => void
  disabled?: boolean
  className?: string
}

export function ColorPicker({ value, onChange, disabled, className }: Props) {
  const [open, setOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState(value)

  useEffect(() => {
    setCustomDraft(value)
  }, [value])

  const handlePreset = (color: string) => {
    onChange(color)
  }

  const handleCustomChange = (next: string) => {
    setCustomDraft(next)
    if (HEX_REGEX.test(next)) {
      onChange(next)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            disabled={disabled}
            aria-label={`Color ${color}`}
            onClick={() => handlePreset(color)}
            className={cn(
              'h-6 w-6 cursor-pointer rounded-md border transition',
              'hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50',
              value.toLowerCase() === color.toLowerCase()
                ? 'border-foreground ring-2 ring-offset-1 ring-offset-background'
                : 'border-input'
            )}
            style={{ backgroundColor: color }}
          />
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                'h-6 w-6 cursor-pointer rounded-md border border-input bg-background text-[10px] font-semibold',
                'flex items-center justify-center text-muted-foreground',
                'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50'
              )}
              aria-label="Color personalizado"
            >
              +
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-3">
              <p className="text-xs font-medium">Color personalizado</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={HEX_REGEX.test(customDraft) ? customDraft : '#000000'}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded border"
                  aria-label="Selector de color"
                />
                <Input
                  value={customDraft}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  placeholder="#0A0A0A"
                  maxLength={7}
                  className="font-mono uppercase"
                />
              </div>
              {!HEX_REGEX.test(customDraft) && (
                <p className="text-xs text-destructive">
                  Formato esperado: #RRGGBB
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
