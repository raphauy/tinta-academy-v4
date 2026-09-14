import { Blend, MapPin, Monitor, Video, type LucideIcon } from 'lucide-react'
import type { CourseModality } from '@prisma/client'

export const MODALITY_ICONS: Record<CourseModality, LucideIcon> = {
  presencial: MapPin,
  semipresencial: Blend,
  webinar: Video,
  online: Monitor,
}

/** Ícono de cada tipo de clase de un curso con fecha. */
export const CLASS_ICONS: Record<'presencial' | 'virtual', LucideIcon> = {
  presencial: MapPin,
  virtual: Video,
}
