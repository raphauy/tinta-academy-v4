import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Available variables with metadata for UI display
export const AVAILABLE_VARIABLES = [
  {
    key: 'studentName',
    description: 'Nombre completo del estudiante',
    example: 'María García',
  },
  {
    key: 'studentFirstName',
    description: 'Primer nombre del estudiante',
    example: 'María',
  },
  {
    key: 'studentEmail',
    description: 'Email del estudiante',
    example: 'maria@example.com',
  },
  {
    key: 'courseName',
    description: 'Nombre del curso',
    example: 'WSET Nivel 1 en Vinos',
  },
  {
    key: 'courseStartDate',
    description: 'Fecha de inicio del curso',
    example: '15 de marzo de 2025',
  },
  {
    key: 'courseEndDate',
    description: 'Fecha de fin del curso',
    example: '20 de marzo de 2025',
  },
  {
    key: 'examDate',
    description: 'Fecha del examen',
    example: '20 de marzo de 2025',
  },
  {
    key: 'educatorName',
    description: 'Nombre del educador',
    example: 'Gabriela Zimmer',
  },
  {
    key: 'courseUrl',
    description: 'Link al curso en el portal',
    example: 'https://academy.tinta.wine/student/courses/abc123',
  },
] as const

// Type for all supported template variables
export type TemplateVariables = {
  studentName: string
  studentFirstName: string
  studentEmail: string
  courseName: string
  courseStartDate: string
  courseEndDate: string
  examDate: string
  educatorName: string
  courseUrl: string
}

// Variable keys for validation
const VALID_VARIABLE_KEYS = AVAILABLE_VARIABLES.map((v) => v.key)

/**
 * Formats a date in Spanish locale (e.g., '15 de marzo de 2025')
 */
export function formatDateSpanish(date: Date | null | undefined): string {
  if (!date) return ''
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es })
}

/**
 * Renders a template by replacing {{variable}} placeholders with actual values
 */
export function renderTemplate(
  template: string,
  variables: TemplateVariables
): string {
  let result = template

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`
    result = result.replaceAll(placeholder, value)
  }

  return result
}

/**
 * Extracts all variable names used in a template
 * Returns array of variable keys found (e.g., ['studentName', 'courseName'])
 */
export function extractVariables(template: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const matches = template.matchAll(regex)
  const variables = new Set<string>()

  for (const match of matches) {
    variables.add(match[1])
  }

  return Array.from(variables)
}

/**
 * Validates that all variables in a template are supported
 * Returns validation result with list of invalid variables if any
 */
export function validateVariables(template: string): {
  valid: boolean
  invalidVars: string[]
} {
  const usedVariables = extractVariables(template)
  const invalidVars = usedVariables.filter(
    (v) => !VALID_VARIABLE_KEYS.includes(v as (typeof VALID_VARIABLE_KEYS)[number])
  )

  return {
    valid: invalidVars.length === 0,
    invalidVars,
  }
}

// Input types for buildVariablesForStudent
type StudentInput = {
  firstName: string | null
  lastName: string | null
  user: {
    email: string
  }
}

type CourseInput = {
  id: string
  title: string
  startDate: Date | null
  endDate: Date | null
  examDate: Date | null
}

type EducatorInput = {
  name: string
}

/**
 * Builds TemplateVariables object from domain models
 */
export function buildVariablesForStudent(
  student: StudentInput,
  course: CourseInput,
  educator: EducatorInput,
  baseUrl: string
): TemplateVariables {
  const firstName = student.firstName || ''
  const lastName = student.lastName || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Estudiante'

  return {
    studentName: fullName,
    studentFirstName: firstName || 'Estudiante',
    studentEmail: student.user.email,
    courseName: course.title,
    courseStartDate: formatDateSpanish(course.startDate),
    courseEndDate: formatDateSpanish(course.endDate),
    examDate: formatDateSpanish(course.examDate),
    educatorName: educator.name,
    courseUrl: `${baseUrl}/student/courses/${course.id}`,
  }
}
