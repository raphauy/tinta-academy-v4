import { Mail } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LocalDateTime } from '@/components/shared/local-date-time'
import type { EmailDeliveryStatus } from '@prisma/client'

interface Recipient {
  id: string
  email: string
  status: EmailDeliveryStatus
  sentAt: Date | null
  deliveredAt: Date | null
  openedAt: Date | null
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    user: {
      email: string
    }
  } | null
  user: {
    name: string | null
  } | null
}

interface CampaignRecipientsTableProps {
  recipients: Recipient[]
}

const statusConfig: Record<
  EmailDeliveryStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  pending: { label: 'Pendiente', variant: 'secondary' },
  sending: { label: 'Enviando', variant: 'secondary' },
  sent: { label: 'Enviado', variant: 'outline' },
  delivered: { label: 'Entregado', variant: 'default' },
  opened: { label: 'Abierto', variant: 'default' },
  clicked: { label: 'Click', variant: 'default' },
  bounced: { label: 'Rebotado', variant: 'destructive' },
  failed: { label: 'Fallido', variant: 'destructive' },
}

function getRecipientName(recipient: Recipient): string {
  if (recipient.student) {
    const parts = [recipient.student.firstName, recipient.student.lastName].filter(Boolean)
    if (parts.length > 0) return parts.join(' ')
  }
  return recipient.user?.name || 'Sin nombre'
}

export function CampaignRecipientsTable({ recipients }: CampaignRecipientsTableProps) {
  if (recipients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">
          No hay destinatarios en esta campaña
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Enviado</TableHead>
          <TableHead>Entregado</TableHead>
          <TableHead>Abierto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipients.map((recipient) => {
          const config = statusConfig[recipient.status]
          return (
            <TableRow key={recipient.id}>
              <TableCell className="font-medium">
                {getRecipientName(recipient)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {recipient.email}
              </TableCell>
              <TableCell>
                <Badge variant={config.variant}>{config.label}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <LocalDateTime date={recipient.sentAt} formatStr="dd MMM HH:mm" />
              </TableCell>
              <TableCell className="text-muted-foreground">
                <LocalDateTime date={recipient.deliveredAt} formatStr="dd MMM HH:mm" />
              </TableCell>
              <TableCell className="text-muted-foreground">
                <LocalDateTime date={recipient.openedAt} formatStr="dd MMM HH:mm" />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
