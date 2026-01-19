'use client'

import { useEffect, useMemo } from 'react'
import { Clock, CalendarClock } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  getUserTimezone,
  getTimezoneLabel,
  datetimeLocalToUTC,
  utcToDatetimeLocal
} from '@/lib/timezone-utils'

export interface ScheduleValue {
  mode: 'now' | 'scheduled'
  scheduledAt?: string // ISO string in UTC
  timezone: string
}

interface SchedulePickerProps {
  value: ScheduleValue
  onChange: (value: ScheduleValue) => void
}

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  // Initialize timezone on mount (client-side only)
  useEffect(() => {
    if (!value.timezone) {
      const detectedTimezone = getUserTimezone()
      onChange({ ...value, timezone: detectedTimezone })
    }
  }, [value, onChange])

  // Derive local datetime from value.scheduledAt (no useState needed)
  const localDatetime = useMemo(() => {
    if (value.scheduledAt && value.timezone) {
      const utcDate = new Date(value.scheduledAt)
      return utcToDatetimeLocal(utcDate, value.timezone)
    }
    return ''
  }, [value.scheduledAt, value.timezone])

  const handleModeChange = (mode: 'now' | 'scheduled') => {
    if (mode === 'now') {
      onChange({
        mode: 'now',
        scheduledAt: undefined,
        timezone: value.timezone
      })
    } else {
      // Set default to 1 hour from now
      const defaultTime = new Date()
      defaultTime.setHours(defaultTime.getHours() + 1)
      defaultTime.setMinutes(0, 0, 0)

      onChange({
        mode: 'scheduled',
        scheduledAt: defaultTime.toISOString(),
        timezone: value.timezone
      })
    }
  }

  const handleDatetimeChange = (datetimeValue: string) => {
    if (datetimeValue && value.timezone) {
      const utcDate = datetimeLocalToUTC(datetimeValue, value.timezone)
      onChange({
        ...value,
        scheduledAt: utcDate.toISOString()
      })
    }
  }

  // Get minimum datetime (now + 5 minutes)
  const getMinDatetime = () => {
    const min = new Date()
    min.setMinutes(min.getMinutes() + 5)
    return utcToDatetimeLocal(min, value.timezone || 'America/Argentina/Buenos_Aires')
  }

  const timezoneLabel = value.timezone ? getTimezoneLabel(value.timezone) : ''

  return (
    <div className="space-y-4">
      <RadioGroup
        value={value.mode}
        onValueChange={(v) => handleModeChange(v as 'now' | 'scheduled')}
        className="space-y-3"
      >
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="now" id="send-now" />
          <Label
            htmlFor="send-now"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Clock className="h-4 w-4 text-muted-foreground" />
            Enviar ahora
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="scheduled" id="send-scheduled" />
          <Label
            htmlFor="send-scheduled"
            className="flex items-center gap-2 cursor-pointer"
          >
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            Programar para...
          </Label>
        </div>
      </RadioGroup>

      {value.mode === 'scheduled' && (
        <div className="ml-7 space-y-2">
          <div className="flex items-center gap-4">
            <Input
              type="datetime-local"
              value={localDatetime}
              onChange={(e) => handleDatetimeChange(e.target.value)}
              min={getMinDatetime()}
              className="w-auto"
            />
          </div>
          {timezoneLabel && (
            <p className="text-sm text-muted-foreground">
              Zona horaria: {timezoneLabel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
