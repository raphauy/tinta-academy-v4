'use client'

import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { DateValidationResult } from '@/services/workflow-execution-service'

interface CourseDateWarningsProps {
  validation: DateValidationResult
  courseId: string
}

export function CourseDateWarnings({
  validation,
  courseId,
}: CourseDateWarningsProps) {
  if (validation.isValid) {
    return null
  }

  return (
    <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-200">
        Fechas faltantes en el curso
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p className="mb-3">
          El curso no tiene configuradas algunas fechas que requiere este workflow:
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-4">
          {validation.missingDates.map((missing, idx) => (
            <li key={idx}>
              <strong>{missing.label}</strong>
              <span className="text-muted-foreground">
                {' '}
                (usado en: {missing.stepNames.join(', ')})
              </span>
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          <Link href={`/educator/courses/${courseId}/edit`} target="_blank">
            Editar fechas del curso
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
