'use client'

import { useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  DIPLOMA_FONT_FAMILIES,
  DIPLOMA_FONT_WEIGHTS,
  type DiplomaFontFamily,
} from '@/lib/validations/diploma'

const WEIGHT_LABELS: Record<number, string> = {
  400: 'Regular',
  500: 'Medium',
  700: 'Bold',
}

type Props = {
  family: DiplomaFontFamily
  weight: number
  onFamilyChange: (family: DiplomaFontFamily) => void
  onWeightChange: (weight: number) => void
  disabled?: boolean
}

export function FontSelector({
  family,
  weight,
  onFamilyChange,
  onWeightChange,
  disabled,
}: Props) {
  const allowedWeights = DIPLOMA_FONT_WEIGHTS[family]

  // Si el peso actual no aplica a la familia seleccionada, ajustarlo al primero permitido.
  useEffect(() => {
    if (!allowedWeights.includes(weight)) {
      onWeightChange(allowedWeights[0])
    }
  }, [family, weight, allowedWeights, onWeightChange])

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-1">
        <Label className="text-xs">Tipografía</Label>
        <Select
          value={family}
          onValueChange={(v) => onFamilyChange(v as DiplomaFontFamily)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIPLOMA_FONT_FAMILIES.map((f) => (
              <SelectItem key={f} value={f}>
                <span style={{ fontFamily: `"${f}", sans-serif` }}>{f}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Peso</Label>
        <Select
          value={String(weight)}
          onValueChange={(v) => onWeightChange(Number(v))}
          disabled={disabled || allowedWeights.length <= 1}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowedWeights.map((w) => (
              <SelectItem key={w} value={String(w)}>
                {WEIGHT_LABELS[w] ?? w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
