import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getTemplatesByEducator } from '@/services/email-template-service'
import { getStudentsForSelection } from '@/services/student-selection-service'
import { getEducatorCourses } from '@/services/course-service'
import { NewSendClient } from './new-send-client'

export default async function NewCommunicationPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const educator = await getEducatorByUserId(session.user.id)

  if (!educator) {
    redirect('/login')
  }

  // Fetch all data in parallel
  const [templates, courses, students] = await Promise.all([
    getTemplatesByEducator(educator.id),
    getEducatorCourses(educator.id),
    getStudentsForSelection(educator.id),
  ])

  // Transform templates for the selector
  const templatesForSelection = templates.map((t) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    body: t.body,
  }))

  // Transform courses for the selector (with student count)
  const coursesForSelection = courses.map((c) => ({
    id: c.id,
    title: c.title,
    studentCount: c._count.enrollments,
  }))

  // Transform students for the selector
  const studentsForSelection = students.map((s) => ({
    id: s.id,
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    courses: s.courses,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo envío</h1>
        <p className="text-muted-foreground">
          Envía un email a tus estudiantes
        </p>
      </div>

      <NewSendClient
        templates={templatesForSelection}
        courses={coursesForSelection}
        students={studentsForSelection}
      />
    </div>
  )
}
