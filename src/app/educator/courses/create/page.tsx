import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getTags } from '@/services/tag-service'
import { PresencialCourseForm, WebinarCourseForm, OnlineCourseForm } from '@/components/educator'

interface CreateCoursePageProps {
  searchParams: Promise<{ modality?: string }>
}

export async function generateMetadata({ searchParams }: CreateCoursePageProps) {
  const { modality } = await searchParams

  const titles: Record<string, string> = {
    presencial: 'Crear Curso Presencial',
    webinar: 'Crear Webinar',
    online: 'Crear Curso Online',
  }

  return {
    title: `${titles[modality ?? 'presencial'] ?? 'Crear Curso'} | Tinta Academy`,
  }
}

export default async function CreateCoursePage({ searchParams }: CreateCoursePageProps) {
  const { modality } = await searchParams
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

  const tags = await getTags()

  // Webinar modality
  if (modality === 'webinar') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Crear Webinar
          </h1>
          <p className="text-muted-foreground">
            Configura un evento en vivo transmitido por Zoom, Google Meet u otra plataforma.
          </p>
        </div>

        <WebinarCourseForm mode="create" initialTags={tags} />
      </div>
    )
  }

  // Online modality
  if (modality === 'online') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Crear Curso Online
          </h1>
          <p className="text-muted-foreground">
            Curso con videos grabados que los estudiantes pueden ver a su ritmo.
          </p>
        </div>

        <OnlineCourseForm mode="create" initialTags={tags} />
      </div>
    )
  }

  // Default: Presencial modality
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Crear Curso Presencial
        </h1>
        <p className="text-muted-foreground">
          Completá la información para crear un nuevo curso presencial. Podrás
          agregar materiales del curso despues de crearlo.
        </p>
      </div>

      <PresencialCourseForm mode="create" initialTags={tags} />
    </div>
  )
}
