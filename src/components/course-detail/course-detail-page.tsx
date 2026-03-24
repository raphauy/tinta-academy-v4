'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Course, Educator, Tag } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/landing'
import { footerLinks, contactInfo } from '@/config/footer'
import { subscribeToNewsletter } from '@/app/(public)/actions'
import { toast } from 'sonner'
import { toLocalDate } from '@/lib/utils'
import {
  Clock,
  MapPin,
  Users,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  BookOpen,
  AlertCircle,
  ShoppingCart,
  PlayCircle,
  ChevronDown,
  ChevronRight,
  Lock,
} from 'lucide-react'

type CourseWithRelations = Course & {
  educator: Educator
  tags: Tag[]
  modules?: Array<{
    id: string
    title: string
    order: number
    lessons: Array<{
      id: string
      title: string
      slug: string
      videoDuration: number | null
      videoStatus: string
      isFree: boolean
      order: number
    }>
  }>
}

interface CourseDetailPageProps {
  course: CourseWithRelations
  isEnrolled?: boolean
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatMonthYear(date: Date | null): string {
  if (!date) return ''
  const formatted = new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
  }).format(toLocalDate(date))
  return capitalizeFirst(formatted)
}

function formatClassDate(date: Date): string {
  const formatted = format(toLocalDate(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  return capitalizeFirst(formatted)
}

function getEndTime(startTime: string | null, durationMinutes: number | null): string {
  if (!startTime || !durationMinutes) return ''
  try {
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + durationMinutes
    const endHours = Math.floor(endMinutes / 60) % 24
    const endMins = endMinutes % 60
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  } catch {
    return ''
  }
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
    case 'experiencia':
      return 'Experiencia'
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

function getWsetIncluded(wsetLevel: number | null | undefined): string[] {
  const wineCount = wsetLevel === 1 ? 10 : wsetLevel === 2 ? 40 : 40
  return [
    'Material de estudio oficial WSET',
    'Examen de certificación internacional',
    `Cata técnica de ${wineCount} vinos durante el curso`,
    'Certificado Digital Oficial del WSET al aprobar',
  ]
}

export function CourseDetailPage({ course, isEnrolled = false }: CourseDetailPageProps) {
  const router = useRouter()
  const isWset = course.type === 'wset'

  // Determine enrollment state
  const enrollableStatuses = ['announced', 'enrolling', 'available']
  const isEnrollable = enrollableStatuses.includes(course.status)
  const isFull = course.maxCapacity ? course.enrolledCount >= course.maxCapacity : false
  // Compare with end of day so deadline day is fully included
  const isDeadlinePassed = course.registrationDeadline
    ? new Date() > endOfDay(new Date(course.registrationDeadline))
    : false
  const canEnroll = isEnrollable && !isFull && !isDeadlinePassed && !isEnrolled

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
          href="/#catalog"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver al catálogo
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={course.imageUrl || '/placeholder-course.jpg'}
            alt={course.title}
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-wider mb-2 opacity-80">
                {getCourseTypeName(course.type, course.wsetLevel)} • {course.modality}
              </p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {course.title}
              </h1>
              {course.startDate && (
                <h2 className="text-xl opacity-90">
                  {formatMonthYear(course.startDate)}
                </h2>
              )}
              <div className="mt-4">
                <span className="inline-block px-3 py-1 rounded-md bg-white/20 text-sm font-medium">
                  {getStatusText(course.status)}
                </span>
              </div>
            </div>
            {course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 md:justify-end">
                {course.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-white dark:bg-gray-800 text-foreground dark:text-white text-sm rounded-full font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
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
                    <CardTitle>¿Para quién es este curso?</CardTitle>
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

            {/* Dates Card */}
            {course.classDates && course.classDates.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fechas del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {course.classDates.map((date, index) => {
                    const endTime = getEndTime(course.startTime, course.classDuration)
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <BookOpen className="size-5 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Clase {index + 1}:</span>{' '}
                          <span>
                            {formatClassDate(new Date(date))}
                          </span>
                          {course.startTime && endTime && (
                            <span className="text-muted-foreground">
                              {' '}- {course.startTime} a {endTime} h
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Exam date for WSET */}
                  {isWset && course.examDate && (
                    <div className="flex items-start gap-3 pt-2 border-t">
                      <GraduationCap className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Examen:</span>{' '}
                        <span>
                          {formatClassDate(new Date(course.examDate))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Registration deadline */}
                  {course.registrationDeadline && (
                    <div className="flex items-start gap-3 pt-2 border-t">
                      <AlertCircle className="size-5 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-medium">Fecha límite de inscripción:</span>{' '}
                        <span>
                          {formatClassDate(new Date(course.registrationDeadline))}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Curriculum Card - Online courses */}
            {course.modality === 'online' && course.modules && course.modules.length > 0 && (
              <CurriculumSection modules={course.modules} />
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
                {course.modality === 'online' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <PlayCircle className="size-5 text-muted-foreground" />
                      <span>Online · A tu ritmo</span>
                    </div>
                    {course.modules && course.modules.length > 0 && (
                      <>
                        <div className="flex items-center gap-3">
                          <BookOpen className="size-5 text-muted-foreground" />
                          <span>
                            {course.modules.length} {course.modules.length === 1 ? 'módulo' : 'módulos'} · {course.modules.reduce((s, m) => s + m.lessons.length, 0)} lecciones
                          </span>
                        </div>
                        {(() => {
                          const totalSecs = course.modules.flatMap(m => m.lessons).reduce((s, l) => s + (l.videoDuration || 0), 0)
                          const hours = Math.round(totalSecs / 3600 * 10) / 10
                          return hours > 0 ? (
                            <div className="flex items-center gap-3">
                              <Clock className="size-5 text-muted-foreground" />
                              <span>{hours}h de contenido en video</span>
                            </div>
                          ) : null
                        })()}
                      </>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
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

            {/* Investment Card - hidden for finished courses */}
            {course.status !== 'finished' && (
              <Card>
                <CardHeader>
                  <CardTitle>Inversión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">
                    {course.priceUSD > 0
                      ? `USD ${course.priceUSD.toLocaleString('es-AR')}`
                      : (course.priceUYU ?? 0) > 0
                        ? `UYU ${course.priceUYU?.toLocaleString('es-AR')}`
                        : 'Gratis'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">IVA incluido</p>

                  {isWset && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="font-medium mb-2">Incluye:</p>
                      <ul className="space-y-2">
                        {getWsetIncluded(course.wsetLevel).map((item, index) => (
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
            )}

            {/* CTA Button */}
            {isEnrollable && (
              <>
                {isEnrolled ? (
                  course.modality === 'online' ? (
                    <Button asChild size="lg" className="w-full">
                      <Link href={`/learn/${course.slug}`}>
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Acceder al curso
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link href="/student">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ya estás inscrito
                      </Link>
                    </Button>
                  )
                ) : canEnroll ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/checkout/${course.id}`}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Inscribite ahora
                    </Link>
                  </Button>
                ) : isFull ? (
                  <Button disabled size="lg" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Cupo completo
                  </Button>
                ) : isDeadlinePassed ? (
                  <Button disabled size="lg" className="w-full">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Inscripciones cerradas
                  </Button>
                ) : null}

                {/* Preview free lessons — only for online courses when not enrolled */}
                {course.modality === 'online' && !isEnrolled && (
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href={`/learn/${course.slug}`}>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Ver lecciones gratuitas
                    </Link>
                  </Button>
                )}
              </>
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

// =============================================================================
// Curriculum Section for Online Courses
// =============================================================================

function formatLessonDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function CurriculumSection({
  modules,
}: {
  modules: NonNullable<CourseWithRelations['modules']>
}) {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalSeconds = modules
    .flatMap((m) => m.lessons)
    .reduce((sum, l) => sum + (l.videoDuration || 0), 0)
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(modules.length > 0 ? [modules[0].id] : [])
  )

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido del curso</CardTitle>
        <p className="text-sm text-muted-foreground">
          {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} · {totalLessons}{' '}
          {totalLessons === 1 ? 'lección' : 'lecciones'}
          {totalHours > 0 && ` · ${totalHours}h de contenido`}
        </p>
      </CardHeader>
      <CardContent className="space-y-1">
        {modules.map((mod) => {
          const isExpanded = expandedModules.has(mod.id)

          return (
            <div key={mod.id} className="rounded-lg border">
              <button
                onClick={() => toggleModule(mod.id)}
                className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-accent/50"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {mod.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {mod.lessons.length} {mod.lessons.length === 1 ? 'lección' : 'lecciones'}
                </span>
              </button>

              {isExpanded && (
                <div className="border-t px-4 py-2">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 py-2 text-sm"
                    >
                      {lesson.isFree ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-verde-uva-500" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">
                        {lesson.title}
                      </span>
                      {lesson.isFree && (
                        <span className="shrink-0 rounded bg-verde-uva-100 px-1.5 py-0.5 text-[10px] font-medium text-verde-uva-700 dark:bg-verde-uva-900/50 dark:text-verde-uva-300">
                          Gratis
                        </span>
                      )}
                      {lesson.videoDuration && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatLessonDuration(lesson.videoDuration)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
