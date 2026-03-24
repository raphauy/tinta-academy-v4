import Mux from '@mux/mux-node'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

// ============================================
// MUX CLIENT
// ============================================

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
})

// ============================================
// DIRECT UPLOAD
// ============================================

/**
 * Creates a Mux direct upload URL for a lesson.
 * The educator's browser uploads directly to Mux.
 */
export async function createDirectUpload(lessonId: string) {
  const upload = await mux.video.uploads.create({
    cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    new_asset_settings: {
      playback_policy: ['signed'],
      encoding_tier: 'baseline',
    },
  })

  // Save the upload ID so we can link the asset later via webhook
  // Don't change videoStatus yet — it stays 'pending' until Mux confirms the upload
  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      muxUploadId: upload.id,
    },
  })

  return {
    uploadId: upload.id,
    uploadUrl: upload.url,
  }
}

// ============================================
// SIGNED PLAYBACK TOKENS
// ============================================

/**
 * Generates a signed JWT for Mux playback.
 * Only call this after verifying the user has access.
 */
export function getSignedPlaybackToken(playbackId: string): string {
  const signingKeyId = process.env.MUX_SIGNING_KEY_ID
  const signingKeySecret = process.env.MUX_SIGNING_KEY_SECRET

  if (!signingKeyId || !signingKeySecret) {
    throw new Error('MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_SECRET must be set')
  }

  // Decode the base64-encoded private key
  const privateKey = Buffer.from(signingKeySecret, 'base64')

  const token = jwt.sign(
    {
      sub: playbackId,
      aud: 'v',
      exp: Math.floor(Date.now() / 1000) + 4 * 60 * 60, // 4 hours
      kid: signingKeyId,
    },
    privateKey,
    { algorithm: 'RS256' }
  )

  return token
}

// ============================================
// ASSET MANAGEMENT
// ============================================

/**
 * Retrieves asset info from Mux.
 */
export async function getAsset(assetId: string) {
  return mux.video.assets.retrieve(assetId)
}

/**
 * Deletes an asset from Mux. Called when a lesson is deleted.
 */
export async function deleteAsset(assetId: string) {
  try {
    await mux.video.assets.delete(assetId)
  } catch (error) {
    // Log but don't throw - the lesson is being deleted anyway
    console.error(`Failed to delete Mux asset ${assetId}:`, error)
  }
}

// ============================================
// WEBHOOK HANDLERS
// ============================================

/**
 * Handles video.upload.asset_created webhook.
 * Links the Mux asset ID to the lesson.
 */
export async function handleUploadAssetCreated(data: {
  upload_id: string
  asset_id: string
}) {
  const lesson = await prisma.lesson.findFirst({
    where: { muxUploadId: data.upload_id },
  })

  if (!lesson) {
    console.warn(`No lesson found for upload ${data.upload_id}`)
    return
  }

  await prisma.lesson.update({
    where: { id: lesson.id },
    data: {
      muxAssetId: data.asset_id,
      videoStatus: 'processing',
    },
  })
}

/**
 * Handles video.asset.ready webhook.
 * Updates the lesson with playback ID and duration.
 */
export async function handleAssetReady(data: {
  id: string
  playback_ids?: Array<{ id: string; policy: string }>
  duration?: number
}) {
  const lesson = await prisma.lesson.findFirst({
    where: { muxAssetId: data.id },
  })

  if (!lesson) {
    console.warn(`No lesson found for asset ${data.id}`)
    return
  }

  const signedPlaybackId = data.playback_ids?.find(
    (p) => p.policy === 'signed'
  )?.id

  await prisma.lesson.update({
    where: { id: lesson.id },
    data: {
      muxPlaybackId: signedPlaybackId || data.playback_ids?.[0]?.id,
      videoDuration: data.duration ? Math.round(data.duration) : null,
      videoStatus: 'ready',
    },
  })
}

/**
 * Handles video.asset.errored webhook.
 */
export async function handleAssetErrored(data: { id: string }) {
  const lesson = await prisma.lesson.findFirst({
    where: { muxAssetId: data.id },
  })

  if (!lesson) {
    console.warn(`No lesson found for asset ${data.id}`)
    return
  }

  await prisma.lesson.update({
    where: { id: lesson.id },
    data: { videoStatus: 'errored' },
  })
}
