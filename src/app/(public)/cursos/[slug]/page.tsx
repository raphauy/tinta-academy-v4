import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCourseBySlug } from '@/services/course-service'
import { isUserEnrolledInCourse } from '@/services/enrollment-service'
import { CourseDetailPage } from '@/components/course-detail'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    return {
      title: 'Curso no encontrado | Tinta Academy',
    }
  }

  const courseTypeName = course.type === 'wset' && course.wsetLevel
    ? `WSET Nivel ${course.wsetLevel}`
    : course.type.charAt(0).toUpperCase() + course.type.slice(1)

  return {
    title: `${course.title} | Tinta Academy`,
    description: course.description || `${courseTypeName} - ${course.modality} en Tinta Academy`,
    openGraph: {
      title: course.title,
      description: course.description || `${courseTypeName} de vinos en Tinta Academy`,
      images: course.imageUrl ? [course.imageUrl] : [],
    },
  }
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  // Check if user is enrolled
  const session = await auth()
  const isEnrolled = session?.user?.id
    ? await isUserEnrolledInCourse(session.user.id, course.id)
    : false

  return <CourseDetailPage course={course} isEnrolled={isEnrolled} />
}
