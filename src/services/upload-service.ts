'use server'

import { put, del } from '@vercel/blob'

type UploadResult =
  | { success: true; url: string }
  | { success: false; error: string }

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'No se proporcionó ningún archivo' }
  }

  if (!file.type.startsWith('image/')) {
    return { success: false, error: 'El archivo debe ser una imagen' }
  }

  const maxSize = 4 * 1024 * 1024 // 4MB
  if (file.size > maxSize) {
    return { success: false, error: 'El archivo no debe superar 4MB' }
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return { success: true, url: blob.url }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: 'Error al subir el archivo' }
  }
}

export async function deleteImage(url: string): Promise<UploadResult> {
  try {
    await del(url)
    return { success: true, url: '' }
  } catch (error) {
    console.error('Error deleting file:', error)
    return { success: false, error: 'Error al eliminar el archivo' }
  }
}

const allowedDocumentTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
]

const allowedVideoTypes = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
]

export async function uploadFile(
  formData: FormData,
  type: 'document' | 'video' | 'image'
): Promise<UploadResult> {
  const file = formData.get('file') as File | null

  if (!file) {
    return { success: false, error: 'No se proporciono ningun archivo' }
  }

  // Validate file type
  if (type === 'image' && !file.type.startsWith('image/')) {
    return { success: false, error: 'El archivo debe ser una imagen' }
  }

  if (type === 'document' && !allowedDocumentTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Formato no permitido. Usa PDF, Word, Excel, PowerPoint o texto.',
    }
  }

  if (type === 'video' && !allowedVideoTypes.includes(file.type)) {
    return {
      success: false,
      error: 'Formato no permitido. Usa MP4, WebM, MOV o AVI.',
    }
  }

  // Size limits
  const maxSizes = {
    image: 4 * 1024 * 1024, // 4MB
    document: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024, // 100MB
  }

  if (file.size > maxSizes[type]) {
    const limitMB = maxSizes[type] / 1024 / 1024
    return { success: false, error: `El archivo no debe superar ${limitMB}MB` }
  }

  try {
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return { success: true, url: blob.url }
  } catch (error) {
    console.error('Error uploading file:', error)
    return { success: false, error: 'Error al subir el archivo' }
  }
}
