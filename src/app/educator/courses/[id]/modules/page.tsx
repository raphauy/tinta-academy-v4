import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseById } from '@/services/course-service'
import { getModulesByCourse } from '@/services/module-service'
import { CourseContentEditor } from '@/components/educator/modules/course-content-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ModulesPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ModulesPageProps) {
  const { id } = await params
  const course = await getCourseById(id)

  return {
    title: `Contenido: ${course?.title ?? 'Curso'} | Tinta Academy`,
  }
}

export default async function ModulesPage({ params }: ModulesPageProps) {
  const { id: courseId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
    redirect('/')
  }

  const educator = await getEducatorByUserId(session.user.id)
  if (!educator) {
    redirect('/')
  }

  const course = await getCourseById(courseId)
  if (!course || course.educatorId !== educator.id) {
    redirect('/educator/courses')
  }

  if (course.modality !== 'online') {
    redirect(`/educator/courses/${courseId}/edit`)
  }

  const modules = await getModulesByCourse(courseId)

  return (
    <div className="-mx-3 -mt-6 -mb-6 lg:-mx-5 lg:-mt-8 lg:-mb-8 flex h-screen flex-col overflow-hidden pb-3 lg:pb-5">
      <div className="flex items-center gap-3 px-1 py-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/educator/courses/${courseId}/edit`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">{course.title}</h1>
          <p className="text-sm text-muted-foreground">Gestión de contenido</p>
        </div>
      </div>

      <CourseContentEditor courseId={courseId} initialModules={modules} />
    </div>
  )
}
