import { auth } from '@/lib/auth'
import { generateCsv } from '@/lib/csv-export'
import { getCourseById } from '@/services/course-service'
import { getEducatorByUserId } from '@/services/educator-service'
import { getEnrollmentsByCourse } from '@/services/enrollment-service'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const TIMEZONE = 'America/Montevideo'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
}

function formatDate(date: Date | null): string {
  if (!date) return ''
  return format(toZonedTime(date, TIMEZONE), 'd/M/yyyy')
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
      return new Response('Forbidden', { status: 403 })
    }

    const educator = await getEducatorByUserId(session.user.id)
    if (!educator) {
      return new Response('Educator not found', { status: 404 })
    }

    const { courseId } = await params
    const course = await getCourseById(courseId)
    if (!course) {
      return new Response('Course not found', { status: 404 })
    }

    if (course.educatorId !== educator.id) {
      return new Response('Forbidden', { status: 403 })
    }

    const enrollments = await getEnrollmentsByCourse(courseId)

    const headers = [
      'Nombre',
      'Apellido',
      'Email',
      'Telefono',
      'Documento',
      'Fecha de Nacimiento',
      'Direccion',
      'Ciudad',
      'Pais',
      'Fecha de Inscripcion',
      'Estado',
      'Gastado USD',
      'Gastado UYU',
    ]

    const rows = enrollments.map((e) => [
      e.student.firstName || '',
      e.student.lastName || '',
      e.student.user.email || '',
      e.student.phone || '',
      e.student.identityDocument || '',
      formatDate(e.student.dateOfBirth),
      e.student.address || '',
      e.student.city || '',
      e.student.country || '',
      formatDate(e.enrolledAt),
      STATUS_LABELS[e.status] || e.status,
      e.courseSpentUSD.toString(),
      e.courseSpentUYU.toString(),
    ])

    const csv = generateCsv(headers, rows)
    const today = format(new Date(), 'yyyy-MM-dd')
    const filename = `alumnos_${course.slug}_${today}.csv`

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting students:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
