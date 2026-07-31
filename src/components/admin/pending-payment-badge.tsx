import { Badge } from '@/components/ui/badge'

/**
 * Marca a quien cargo sus datos en el checkout y todavia no completo ningun
 * pago. El Student existe desde que se crea la orden, asi que estos registros
 * conviven en el listado con los de los alumnos que si compraron.
 */
export function PendingPaymentBadge() {
  return (
    <Badge
      variant="outline"
      className="flex-shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
    >
      Pago pendiente
    </Badge>
  )
}
