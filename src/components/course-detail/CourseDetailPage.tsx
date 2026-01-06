'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Course, Educator, Tag } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/landing'
import { footerLinks, contactInfo } from '@/config/footer'
import { subscribeToNewsletter } from '@/app/(public)/actions'
import { toast } from 'sonner'
import { toLocalDate } from '@/lib/utils'
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'

type CourseWithRelations = Course & {
  educator: Educator
  tags: Tag[]
}

interface CourseDetailPageProps {
  course: CourseWithRelations
}

function formatDate(date: Date | null): string {
  if (!date) return 'Por confirmar'
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toLocalDate(date))
}

function formatMonthYear(date: Date | null): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(toLocalDate(date))
}

function getCourseTypeName(type: Course['type'], wsetLevel?: number | null): string {
  switch (type) {
    case 'wset':
      return wsetLevel ? `WSET Nivel ${wsetLevel}` : 'WSET'
    case 'taller':
      return 'Taller'
    case 'cata':
      return 'Cata'
    case 'curso':
      return 'Curso'
    default:
      return 'Curso'
  }
}

function getStatusText(status: Course['status']): string {
  switch (status) {
    case 'announced':
      return 'Anunciado'
    case 'enrolling':
      return 'Inscripciones abiertas'
    case 'full':
      return 'Cupo completo'
    case 'in_progress':
      return 'En curso'
    case 'finished':
      return 'Finalizado'
    case 'available':
      return 'Disponible'
    default:
      return ''
  }
}

const WSET_LEARNING_OUTCOMES: Record<number, string[]> = {
  1: [
    'Los principales tipos y estilos de vinos',
    'Las uvas de vinificación más comunes',
    'Cómo almacenar y servir el vino correctamente',
    'Los principios del maridaje de vinos y comidas',
    'Cómo describir el vino usando el método sistemático',
  ],
  2: [
    'Los factores que influyen en el estilo y la calidad del vino',
    'Las principales regiones vinícolas del mundo',
    'Los principios de la cata de vinos',
    'Cómo describir vinos con precisión',
    'Los vinos espumosos, fortificados y de postre',
  ],
  3: [
    'Análisis detallado de factores de producción',
    'Estudio profundo de las regiones vinícolas globales',
    'Evaluación avanzada de calidad y estilo',
    'Técnicas de cata profesional',
    'Contexto comercial de los vinos',
  ],
}

const WSET_TARGET_AUDIENCE = [
  'Personas que buscan una introducción formal al mundo del vino',
  'Profesionales de la hospitalidad que desean mejorar su conocimiento',
  'Entusiastas del vino que quieren una base sólida',
  'Quienes buscan una certificación internacional reconocida',
]

const WSET_REQUIREMENTS = [
  'Ser mayor de 18 años',
  'Documento de identidad con foto vigente',
  'No se requieren conocimientos previos',
]

const WSET_INCLUDED = [
  'Material de estudio oficial WSET',
  'Examen de certificación internacional',
  'Degustación de vinos durante el curso',
  'Certificado oficial WSET al aprobar',
  'PIN oficial WSET',
]

export function CourseDetailPage({ course }: CourseDetailPageProps) {
  const router = useRouter()
  const isWset = course.type === 'wset'
  const canEnroll = course.status === 'enrolling'
  const learningOutcomes = isWset && course.wsetLevel
    ? WSET_LEARNING_OUTCOMES[course.wsetLevel] || []
    : []

  const handleNavigate = (href: string) => {
    router.push(href)
  }

  const handleSubscribe = async (email: string) => {
    try {
      const result = await subscribeToNewsletter(email)
      if (result.success) {
        toast.success('¡Gracias por suscribirte!', {
          description: 'Te mantendremos informado sobre nuestros cursos y novedades.',
        })
      } else {
        toast.error('Error al suscribirse', {
          description: result.error || 'Por favor, intenta nuevamente.',
        })
      }
      return result
    } catch {
      toast.error('Error al suscribirse', {
        description: 'Por favor, intenta nuevamente.',
      })
      return { success: false, error: 'Error inesperado' }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Back Navigation */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver al catálogo
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 overflow-hidden">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover opacity-20"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
          )}
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-wider mb-2 opacity-80">
              {getCourseTypeName(course.type, course.wsetLevel)} • {course.modality}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {course.title}
            </h1>
            {course.startDate && (
              <h2 className="text-xl opacity-90 capitalize">
                {formatMonthYear(course.startDate)}
              </h2>
            )}
            <div className="mt-4">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm">
                {getStatusText(course.status)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12 flex-1">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {course.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {course.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Learning Outcomes & Target Audience (for WSET) */}
            {isWset && learningOutcomes.length > 0 && (
              <div className="grid gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>¿Qué vas a aprender?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Este curso es para vos si</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {WSET_TARGET_AUDIENCE.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle className="size-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Educator Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tu educador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-start">
                  {course.educator.imageUrl ? (
                    <Image
                      src={course.educator.imageUrl}
                      alt={course.educator.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-2xl font-semibold text-muted-foreground">
                        {course.educator.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{course.educator.name}</h3>
                    {course.educator.title && (
                      <p className="text-sm text-primary">{course.educator.title}</p>
                    )}
                    {course.educator.bio && (
                      <p className="mt-2 text-muted-foreground text-sm">
                        {course.educator.bio}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Modality Card */}
            <Card>
              <CardHeader>
                <CardTitle>Modalidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="size-5 text-muted-foreground" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-muted-foreground" />
                    <div>
                      <span>{course.location}</span>
                      {course.address && (
                        <p className="text-sm text-muted-foreground">{course.address}</p>
                      )}
                    </div>
                  </div>
                )}
                {course.maxCapacity && (
                  <div className="flex items-center gap-3">
                    <Users className="size-5 text-muted-foreground" />
                    <span>Máximo {course.maxCapacity} personas</span>
                  </div>
                )}
                {isWset && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="size-5 text-muted-foreground" />
                    <span>Incluye examen de certificación</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dates Card */}
            <Card>
              <CardHeader>
                <CardTitle>Fechas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Inicio</p>
                    <span>{formatDate(course.startDate)}</span>
                  </div>
                </div>
                {course.endDate && (
                  <div className="flex items-center gap-3">
                    <CalendarDays className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Finalización</p>
                      <span>{formatDate(course.endDate)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Card */}
            <Card>
              <CardHeader>
                <CardTitle>Inversión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">
                  USD {course.priceUSD.toLocaleString('es-AR')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">IVA incluido</p>

                {isWset && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium mb-2">Incluye:</p>
                    <ul className="space-y-2">
                      {WSET_INCLUDED.map((item, index) => (
                        <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="size-4 text-primary flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CTA Button */}
            {canEnroll && (
              <Button asChild size="lg" className="w-full">
                <Link href={`/cursos/inscripcion/${course.id}`}>
                  Inscribite ahora
                </Link>
              </Button>
            )}

            {/* Requirements Card (for WSET) */}
            {isWset && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {WSET_REQUIREMENTS.map((req, index) => (
                      <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="size-4 text-primary flex-shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        links={footerLinks}
        contactInfo={contactInfo}
        onNavigate={handleNavigate}
        onSubscribe={handleSubscribe}
      />
    </div>
  )
}
