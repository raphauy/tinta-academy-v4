import { Badge } from '@/components/ui/badge'
import { CLASS_KIND_LABELS, type ClassKind } from '@/lib/course-modality'

/** Tipo de una clase (presencial o virtual) junto a su fecha en el calendario de un semipresencial. */
export function ClassKindBadge({ kind }: { kind: ClassKind }) {
  return (
    <Badge variant="neutral" className="ml-2 align-middle">
      {CLASS_KIND_LABELS[kind]}
    </Badge>
  )
}
