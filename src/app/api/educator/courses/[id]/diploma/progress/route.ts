import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getCourseById } from '@/services/course-service'
import { getEducatorByUserId } from '@/services/educator-service'
import { getCourseProgress } from '@/services/diploma-service'

/**
 * Polling endpoint para el progreso de generación/envío de diplomas.
 *
 * Se expone como route handler (no server action) porque Next.js serializa
 * las server actions del mismo cliente: mientras `generateDiplomasAction` está
 * bloqueada (~30s), un polling vía server action queda encolado y nunca
 * reporta avance hasta que termina la generación.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const role = session.user.role
  if (role !== 'educator' && role !== 'superadmin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const course = await getCourseById(id)
  if (!course) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }
  if (role === 'educator') {
    const educator = await getEducatorByUserId(session.user.id)
    if (!educator || course.educatorId !== educator.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  }

  const progress = await getCourseProgress(id)
  return NextResponse.json(progress, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
