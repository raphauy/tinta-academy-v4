import type { CourseType, CourseModality, AudienceFilter } from '@prisma/client'

// ============================================
// DATE RANGE TYPES
// ============================================

export type DateRangeType =
  | 'last_months'
  | 'this_year'
  | 'last_year'
  | 'before'
  | 'after'
  | 'between'

export interface DateRangeValue {
  type: DateRangeType
  months?: number // for 'last_months'
  date?: string // for 'before' | 'after' (ISO date string)
  startDate?: string // for 'between' (ISO date string)
  endDate?: string // for 'between' (ISO date string)
}

// ============================================
// FILTER CONDITION TYPES
// ============================================

export type ConditionOperator = 'attended' | 'not_attended'

export type ConditionProperty =
  | 'type'
  | 'modality'
  | 'wsetLevel'
  | 'tags'
  | 'dateRange'

export type ConditionValue =
  | CourseType // for 'type'
  | CourseModality // for 'modality'
  | number // for 'wsetLevel'
  | string[] // for 'tags'
  | DateRangeValue // for 'dateRange'

export interface FilterCondition {
  id: string
  operator: ConditionOperator
  property: ConditionProperty
  value: ConditionValue
}

// ============================================
// CONDITION GROUP TYPES
// ============================================

export interface ConditionGroup {
  id: string
  conditions: FilterCondition[] // Combined with AND
}

// ============================================
// FILTER CONDITIONS (main structure)
// ============================================

export interface FilterConditions {
  groups: ConditionGroup[] // Combined with OR
}

// ============================================
// UI/FORM TYPES
// ============================================

export interface AudienceFilterFormData {
  name: string
  description?: string
  isPublic: boolean
  conditions: FilterConditions
}

export interface AudienceFilterWithEducator extends AudienceFilter {
  educator: {
    id: string
    name: string
  }
  _count?: {
    campaigns: number
  }
}

// ============================================
// FILTER PREVIEW TYPES
// ============================================

export interface FilterPreviewStudent {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
}

export interface FilterPreviewResult {
  count: number
  students: FilterPreviewStudent[]
}

// ============================================
// SELECTOR TYPES
// ============================================

export interface FilterForSelection {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  educatorId: string
  educatorName: string
  cachedStudentCount: number | null
}

// ============================================
// CONSTANTS
// ============================================

export const CONDITION_OPERATORS: Record<
  ConditionOperator,
  { label: string; description: string }
> = {
  attended: {
    label: 'Cursó',
    description: 'Estudiantes que completaron un curso',
  },
  not_attended: {
    label: 'No cursó',
    description: 'Estudiantes que no completaron un curso',
  },
}

export const CONDITION_PROPERTIES: Record<
  ConditionProperty,
  { label: string; description: string }
> = {
  type: {
    label: 'Tipo de curso',
    description: 'Filtrar por tipo de curso (WSET, Taller, etc.)',
  },
  modality: {
    label: 'Modalidad',
    description: 'Filtrar por modalidad (presencial u online)',
  },
  wsetLevel: {
    label: 'Nivel WSET',
    description: 'Filtrar por nivel WSET (1, 2, 3)',
  },
  tags: {
    label: 'Tags',
    description: 'Filtrar por tags del curso',
  },
  dateRange: {
    label: 'Fecha',
    description: 'Filtrar por fecha del curso',
  },
}

export const DATE_RANGE_OPTIONS: Record<
  DateRangeType,
  { label: string; description: string }
> = {
  last_months: {
    label: 'Últimos X meses',
    description: 'Cursos en los últimos X meses',
  },
  this_year: {
    label: 'Este año',
    description: 'Cursos este año',
  },
  last_year: {
    label: 'Año pasado',
    description: 'Cursos el año pasado',
  },
  before: {
    label: 'Antes de',
    description: 'Cursos antes de una fecha específica',
  },
  after: {
    label: 'Después de',
    description: 'Cursos después de una fecha específica',
  },
  between: {
    label: 'Entre',
    description: 'Cursos entre dos fechas',
  },
}

export const COURSE_TYPE_OPTIONS: Record<
  CourseType,
  { label: string }
> = {
  wset: { label: 'WSET' },
  taller: { label: 'Taller' },
  cata: { label: 'Cata' },
  curso: { label: 'Curso' },
}

export const COURSE_MODALITY_OPTIONS: Record<
  CourseModality,
  { label: string }
> = {
  presencial: { label: 'Presencial' },
  online: { label: 'Online' },
}

export const WSET_LEVEL_OPTIONS = [
  { value: 1, label: 'WSET Nivel 1' },
  { value: 2, label: 'WSET Nivel 2' },
  { value: 3, label: 'WSET Nivel 3' },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createEmptyCondition(): FilterCondition {
  return {
    id: crypto.randomUUID(),
    operator: 'attended',
    property: 'type',
    value: 'wset',
  }
}

export function createEmptyGroup(): ConditionGroup {
  return {
    id: crypto.randomUUID(),
    conditions: [createEmptyCondition()],
  }
}

export function createEmptyConditions(): FilterConditions {
  return {
    groups: [createEmptyGroup()],
  }
}

export function parseConditions(json: string): FilterConditions {
  try {
    return JSON.parse(json) as FilterConditions
  } catch {
    return createEmptyConditions()
  }
}

export function serializeConditions(conditions: FilterConditions): string {
  return JSON.stringify(conditions)
}
