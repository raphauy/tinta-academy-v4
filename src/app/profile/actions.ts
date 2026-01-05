'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { updateUser, getUserById } from '@/services/user-service'
import { deleteImage } from '@/services/upload-service'
import { updateProfileSchema } from '@/lib/validations/profile'

type ActionResult =
  | { success: true; data: { name: string; image: string | null } }
  | { success: false; error: string }

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'No autenticado' }
  }

  const rawData = {
    name: formData.get('name') as string,
    image: (formData.get('image') as string) || null,
  }

  const validated = updateProfileSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0].message,
    }
  }

  try {
    const currentUser = await getUserById(session.user.id)
    const oldImage = currentUser?.image

    await updateUser(session.user.id, {
      name: validated.data.name,
      image: validated.data.image,
    })

    if (oldImage && oldImage !== validated.data.image) {
      try {
        await deleteImage(oldImage)
      } catch {
        console.warn('Could not delete old profile image:', oldImage)
      }
    }

    revalidatePath('/profile')
    revalidatePath('/admin')
    revalidatePath('/educator')
    revalidatePath('/student')

    return {
      success: true,
      data: {
        name: validated.data.name,
        image: validated.data.image ?? null,
      },
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: 'Error al actualizar el perfil',
    }
  }
}
