import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLessonForPlayer } from '@/services/lesson-service'
import { isUserEnrolledInCourse } from '@/services/enrollment-service'
import { getCourseProgress } from '@/services/lesson-progress-service'
import { getEducatorByUserId } from '@/services/educator-service'
import { canEducatorViewStudent } from '@/services/enrollment-service'
import { CoursePlayer } from '@/components/learn/course-player'

export default async function LearnLessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
  searchParams: Promise<{ viewAs?: string }>
}) {
  const { courseSlug, lessonSlug } = await params
  const { viewAs } = await searchParams
  const session = await auth()

  if (!session?.user?.id) notFound()

  const lesson = await getLessonForPlayer(courseSlug, lessonSlug)
  if (!lesson) notFound()

  const course = lesson.module.course
  const userRole = session.user.role as string

  // Determine if this is a viewAs session (educator viewing as student)
  let viewAsStudentId: string | null = null
  if (viewAs && (userRole === 'educator' || userRole === 'superadmin')) {
    // Validate educator can view this student
    if (userRole === 'educator') {
      const educator = await getEducatorByUserId(session.user.id)
      if (educator) {
        const canView = await canEducatorViewStudent(educator.id, viewAs)
        if (canView) viewAsStudentId = viewAs
      }
    } else {
      // superadmin can view any student
      viewAsStudentId = viewAs
    }
  }

  const isPreview = (userRole === 'educator' || userRole === 'superadmin') && !viewAsStudentId
  const isFreeCourse = course.priceUSD === 0

  // For viewAs: check enrollment of the target student
  let isEnrolled: boolean
  if (viewAsStudentId) {
    const targetStudent = await prisma.student.findUnique({
      where: { id: viewAsStudentId },
      select: { userId: true },
    })
    isEnrolled = isFreeCourse || (targetStudent
      ? await isUserEnrolledInCourse(targetStudent.userId, course.id)
      : false)
  } else {
    isEnrolled = isPreview || isFreeCourse || await isUserEnrolledInCourse(session.user.id, course.id)
  }

  // Get student progress
  let completedLessonIds: string[] = []
  const studentId = viewAsStudentId || (await prisma.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  }))?.id

  if (studentId) {
    const progressMap = await getCourseProgress(studentId, course.id)
    completedLessonIds = [...progressMap.entries()]
      .filter(([, v]) => v.completed)
      .map(([id]) => id)
  }

  // Build the modules/lessons structure for the sidebar
  const modules = course.modules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    order: mod.order,
    lessons: mod.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      videoDuration: l.videoDuration,
      videoStatus: l.videoStatus,
      isFree: l.isFree,
      order: l.order,
      moduleId: l.moduleId,
    })),
  }))

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)

  return (
    <CoursePlayer
      courseSlug={courseSlug}
      courseId={course.id}
      courseTitle={course.title}
      modules={modules}
      currentLessonSlug={lessonSlug}
      currentLesson={{
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        summary: lesson.summary,
        videoDuration: lesson.videoDuration,
        videoStatus: lesson.videoStatus,
        muxPlaybackId: lesson.muxPlaybackId,
        isFree: lesson.isFree,
        moduleId: lesson.moduleId,
        materials: lesson.materials.map((m) => ({
          id: m.id,
          name: m.name,
          url: m.url,
          type: m.type,
        })),
      }}
      isEnrolled={isEnrolled}
      isPreview={isPreview}
      totalLessons={totalLessons}
      completedLessonIds={completedLessonIds}
      currentUserId={session.user.id}
      viewAsStudentId={viewAsStudentId}
    />
  )
}
