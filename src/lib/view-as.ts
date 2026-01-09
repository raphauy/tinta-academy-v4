import { auth } from '@/lib/auth'
import { getStudentById, getStudentByUserId } from '@/services/student-service'
import { getEducatorByUserId } from '@/services/educator-service'
import { canEducatorViewStudent } from '@/services/enrollment-service'

type StudentWithUser = NonNullable<Awaited<ReturnType<typeof getStudentById>>>

export type ViewAsResult =
  | { authorized: false; reason: string }
  | { authorized: true; student: StudentWithUser; isViewingAs: boolean }

/**
 * Resolve the effective student for a student page request
 * Handles normal access, superadmin viewing, and educator viewing
 */
export async function resolveStudentForPage(
  viewAsStudentId: string | null | undefined
): Promise<ViewAsResult> {
  const session = await auth()

  if (!session?.user?.id) {
    return { authorized: false, reason: 'not_authenticated' }
  }

  const { role, id: userId } = session.user

  // If no viewAs param, get the current user's student profile
  if (!viewAsStudentId) {
    if (role !== 'student') {
      // Superadmin/educator accessing /student without viewAs - need to select a student
      return { authorized: false, reason: 'no_student_selected' }
    }
    const student = await getStudentByUserId(userId)
    if (!student) {
      return { authorized: false, reason: 'student_not_found' }
    }
    return { authorized: true, student, isViewingAs: false }
  }

  // viewAs is present - validate authorization
  const targetStudent = await getStudentById(viewAsStudentId)
  if (!targetStudent) {
    return { authorized: false, reason: 'target_student_not_found' }
  }

  if (role === 'superadmin') {
    // Superadmin can view any student
    return { authorized: true, student: targetStudent, isViewingAs: true }
  }

  if (role === 'educator') {
    // Educator must have the student enrolled in their courses
    const educator = await getEducatorByUserId(userId)
    if (!educator) {
      return { authorized: false, reason: 'educator_not_found' }
    }
    const canView = await canEducatorViewStudent(educator.id, viewAsStudentId)
    if (!canView) {
      return { authorized: false, reason: 'student_not_enrolled' }
    }
    return { authorized: true, student: targetStudent, isViewingAs: true }
  }

  // Students can view their own profile via viewAs if it matches their student id
  if (role === 'student') {
    const ownStudent = await getStudentByUserId(userId)
    if (ownStudent && ownStudent.id === viewAsStudentId) {
      return { authorized: true, student: targetStudent, isViewingAs: false }
    }
  }

  // Not authorized
  return { authorized: false, reason: 'not_authorized' }
}
