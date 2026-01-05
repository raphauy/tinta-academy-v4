import type { Course, Educator } from '@/../product/sections/landing-and-cat-logo/types'
import { Calendar, Clock, Users, MapPin, Monitor } from 'lucide-react'

interface CourseCardProps {
  course: Course
  educator?: Educator
  onView?: () => void
}

// Sample images for different course types
const courseImages: Record<string, string> = {
  'wset': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&q=80',
  'taller': 'https://images.unsplash.com/photo-1543418219-44e30b057fea?w=600&q=80',
  'cata': 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=600&q=80',
  'curso': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
}

/**
 * CourseCard - Clean course card with visible image
 */
export function CourseCard({ course, educator, onView }: CourseCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getTypeLabel = (type: Course['type'], wsetLevel?: number) => {
    if (type === 'wset' && wsetLevel) {
      return `WSET ${wsetLevel}`
    }
    const labels: Record<string, string> = {
      wset: 'WSET',
      taller: 'Taller',
      cata: 'Cata',
      curso: 'Curso',
    }
    return labels[type] || type
  }

  const getTypeColor = (type: Course['type']) => {
    const colors: Record<string, string> = {
      wset: 'bg-[#143F3B] text-white',
      taller: 'bg-[#DDBBC0] text-[#2E2E2E]',
      cata: 'bg-[#AE8928] text-white',
      curso: 'bg-[#7F7F7F] text-white',
    }
    return colors[type] || 'bg-[#7F7F7F] text-white'
  }

  const imageUrl = courseImages[course.type] || courseImages['curso']

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[#E5E5E5]">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
            {getTypeLabel(course.type, course.wsetLevel)}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-[#2E2E2E]">
            {course.modality === 'online' ? (
              <>
                <Monitor size={12} />
                Online
              </>
            ) : (
              <>
                <MapPin size={12} />
                {course.location}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-[#2E2E2E] mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#666] mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Meta */}
        <div className="flex flex-wrap gap-3 text-sm text-[#666] mb-4">
          {course.startDate ? (
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} className="text-[#143F3B]" />
              {formatDate(course.startDate)}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Monitor size={14} className="text-[#143F3B]" />
              Acceso inmediato
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock size={14} className="text-[#143F3B]" />
            {course.duration}h
          </span>
          {course.maxCapacity && (
            <span className="inline-flex items-center gap-1">
              <Users size={14} className="text-[#143F3B]" />
              Máx. {course.maxCapacity}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E5] pt-4">
          <div className="flex items-center justify-between">
            {/* Educator */}
            {educator && (
              <div className="flex items-center gap-2">
                {educator.imageUrl ? (
                  <img
                    src={educator.imageUrl}
                    alt={educator.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#143F3B] flex items-center justify-center text-white text-xs font-semibold">
                    {educator.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[#2E2E2E]">{educator.name}</p>
                  <p className="text-xs text-[#666]">{educator.title}</p>
                </div>
              </div>
            )}

            {/* Price */}
            <div className="text-right">
              <p className="text-xl font-bold text-[#143F3B]">${course.priceUSD}</p>
              <p className="text-xs text-[#666]">USD</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onView}
          className="mt-4 w-full py-3 bg-[#143F3B] text-white font-medium rounded-xl hover:bg-[#1a524d] transition-colors"
        >
          Ver detalles
        </button>
      </div>
    </article>
  )
}
