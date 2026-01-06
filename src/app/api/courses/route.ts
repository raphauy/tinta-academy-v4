import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modality = searchParams.get('modality')
    const type = searchParams.get('type') 
    const tagIds = searchParams.get('tagIds')?.split(',').filter(Boolean)

    // Build where clause for filtering
    const where: any = {}
    
    if (modality) {
      where.modality = modality
    }
    
    if (type) {
      where.type = type
    }
    
    if (tagIds?.length) {
      where.tags = {
        some: {
          id: { in: tagIds }
        }
      }
    }

    // Fetch courses with educator and tags
    const courses = await prisma.course.findMany({
      where,
      include: {
        educator: true,
        tags: true,
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    // Separate upcoming from past courses
    const now = new Date()
    const upcomingCourses = courses.filter(course => 
      course.status === 'available' || 
      (course.startDate && course.startDate > now)
    )
    
    const pastCourses = courses.filter(course => 
      course.status === 'finished' || 
      (course.startDate && course.startDate <= now && course.status !== 'available')
    )

    return NextResponse.json({
      upcomingCourses,
      pastCourses
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}