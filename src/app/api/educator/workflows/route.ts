import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getEducatorByUserId } from '@/services/educator-service'
import { getWorkflowsForSelect } from '@/services/workflow-template-service'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'educator' && session.user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const educator = await getEducatorByUserId(session.user.id)

    if (!educator) {
      return NextResponse.json({ error: 'Educator not found' }, { status: 404 })
    }

    const workflows = await getWorkflowsForSelect(educator.id)

    return NextResponse.json({ workflows })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
