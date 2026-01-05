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
