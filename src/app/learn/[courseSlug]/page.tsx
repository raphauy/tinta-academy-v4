import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      modules: {
        orderBy: { order: 'asc' },
        select: {
          lessons: {
            orderBy: { order: 'asc' },
            select: { id: true, slug: true },
          },
        },
      },
    },
  })

  if (!course) notFound()

  const allLessons = course.modules.flatMap((m) => m.lessons)
  if (allLessons.length === 0) notFound()

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
