import { getUpcomingCourses, getPastCourses } from '@/services/course-service'
import { getTags } from '@/services/tag-service'
import { LandingClientWrapper } from '@/components/landing'
import type { HeroContent, FooterLinks, ContactInfo, Course, Tag, CourseFilters } from '@/types/landing'
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
  headline: "Descubre el fascinante mundo del vino",
  subheadline: "Aprende de los mejores educadores con certificaciones WSET, degustaciones profesionales y talleres especializados. Eleva tu conocimiento vinícola al siguiente nivel.",
  ctaText: "Ver Cursos",
  videoUrl: "" // Using placeholder for now
}

// Configure footer links
const footerLinks: FooterLinks = {
  about: [
    { label: "Sobre nosotros", href: "/about" },
    { label: "Nuestro equipo", href: "/team" },
    { label: "Blog", href: "/blog" }
  ],
  courses: [
    { label: "Certificaciones WSET", href: "/cursos?type=wset" },
    { label: "Talleres", href: "/cursos?type=taller" },
    { label: "Catas", href: "/cursos?type=cata" }
  ],
  legal: [
    { label: "Política de Ajustes Razonables", href: "/politicas/ajuste-razonable" },
    { label: "Política de Conflicto de Intereses", href: "/politicas/conflicto-intereses" }
  ],
  social: [
    { label: "Instagram", href: "https://instagram.com/tintaacademy" },
    { label: "LinkedIn", href: "https://linkedin.com/company/tintaacademy" },
    { label: "YouTube", href: "https://youtube.com/tintaacademy" }
  ]
}

// Configure contact info
const contactInfo: ContactInfo = {
  email: "academy@tinta.wine",
  phone: "59892043904",
  address: "Montevideo, Uruguay"
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
    <LandingClientWrapper
      heroContent={heroContent}
      tags={tags}
      upcomingCourses={upcomingCourses}
      pastCourses={pastCourses}
      footerLinks={footerLinks}
      contactInfo={contactInfo}
      initialFilters={initialFilters}
    />
  )
}
