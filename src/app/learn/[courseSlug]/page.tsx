import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hasCourseAccess } from '@/services/lesson-access-service'

export default async function LearnCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>
  searchParams: Promise<{ viewAs?: string }>
}) {
  const { courseSlug } = await params
  const { viewAs } = await searchParams
  const session = await auth()
  const viewAsParam = viewAs ? `?viewAs=${viewAs}` : ''

  // Find the course with all lesson slugs
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      priceUSD: true,
      priceUYU: true,
      modules: {
        orderBy: { order: 'asc' },
        select: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, slug: true, isFree: true },
          },
        },
      },
    },
  })

  if (!course) notFound()

  const allLessons = course.modules.flatMap((m) => m.lessons)
  if (allLessons.length === 0) notFound()

  // Sin acceso al curso (por ejemplo, desde "Ver lecciones gratuitas"): a la primera lección gratis
  const hasAccess = session?.user?.id
    ? await hasCourseAccess({ id: session.user.id, role: session.user.role }, course)
    : false
  if (!hasAccess) {
    const firstFreeLesson = allLessons.find((l) => l.isFree) ?? allLessons[0]
    redirect(`/learn/${courseSlug}/${firstFreeLesson.slug}${viewAsParam}`)
  }

  // For viewAs, check progress of the target student
  const studentId = viewAs || (session?.user?.id
    ? (await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      }))?.id
    : null)

  if (studentId) {
    const lastProgress = await prisma.lessonProgress.findFirst({
      where: {
        studentId,
        lessonId: { in: allLessons.map((l) => l.id) },
      },
      orderBy: { updatedAt: 'desc' },
      select: { lesson: { select: { slug: true } } },
    })

    if (lastProgress) {
      redirect(`/learn/${courseSlug}/${lastProgress.lesson.slug}${viewAsParam}`)
    }
  }

  // Default: first lesson
  redirect(`/learn/${courseSlug}/${allLessons[0].slug}${viewAsParam}`)
}
