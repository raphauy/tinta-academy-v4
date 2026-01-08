'use client'

import * as React from 'react'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date | string
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse value if it's a string (from form)
  const dateValue = React.useMemo(() => {
    if (!value) return undefined
    if (value instanceof Date) return value
    // Try parsing ISO format first (yyyy-MM-dd)
    try {
      const parsed = parse(value, 'yyyy-MM-dd', new Date())
      if (!isNaN(parsed.getTime())) return parsed
    } catch {
      // ignore
    }
    // Try parsing as Date string
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  }, [value])

  const handleSelect = (date: Date | undefined) => {
    onChange(date)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !dateValue && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateValue ? (
            format(dateValue, 'dd/MM/yyyy', { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          locale={es}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
