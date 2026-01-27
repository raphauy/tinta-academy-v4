import { NextResponse } from 'next/server'
import { notifyEducatorsAboutCourseStatus } from '@/services/course-status-notification-service'

/**
 * Cron endpoint to notify educators about courses needing status changes
 * Called by Vercel Cron daily at 8 AM UTC (5 AM Uruguay time)
 *
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Cron:CourseStatus] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron:CourseStatus] Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  console.log('[Cron:CourseStatus] Starting course status notification check...')
  console.log('[Cron:CourseStatus] Current server time (UTC):', now.toISOString())

  try {
    const result = await notifyEducatorsAboutCourseStatus()

    console.log(
      `[Cron:CourseStatus] Completed: ${result.educatorsNotified} educators notified, ${result.coursesReported} courses reported`
    )

    return NextResponse.json({
      success: true,
      educatorsNotified: result.educatorsNotified,
      coursesReported: result.coursesReported,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[Cron:CourseStatus] Fatal error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
