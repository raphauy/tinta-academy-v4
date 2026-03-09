import { auth } from '@/lib/auth'
import { generateWsetCrf } from '@/lib/wset-crf-export'
import { getCourseById } from '@/services/course-service'
import { getEducatorByUserId } from '@/services/educator-service'
import { getEnrollmentsByCourse } from '@/services/enrollment-service'
import { format } from 'date-fns'

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

    if (course.wsetLevel === null) {
      return new Response('This course is not a WSET course', { status: 400 })
    }

    const enrollments = await getEnrollmentsByCourse(courseId)
    const confirmedEnrollments = enrollments.filter((e) => e.status === 'confirmed')

    const students = confirmedEnrollments.map((e) => ({
      firstName: e.student.firstName,
      lastName: e.student.lastName,
      dateOfBirth: e.student.dateOfBirth,
      email: e.student.user.email,
    }))

    const buffer = await generateWsetCrf(
      { examDate: course.examDate, examTime: course.examTime },
      students
    )

    const today = format(new Date(), 'yyyy-MM-dd')
    const filename = `WSET_CRF_${course.slug}_${today}.xlsx`

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting WSET CRF:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
