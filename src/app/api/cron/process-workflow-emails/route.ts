import { NextResponse } from 'next/server'
import { processAllPendingExecutions } from '@/services/workflow-execution-service'

/**
 * Cron endpoint to process scheduled workflow emails
 * Called by Vercel Cron every 15 minutes
 *
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Workflow Cron] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Workflow Cron] Unauthorized access attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const now = new Date()
  console.log('[Workflow Cron] Processing workflow emails...')
  console.log('[Workflow Cron] Current server time (UTC):', now.toISOString())

  try {
    const result = await processAllPendingExecutions()

    console.log(
      `[Workflow Cron] Completed: ${result.processed} processed, ${result.sent} sent, ${result.failed} failed`
    )

    return NextResponse.json({
      success: true,
      ...result,
      serverTime: now.toISOString(),
    })
  } catch (error) {
    console.error('[Workflow Cron] Fatal error processing workflow emails:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
