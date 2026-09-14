'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Trash2, Plus, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { findClassOnDate, isSameClassDate } from '@/lib/course-modality'
import { getAccessUrlError } from '@/lib/validations/course'
import { CLASS_ICONS } from '@/components/course/modality-icons'

/** Clase virtual en edición: su fecha es una de classDates y el link puede quedar vacío. */
export interface VirtualClassDraft {
  date: Date
  streamingUrl: string
  streamingPassword: string
}

export interface CourseDatesData {
  classDates: Date[]
  /** Clases virtuales con su link (solo semipresencial). Las fechas sin entrada son presenciales. */
  virtualClasses?: VirtualClassDraft[]
  startTime: string
  classDuration: number
  examDate?: Date
  examTime?: string
  registrationDeadline?: Date
}

interface CourseDatesSectionProps extends CourseDatesData {
  showExamDate?: boolean
  /** Muestra por cada fecha un control para marcarla como clase virtual. */
  allowVirtualClasses?: boolean
  onChange: (data: CourseDatesData) => void
}

const PresencialClassIcon = CLASS_ICONS.presencial
const VirtualClassIcon = CLASS_ICONS.virtual

export function CourseDatesSection({
  classDates,
  virtualClasses,
  startTime,
  classDuration,
  examDate,
  examTime,
  registrationDeadline,
  showExamDate = false,
  allowVirtualClasses = false,
  onChange,
}: CourseDatesSectionProps) {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined)

  const emit = (patch: Partial<CourseDatesData>) => {
    onChange({
      classDates,
      virtualClasses,
      startTime,
      classDuration,
      examDate,
      examTime,
      registrationDeadline,
      ...patch,
    })
  }

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

    emit({ classDates: newDates })

    setNewDate(undefined)
  }

  const handleRemoveDate = (index: number) => {
    const removed = classDates[index]
    emit({
      classDates: classDates.filter((_, i) => i !== index),
      // Una fecha borrada deja de ser virtual
      ...(virtualClasses && {
        virtualClasses: virtualClasses.filter(
          (vc) => !isSameClassDate(vc.date, removed)
        ),
      }),
    })
  }

  const handleVirtualChange = (date: Date, isVirtual: boolean) => {
    const current = virtualClasses ?? []
    const others = current.filter((vc) => !isSameClassDate(vc.date, date))

    if (!isVirtual) {
      emit({ virtualClasses: others })
      return
    }

    // Arranca con el último link cargado: si se usa el mismo para todas, se escribe una sola vez
    const lastWithLink = [...current].reverse().find((vc) => vc.streamingUrl.trim())
    emit({
      virtualClasses: [
        ...others,
        {
          date,
          streamingUrl: lastWithLink?.streamingUrl ?? '',
          streamingPassword: lastWithLink?.streamingPassword ?? '',
        },
      ],
    })
  }

  const handleVirtualClassAccessChange = (
    date: Date,
    patch: Partial<Pick<VirtualClassDraft, 'streamingUrl' | 'streamingPassword'>>
  ) => {
    emit({
      virtualClasses: (virtualClasses ?? []).map((vc) =>
        isSameClassDate(vc.date, date) ? { ...vc, ...patch } : vc
      ),
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

  const virtualCount = allowVirtualClasses
    ? classDates.filter((d) => findClassOnDate(d, virtualClasses ?? [])).length
    : 0

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
                onChange={(e) => emit({ startTime: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classDuration">Duración por Clase (minutos)</Label>
            <Input
              id="classDuration"
              type="number"
              min="30"
              step="30"
              placeholder="180"
              value={classDuration || ''}
              onChange={(e) =>
                emit({ classDuration: parseInt(e.target.value) || 0 })
              }
            />
            {endTime && startTime && (
              <p className="text-sm text-muted-foreground">
                Horario: {startTime} a {endTime} h
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
            <Label>
              Fechas Programadas ({classDates.length}
              {virtualCount > 0 &&
                ` · ${virtualCount} virtual${virtualCount === 1 ? '' : 'es'}`}
              )
            </Label>
            {allowVirtualClasses && (
              <p className="text-xs text-muted-foreground">
                Las clases son presenciales salvo las que marques como virtuales.
                Cada clase virtual tiene su propio link: al marcarla arranca con el
                último link cargado, y podés cambiarlo o dejarlo vacío para cargarlo
                más adelante.
              </p>
            )}
            <div className="space-y-2 rounded-lg border p-3">
              {classDates.map((date, index) => {
                const virtualClass = allowVirtualClasses
                  ? findClassOnDate(date, virtualClasses ?? [])
                  : undefined
                const isVirtual = virtualClass !== undefined
                const ClassIcon = isVirtual ? VirtualClassIcon : PresencialClassIcon
                const switchId = `virtual-class-${index}`
                const urlError = virtualClass
                  ? getAccessUrlError(virtualClass.streamingUrl)
                  : null

                return (
                  <div
                    key={date.getTime()}
                    className="space-y-3 rounded-md bg-muted/50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm">
                        {allowVirtualClasses && (
                          <ClassIcon
                            className={`mr-1.5 inline size-3.5 align-[-2px] ${isVirtual ? 'text-primary' : 'text-muted-foreground'}`}
                          />
                        )}
                        <span className="font-medium">Clase {index + 1}:</span>{' '}
                        {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                        {startTime && endTime && (
                          <span className="text-muted-foreground">
                            {' '}
                            - {startTime} a {endTime} h
                          </span>
                        )}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        {allowVirtualClasses && (
                          <>
                            <Label
                              htmlFor={switchId}
                              className="cursor-pointer text-xs font-normal text-muted-foreground"
                            >
                              Virtual
                            </Label>
                            <Switch
                              id={switchId}
                              checked={isVirtual}
                              onCheckedChange={(checked) =>
                                handleVirtualChange(date, checked)
                              }
                            />
                          </>
                        )}
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
                    </div>

                    {virtualClass && (
                      <div className="grid gap-2 pb-1 sm:grid-cols-[1fr_12rem]">
                        <div className="space-y-1">
                          <Label
                            htmlFor={`virtual-class-url-${index}`}
                            className="text-xs font-normal text-muted-foreground"
                          >
                            Link de acceso
                          </Label>
                          <Input
                            id={`virtual-class-url-${index}`}
                            type="url"
                            value={virtualClass.streamingUrl}
                            onChange={(e) =>
                              handleVirtualClassAccessChange(date, {
                                streamingUrl: e.target.value,
                              })
                            }
                            placeholder="https://zoom.us/j/123456789"
                            aria-invalid={!!urlError}
                            className="h-8 bg-background"
                          />
                          {urlError ? (
                            <p className="text-xs text-destructive">{urlError}</p>
                          ) : (
                            !virtualClass.streamingUrl.trim() && (
                              <p className="text-xs text-muted-foreground">
                                Sin link todavía: podés cargarlo más adelante.
                              </p>
                            )
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label
                            htmlFor={`virtual-class-password-${index}`}
                            className="text-xs font-normal text-muted-foreground"
                          >
                            Contraseña
                          </Label>
                          <Input
                            id={`virtual-class-password-${index}`}
                            value={virtualClass.streamingPassword}
                            onChange={(e) =>
                              handleVirtualClassAccessChange(date, {
                                streamingPassword: e.target.value,
                              })
                            }
                            placeholder="Opcional"
                            className="h-8 bg-background"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {classDates.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No hay fechas programadas. Agregá las fechas de las clases del curso.
          </p>
        )}

        {/* Exam date and Registration deadline */}
        <div className={`grid gap-4 ${showExamDate ? 'sm:grid-cols-2' : ''}`}>
          {/* Exam date and time (for WSET courses) */}
          {showExamDate && (
            <div className="space-y-2">
              <Label>Fecha y Hora del Examen</Label>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  value={examDate}
                  onChange={(date) => emit({ examDate: date })}
                  placeholder="Seleccionar fecha del examen"
                />
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="time"
                    value={examTime ?? ''}
                    onChange={(e) => emit({ examTime: e.target.value })}
                    placeholder="Hora del examen"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Registration deadline */}
          <div className="space-y-2">
            <Label>Fecha Límite de Inscripción</Label>
            <DatePicker
              value={registrationDeadline}
              onChange={(date) => emit({ registrationDeadline: date })}
              placeholder="Seleccionar fecha límite"
            />
            <p className="text-xs text-muted-foreground">
              Después de esta fecha no se aceptarán nuevas inscripciones.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
