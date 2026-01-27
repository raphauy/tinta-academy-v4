import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getTags } from '@/services/tag-service'
import { PresencialCourseForm, WebinarCourseForm } from '@/components/educator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Construction } from 'lucide-react'

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

  // Online modality - coming soon
  if (modality === 'online') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Crear Curso Online
          </h1>
          <p className="text-muted-foreground">
            Cursos asincronos con materiales y contenido grabado.
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle>Proximamente</CardTitle>
            <CardDescription>
              Los cursos online estaran disponibles pronto.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Mientras tanto, puedes crear cursos presenciales o webinars en vivo.
            </p>
          </CardContent>
        </Card>
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
          Completa la informacion para crear un nuevo curso presencial. Podras
          agregar materiales del curso despues de crearlo.
        </p>
      </div>

      <PresencialCourseForm mode="create" initialTags={tags} />
    </div>
  )
}
