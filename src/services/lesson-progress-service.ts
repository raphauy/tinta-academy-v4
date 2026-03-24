import { prisma } from '@/lib/prisma'

// ============================================
// QUERIES
// ============================================

/**
 * Get progress for all lessons in a course for a student.
 * Returns a map of lessonId -> { completed, progressSeconds }
 */
export async function getCourseProgress(
  studentId: string,
  courseId: string
): Promise<
  Map<string, { completed: boolean; progressSeconds: number }>
> {
  const progress = await prisma.lessonProgress.findMany({
    where: {
      studentId,
      lesson: {
        module: { courseId },
      },
    },
    select: {
      lessonId: true,
      completed: true,
      progressSeconds: true,
    },
  })

  return new Map(
    progress.map((p) => [
      p.lessonId,
      { completed: p.completed, progressSeconds: p.progressSeconds },
    ])
  )
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Save video progress. Auto-marks as completed when reaching 90% of duration.
 */
export async function saveProgress(
  studentId: string,
  lessonId: string,
  progressSeconds: number,
  videoDuration: number | null
): Promise<{ completed: boolean }> {
  // Check if should auto-complete (90% threshold)
  const shouldComplete =
    videoDuration && videoDuration > 0
      ? progressSeconds >= videoDuration * 0.9
      : false

  const result = await prisma.lessonProgress.upsert({
    where: {
      lessonId_studentId: { lessonId, studentId },
    },
    create: {
      lessonId,
      studentId,
      progressSeconds,
      completed: shouldComplete,
      completedAt: shouldComplete ? new Date() : null,
    },
    update: {
      progressSeconds,
      // Only auto-complete, never auto-uncomplete
      ...(shouldComplete && {
        completed: true,
        completedAt: new Date(),
      }),
    },
    select: { completed: true },
  })

  return { completed: result.completed }
}

/**
 * Toggle lesson completion manually.
 */
export async function toggleLessonComplete(
  studentId: string,
  lessonId: string
): Promise<{ completed: boolean }> {
  const existing = await prisma.lessonProgress.findUnique({
    where: {
      lessonId_studentId: { lessonId, studentId },
    },
    select: { completed: true },
  })

  const newCompleted = !existing?.completed

  const result = await prisma.lessonProgress.upsert({
    where: {
      lessonId_studentId: { lessonId, studentId },
    },
    create: {
      lessonId,
      studentId,
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
    update: {
      completed: newCompleted,
      completedAt: newCompleted ? new Date() : null,
    },
    select: { completed: true },
  })

  return { completed: result.completed }
}
