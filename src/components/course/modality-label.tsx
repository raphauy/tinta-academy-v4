import { MapPin } from 'lucide-react'
import { getModalityLabel, isCourseModality } from '@/lib/course-modality'
import { MODALITY_ICONS } from './modality-icons'

interface ModalityLabelProps {
  modality: string
  /**
   * Si se pasa, un curso presencial muestra su lugar en vez de "Presencial"
   * (con "Presencial" como respaldo cuando no hay lugar cargado).
   */
  location?: string | null
  iconClassName?: string
}

/** Ícono y texto de la modalidad, para usar dentro del badge de cada tarjeta. */
export function ModalityLabel({ modality, location, iconClassName }: ModalityLabelProps) {
  const Icon = isCourseModality(modality) ? MODALITY_ICONS[modality] : MapPin
  const label =
    modality === 'presencial' && location ? location : getModalityLabel(modality)

  return (
    <>
      <Icon size={12} className={iconClassName} />
      {label}
    </>
  )
}
