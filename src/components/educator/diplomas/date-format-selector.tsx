'use client'

import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const DATE_FORMAT_PRESETS = [
  { value: "d 'de' MMMM 'de' yyyy", label: '28 de mayo de 2026' },
  { value: 'dd/MM/yyyy', label: '28/05/2026' },
  { value: "MMMM 'de' yyyy", label: 'mayo de 2026' },
  { value: "d 'de' MMMM", label: '28 de mayo' },
  { value: 'yyyy', label: '2026' },
] as const

const CUSTOM_KEY = '__custom__'

type Props = {
  value: string
  onChange: (value: string) => void
  /** Fecha a usar para mostrar el preview del formato. */
  sampleDate?: Date
  disabled?: boolean
}

export function DateFormatSelector({
  value,
  onChange,
  sampleDate,
  disabled,
}: Props) {
  const presetMatch = DATE_FORMAT_PRESETS.find((p) => p.value === value)
  const isCustom = !presetMatch
  const [showCustom, setShowCustom] = useState(isCustom)

  const livePreview = useMemo(() => {
    if (!value) return ''
    try {
      const sample = sampleDate ?? new Date()
      return format(sample, value, { locale: es })
    } catch {
      return '⚠️ Patrón inválido'
    }
  }, [value, sampleDate])

  const handleSelect = (next: string) => {
    if (next === CUSTOM_KEY) {
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">Formato de fecha</Label>
      <Select
        value={showCustom ? CUSTOM_KEY : value}
        onValueChange={handleSelect}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Elegí un formato" />
        </SelectTrigger>
        <SelectContent>
          {DATE_FORMAT_PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_KEY}>Personalizado…</SelectItem>
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="space-y-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="dd 'de' MMMM 'de' yyyy"
            className="font-mono text-xs"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Tokens de date-fns. Preview:{' '}
            <span className="font-medium text-foreground">{livePreview}</span>
          </p>
        </div>
      )}
    </div>
  )
}
