import { addDays, addMinutes } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'

/**
 * Cuándo empieza y cuándo termina una clase. Las fechas de clase guardan solo el
 * día calendario: la hora vive aparte, en el startTime del curso.
 */

/** Las clases se agendan en la zona del curso, no en la de quien mira la página. */
const CLASS_TIMEZONE = 'America/Montevideo'

/** Medianoche de la fecha de clase en la zona del curso: la fecha se lee en UTC, como en toLocalDate. */
function getClassDayStart(date: Date | string): Date {
  const day = new Date(date).toISOString().slice(0, 10)
  return fromZonedTime(`${day}T00:00:00`, CLASS_TIMEZONE)
}

/** Minutos desde la medianoche que indica un startTime "HH:mm"; null si no hay hora válida. */
function getStartTimeMinutes(startTime: string | null): number | null {
  const [hours, minutes] = (startTime ?? '').split(':').map(Number)
  // Number.isFinite y no isNaN: un "17" sin minutos deja minutes en undefined
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null
  return hours * 60 + minutes
}

/**
 * Momento en que empieza una clase: la hora de inicio del curso sobre su fecha.
 * Sin hora de inicio, empieza cuando empieza el día.
 */
export function getClassStart(date: Date | string, startTime: string | null): Date {
  const minutes = getStartTimeMinutes(startTime)
  const dayStart = getClassDayStart(date)
  return minutes === null ? dayStart : addMinutes(dayStart, minutes)
}

/**
 * Momento en que termina una clase: la hora de inicio del curso más la duración
 * de clase. Sin hora de inicio, la clase dura todo el día.
 */
export function getClassEnd(
  date: Date | string,
  startTime: string | null,
  classDuration: number | null
): Date {
  const minutes = getStartTimeMinutes(startTime)
  const dayStart = getClassDayStart(date)
  if (minutes === null) return addDays(dayStart, 1)
  return addMinutes(dayStart, minutes + (classDuration ?? 0))
}
