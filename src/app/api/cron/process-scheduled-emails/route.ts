import { NextResponse } from 'next/server'
import {
  getScheduledCampaignsDue,
  processCampaignSend,
} from '@/services/email-campaign-service'

/**
 * Cron endpoint to process scheduled email campaigns
 * Called by Vercel Cron every 15 minutes
 *
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET not configured')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron] Unauthorized access attempt')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  console.log('[Cron] Processing scheduled emails...')

  try {
    // Get all campaigns that are due for sending
    const dueCampaigns = await getScheduledCampaignsDue()

    if (dueCampaigns.length === 0) {
      console.log('[Cron] No scheduled campaigns due')
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No campaigns due for processing',
      })
    }

    console.log(`[Cron] Found ${dueCampaigns.length} campaigns to process`)

    const results: Array<{
      campaignId: string
      campaignName: string
      sent: number
      failed: number
      error?: string
    }> = []

    // Process each campaign
    for (const campaign of dueCampaigns) {
      console.log(`[Cron] Processing campaign: ${campaign.id} - ${campaign.name}`)

      try {
        const sendResult = await processCampaignSend(campaign.id)

        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          sent: sendResult.sent,
          failed: sendResult.failed,
        })

        console.log(
          `[Cron] Campaign ${campaign.id} processed: ${sendResult.sent} sent, ${sendResult.failed} failed`
        )
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'

        console.error(`[Cron] Error processing campaign ${campaign.id}:`, error)

        results.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          sent: 0,
          failed: 0,
          error: errorMessage,
        })
      }
    }

    // Calculate totals
    const totalSent = results.reduce((sum, r) => sum + r.sent, 0)
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0)
    const totalErrors = results.filter((r) => r.error).length

    console.log(
      `[Cron] Completed: ${dueCampaigns.length} campaigns, ${totalSent} sent, ${totalFailed} failed, ${totalErrors} errors`
    )

    return NextResponse.json({
      success: true,
      processed: dueCampaigns.length,
      totalSent,
      totalFailed,
      totalErrors,
      results,
    })
  } catch (error) {
    console.error('[Cron] Fatal error processing scheduled emails:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
