import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { PresencialCourseForm } from '@/components/educator'

export const metadata = {
  title: 'Crear Curso Presencial | Tinta Academy',
}

export default async function CreateCoursePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (
    session.user.role !== 'educator' &&
    session.user.role !== 'superadmin'
  ) {
    redirect('/')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Crear Curso Presencial
        </h1>
        <p className="text-muted-foreground">
          Completa la informacion para crear un nuevo curso presencial. Podras
          agregar materiales del curso despues de crearlo.
        </p>
      </div>

      <PresencialCourseForm mode="create" />
    </div>
  )
}
