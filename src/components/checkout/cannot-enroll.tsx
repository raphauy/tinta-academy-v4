'use client'

import Link from 'next/link'
import { AlertCircle, Calendar, Users, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { EnrollmentBlockReason } from '@/services/checkout-service'

interface CannotEnrollProps {
  reason: EnrollmentBlockReason
  courseName: string
  courseSlug: string
}

const blockReasonConfig: Record<
  EnrollmentBlockReason,
  {
    icon: typeof AlertCircle
    title: string
    description: string
    iconColor: string
    bgColor: string
  }
> = {
  already_enrolled: {
    icon: CheckCircle,
    title: 'Ya estás inscrito',
    description: 'Ya tienes una inscripción activa en este curso.',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  course_full: {
    icon: Users,
    title: 'Curso lleno',
    description:
      'Este curso ha alcanzado su capacidad máxima. Te recomendamos inscribirte en la lista de espera o explorar otros cursos disponibles.',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  course_closed: {
    icon: Lock,
    title: 'Inscripciones cerradas',
    description:
      'Las inscripciones para este curso ya no están disponibles. Consulta nuestros próximos cursos.',
    iconColor: 'text-stone-600',
    bgColor: 'bg-stone-100',
  },
  deadline_passed: {
    icon: Calendar,
    title: 'Plazo de inscripción vencido',
    description:
      'El período de inscripción para este curso ha finalizado. Te invitamos a explorar nuestras próximas ediciones.',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
  },
}

export function CannotEnroll({
  reason,
  courseName,
  courseSlug,
}: CannotEnrollProps) {
  const config = blockReasonConfig[reason]
  const Icon = config.icon

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div
            className={`mx-auto w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}
          >
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription className="text-base">
            {config.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Curso</p>
            <p className="font-medium">{courseName}</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {reason === 'already_enrolled' ? (
            <Button asChild className="w-full">
              <Link href="/student/courses">Ir a mis cursos</Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/#catalog">Explorar otros cursos</Link>
            </Button>
          )}
          <Button variant="ghost" asChild className="w-full">
            <Link href={`/cursos/${courseSlug}`}>Volver al curso</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
