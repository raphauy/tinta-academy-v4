import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Award, ShieldCheck } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCourseById } from '@/services/course-service'
import { getEducatorByUserId } from '@/services/educator-service'
import { getDiplomaTemplateByCourseId } from '@/services/diploma-template-service'
import { cleanupStaleDiplomaIssues } from '@/services/diploma-service'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DiplomaWorkspaceClient } from '@/components/educator/diplomas/diploma-workspace-client'

export const maxDuration = 800

interface DiplomaPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: DiplomaPageProps) {
  const { id } = await params
  const course = await getCourseById(id)
  return {
    title: course
      ? `Diploma: ${course.title} | Tinta Academy`
      : 'Diploma | Tinta Academy',
  }
}

const TERMINAL_STATUSES = ['generated', 'sending', 'sent'] as const

export default async function DiplomaPage({ params }: DiplomaPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    redirect('/')
  }

  const course = await getCourseById(id)
  if (!course) notFound()

  if (session.user.role === 'educator') {
    const educator = await getEducatorByUserId(session.user.id)
    if (!educator) redirect('/')
    if (course.educatorId !== educator.id) redirect('/educator/courses')
  }

  // Cursos WSET: emiten desde Londres. Mostramos info, sin editor.
  if (course.type === 'wset') {
    return (
      <div className="container mx-auto max-w-3xl space-y-4 py-6">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/educator/courses/${course.id}/edit`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al curso
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Los cursos WSET emiten diplomas desde Londres
            </CardTitle>
            <CardDescription>
              Los exámenes WSET se corrigen en Londres y los diplomas son
              enviados directamente por WSET al estudiante. Tinta Academy no
              emite diplomas para esta familia de cursos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Liberar issues colgados de batches crasheados antes de renderizar.
  await cleanupStaleDiplomaIssues(course.id)

  const [template, issues, confirmedEnrollmentsCount] = await Promise.all([
    getDiplomaTemplateByCourseId(course.id),
    prisma.diplomaIssue.findMany({
      where: { courseId: course.id },
      orderBy: { studentName: 'asc' },
    }),
    prisma.enrollment.count({
      where: { courseId: course.id, status: 'confirmed' },
    }),
  ])

  const occupiedStudentIds = new Set(
    issues
      .filter((i) =>
        TERMINAL_STATUSES.includes(
          i.status as (typeof TERMINAL_STATUSES)[number]
        )
      )
      .map((i) => i.studentId)
  )
  const enrollmentsPendingCount = Math.max(
    0,
    confirmedEnrollmentsCount - occupiedStudentIds.size
  )

  return (
    <div className="container mx-auto max-w-6xl space-y-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link href={`/educator/courses/${course.id}/edit`}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver al curso
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Award className="h-6 w-6" />
            Diploma: {course.title}
          </h1>
        </div>
      </div>

      <DiplomaWorkspaceClient
        course={{
          id: course.id,
          title: course.title,
          classDates: course.classDates,
          endDate: course.endDate,
          startDate: course.startDate,
        }}
        initialTemplate={template}
        issues={issues}
        enrollmentsPendingCount={enrollmentsPendingCount}
        sessionEmail={session.user.email ?? ''}
      />
    </div>
  )
}
