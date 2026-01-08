import { Suspense } from 'react'
import { getUpcomingCourses, getPastCourses } from '@/services/course-service'
import { getTags } from '@/services/tag-service'
import { LandingClientWrapper, CourseCatalogSkeleton } from '@/components/landing'
import { footerLinks, contactInfo } from '@/config/footer'
import type { HeroContent, Course, Tag, CourseFilters } from '@/types/landing'
import type { Course as PrismaCourse, Tag as PrismaTag, Educator as PrismaEducator } from '@prisma/client'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

type PrismaCourseWithRelations = PrismaCourse & {
  educator: PrismaEducator
  tags: PrismaTag[]
}

// Transform Prisma data to landing page types
function transformCourse(prismaCourse: PrismaCourseWithRelations): Course {
  return {
    id: prismaCourse.id,
    slug: prismaCourse.slug,
    title: prismaCourse.title,
    type: prismaCourse.type,
    wsetLevel: prismaCourse.wsetLevel,
    modality: prismaCourse.modality,
    description: prismaCourse.description || '',
    startDate: prismaCourse.startDate,
    endDate: prismaCourse.endDate,
    duration: parseInt(prismaCourse.duration || '0'),
    maxCapacity: prismaCourse.maxCapacity,
    enrolledCount: prismaCourse.enrolledCount,
    priceUSD: prismaCourse.priceUSD,
    location: prismaCourse.location || (prismaCourse.modality === 'online' ? 'Online' : ''),
    address: prismaCourse.address,
    imageUrl: prismaCourse.imageUrl || '/placeholder-course.jpg',
    status: prismaCourse.status,
    educator: {
      id: prismaCourse.educator.id,
      name: prismaCourse.educator.name,
      title: prismaCourse.educator.title || '',
      bio: prismaCourse.educator.bio || '',
      imageUrl: prismaCourse.educator.imageUrl || '/placeholder-educator.jpg'
    },
    tags: prismaCourse.tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug
    }))
  }
}

function transformTag(prismaTag: PrismaTag): Tag {
  return {
    id: prismaTag.id,
    name: prismaTag.name,
    slug: prismaTag.slug
  }
}

// Configure hero content
const heroContent: HeroContent = {
  headline: "Tu Pasaporte a la Cultura del Vino",
  subheadline: "Tinta Academy es un centro de formación especializado en la educación sobre vinos donde vas a descubrir, enriquecer y elevar tu conocimiento sobre la cultura del vino con una perspectiva global.",
  ctaText: "Ver Cursos",
  videoUrl: "" // Using placeholder for now
}


export default async function HomePage({ searchParams }: PageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams

  // Parse initial filters from URL
  const initialFilters: CourseFilters = {
    modality: (params.modality as CourseFilters['modality']) || undefined,
    type: (params.type as CourseFilters['type']) || undefined,
    tagIds: params.tagIds
      ? (typeof params.tagIds === 'string' ? params.tagIds.split(',') : params.tagIds).filter(Boolean)
      : undefined,
  }

  // Fetch real data from services
  const upcomingCoursesRaw = await getUpcomingCourses()
  const pastCoursesRaw = await getPastCourses()
  const tagsRaw = await getTags()

  // Transform Prisma data to landing page types
  const upcomingCourses = upcomingCoursesRaw.map(transformCourse)
  const pastCourses = pastCoursesRaw.map(transformCourse)
  const tags = tagsRaw.map(transformTag)

  return (
    <Suspense fallback={<LandingFallback />}>
      <LandingClientWrapper
        heroContent={heroContent}
        tags={tags}
        upcomingCourses={upcomingCourses}
        pastCourses={pastCourses}
        footerLinks={footerLinks}
        contactInfo={contactInfo}
        initialFilters={initialFilters}
      />
    </Suspense>
  )
}

function LandingFallback() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative h-[60vh] min-h-[500px] bg-verde-uva-700 animate-pulse" />
      {/* Catalog Skeleton */}
      <CourseCatalogSkeleton />
    </div>
  )
}
