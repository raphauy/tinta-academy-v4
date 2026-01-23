'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  TIMEZONE_OPTIONS,
  formatSendTime,
  getTimezoneLabel,
} from '@/lib/constants/workflow'

interface SendTimePickerProps {
  hour: number
  minute: number
  timezone: string
  onHourChange: (value: number) => void
  onMinuteChange: (value: number) => void
  onTimezoneChange: (value: string) => void
}

export function SendTimePicker({
  hour,
  minute,
  timezone,
  onHourChange,
  onMinuteChange,
  onTimezoneChange,
}: SendTimePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-4">
        {/* Time */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Hora</Label>
          <div className="flex items-center gap-1">
            <Select
              value={hour.toString()}
              onValueChange={(v) => onHourChange(parseInt(v, 10))}
            >
              <SelectTrigger className="w-[72px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOUR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select
              value={minute.toString()}
              onValueChange={(v) => onMinuteChange(parseInt(v, 10))}
            >
              <SelectTrigger className="w-[72px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MINUTE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Timezone */}
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Zona horaria</Label>
          <Select value={timezone} onValueChange={onTimezoneChange}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <p className="text-sm text-muted-foreground">
        Los emails se enviarán a las{' '}
        <span className="font-medium text-foreground">
          {formatSendTime(hour, minute)}
        </span>{' '}
        ({getTimezoneLabel(timezone)})
      </p>
    </div>
  )
}
