import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { DiplomaIssue } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Props = {
  issues: DiplomaIssue[]
}

export function EmissionSummary({ issues }: Props) {
  if (issues.length === 0) return null

  const sentCount = issues.filter((i) => i.status === 'sent').length
  const failedCount = issues.filter((i) => i.status === 'failed').length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3 text-base">
          <span>Diplomas emitidos</span>
          {sentCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              {sentCount} enviado{sentCount === 1 ? '' : 's'}
            </Badge>
          )}
          {failedCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {failedCount} fallido{failedCount === 1 ? '' : 's'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium">{issue.studentName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {issue.emailTo}
                </TableCell>
                <TableCell>
                  {issue.status === 'sent' && (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Enviado
                    </Badge>
                  )}
                  {issue.status === 'failed' && (
                    <Badge variant="destructive">Fallido</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {issue.status === 'sent' && issue.sentAt
                    ? `Enviado el ${format(issue.sentAt, "d 'de' MMMM, HH:mm", { locale: es })}`
                    : issue.errorMessage ?? ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
