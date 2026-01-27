import {
  PlayCircle,
  CheckCircle,
  FileText,
  Calendar,
  Clock,
  type LucideIcon,
} from 'lucide-react'
import { WorkflowTriggerType } from '@prisma/client'

// =============================================================================
// Trigger Type Labels
// =============================================================================

export const TRIGGER_TYPE_LABELS: Record<WorkflowTriggerType, string> = {
  course_start: 'Inicio del curso',
  course_end: 'Fin del curso',
  exam_date: 'Examen',
  class_date: 'Clase',
  registration_deadline: 'Cierre de inscripción',
}

// =============================================================================
// Trigger Type Icons
// =============================================================================

export const TRIGGER_TYPE_ICONS: Record<WorkflowTriggerType, LucideIcon> = {
  course_start: PlayCircle,
  course_end: CheckCircle,
  exam_date: FileText,
  class_date: Calendar,
  registration_deadline: Clock,
}

// =============================================================================
// Trigger Type Options (for Select)
// =============================================================================

export const TRIGGER_TYPE_OPTIONS = [
  { value: 'course_start' as const, label: 'Inicio del curso' },
  { value: 'course_end' as const, label: 'Fin del curso' },
  { value: 'exam_date' as const, label: 'Examen' },
  { value: 'class_date' as const, label: 'Clase' },
  { value: 'registration_deadline' as const, label: 'Cierre de inscripción' },
]

// =============================================================================
// Timezone Options
// =============================================================================

export const TIMEZONE_OPTIONS = [
  { value: 'America/Montevideo', label: 'Uruguay (GMT-3)' },
  { value: 'America/Buenos_Aires', label: 'Argentina (GMT-3)' },
  { value: 'America/Santiago', label: 'Chile (GMT-4)' },
  { value: 'America/Sao_Paulo', label: 'Brasil (GMT-3)' },
  { value: 'America/Lima', label: 'Perú (GMT-5)' },
  { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
  { value: 'America/Mexico_City', label: 'México (GMT-6)' },
  { value: 'Europe/Madrid', label: 'España (GMT+1)' },
]

// =============================================================================
// Hour Options (0-23)
// =============================================================================

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i.toString().padStart(2, '0'),
}))

// =============================================================================
// Minute Options (0, 15, 30, 45)
// =============================================================================

export const MINUTE_OPTIONS = [
  { value: 0, label: '00' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
  { value: 45, label: '45' },
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format trigger description for display
 * e.g., "2 días antes de Inicio del curso"
 */
export function formatTriggerDescription(
  triggerType: WorkflowTriggerType,
  triggerOffset: number,
  triggerClassIndex?: number | null
): string {
  const triggerLabel = TRIGGER_TYPE_LABELS[triggerType] || 'evento'
  const absOffset = Math.abs(triggerOffset || 0)
  const direction = triggerOffset < 0 ? 'antes' : 'después'
  const dayWord = absOffset === 1 ? 'día' : 'días'

  let baseTrigger = triggerLabel
  if (triggerType === 'class_date' && triggerClassIndex) {
    baseTrigger = `Clase ${triggerClassIndex}`
  }

  if (triggerOffset === 0) {
    return `El mismo día de ${baseTrigger.toLowerCase()}`
  }

  return `${absOffset} ${dayWord} ${direction} de ${baseTrigger.toLowerCase()}`
}

/**
 * Format time for display
 * e.g., "09:00" or "14:30"
 */
export function formatSendTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

/**
 * Get timezone display name
 */
export function getTimezoneLabel(timezone: string): string {
  const option = TIMEZONE_OPTIONS.find((opt) => opt.value === timezone)
  return option?.label || timezone
}

// =============================================================================
// Trigger to Course Field Mapping
// =============================================================================

/**
 * Maps workflow trigger types to the corresponding course fields
 * Used for validation and date extraction
 */
export const TRIGGER_TO_COURSE_FIELD: Record<WorkflowTriggerType, string> = {
  course_start: 'startDate',
  course_end: 'endDate',
  exam_date: 'examDate',
  class_date: 'classDates',
  registration_deadline: 'registrationDeadline',
}

/**
 * Human-readable labels for course fields (for validation messages)
 */
export const COURSE_FIELD_LABELS: Record<string, string> = {
  startDate: 'Fecha de inicio',
  endDate: 'Fecha de fin',
  examDate: 'Fecha de examen',
  classDates: 'Fechas de clases',
  registrationDeadline: 'Cierre de inscripción',
}
