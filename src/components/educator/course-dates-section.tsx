'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Plus, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'

interface CourseDatesSectionProps {
  classDates: Date[]
  startTime: string
  classDuration: number
  examDate?: Date
  registrationDeadline?: Date
  showExamDate?: boolean
  onChange: (data: {
    classDates: Date[]
    startTime: string
    classDuration: number
    examDate?: Date
    registrationDeadline?: Date
  }) => void
}

export function CourseDatesSection({
  classDates,
  startTime,
  classDuration,
  examDate,
  registrationDeadline,
  showExamDate = false,
  onChange,
}: CourseDatesSectionProps) {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)

  const handleAddDate = () => {
    if (!newDate) return

    // Check if date already exists
    const dateExists = classDates.some(
      (d) => d.toDateString() === newDate.toDateString()
    )
    if (dateExists) return

    // Add date and sort
    const newDates = [...classDates, newDate].sort(
      (a, b) => a.getTime() - b.getTime()
    )

    onChange({
      classDates: newDates,
      startTime,
      classDuration,
      examDate,
      registrationDeadline,
    })

    setNewDate(undefined)
  }

  const handleRemoveDate = (index: number) => {
    const newDates = classDates.filter((_, i) => i !== index)
    onChange({
      classDates: newDates,
      startTime,
      classDuration,
      examDate,
      registrationDeadline,
    })
  }

  const handleStartTimeChange = (value: string) => {
    onChange({
      classDates,
      startTime: value,
      classDuration,
      examDate,
      registrationDeadline,
    })
  }

  const handleClassDurationChange = (value: number) => {
    onChange({
      classDates,
      startTime,
      classDuration: value,
      examDate,
      registrationDeadline,
    })
  }

  const handleExamDateChange = (date: Date | undefined) => {
    onChange({
      classDates,
      startTime,
      classDuration,
      examDate: date,
      registrationDeadline,
    })
  }

  const handleRegistrationDeadlineChange = (date: Date | undefined) => {
    onChange({
      classDates,
      startTime,
      classDuration,
      examDate,
      registrationDeadline: date,
    })
  }

  // Calculate end time based on start time and duration
  const getEndTime = () => {
    if (!startTime || !classDuration) return ''
    try {
      const [hours, minutes] = startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + classDuration
      const endHours = Math.floor(endMinutes / 60) % 24
      const endMins = endMinutes % 60
      return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
    } catch {
      return ''
    }
  }

  const endTime = getEndTime()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fechas de las Clases</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time settings */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startTime">Hora de Inicio</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classDuration">Duracion por Clase (minutos)</Label>
            <Input
              id="classDuration"
              type="number"
              min="30"
              step="30"
              placeholder="180"
              value={classDuration || ''}
              onChange={(e) =>
                handleClassDurationChange(parseInt(e.target.value) || 0)
              }
            />
            {endTime && startTime && (
              <p className="text-sm text-muted-foreground">
                Horario: {startTime} a {endTime} hs
              </p>
            )}
          </div>
        </div>

        {/* Add date */}
        <div className="space-y-2">
          <Label>Agregar Fecha de Clase</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <DatePicker
                value={newDate}
                onChange={(date) => setNewDate(date)}
                placeholder="Seleccionar fecha"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddDate}
              disabled={!newDate}
            >
              <Plus className="mr-2 size-4" />
              Agregar
            </Button>
          </div>
        </div>

        {/* List of dates */}
        {classDates.length > 0 && (
          <div className="space-y-2">
            <Label>Fechas Programadas ({classDates.length})</Label>
            <div className="space-y-2 rounded-lg border p-3">
              {classDates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                >
                  <span className="text-sm">
                    <span className="font-medium">Clase {index + 1}:</span>{' '}
                    {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                    {startTime && endTime && (
                      <span className="text-muted-foreground">
                        {' '}
                        - {startTime} a {endTime} hs
                      </span>
                    )}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveDate(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {classDates.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No hay fechas programadas. Agrega las fechas de las clases del curso.
          </p>
        )}

        {/* Exam date (for WSET courses) */}
        {showExamDate && (
          <div className="space-y-2">
            <Label>Fecha del Examen</Label>
            <DatePicker
              value={examDate}
              onChange={handleExamDateChange}
              placeholder="Seleccionar fecha del examen"
            />
          </div>
        )}

        {/* Registration deadline */}
        <div className="space-y-2">
          <Label>Fecha Limite de Inscripcion</Label>
          <DatePicker
            value={registrationDeadline}
            onChange={handleRegistrationDeadlineChange}
            placeholder="Seleccionar fecha limite"
          />
          <p className="text-xs text-muted-foreground">
            Despues de esta fecha no se aceptaran nuevas inscripciones.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
