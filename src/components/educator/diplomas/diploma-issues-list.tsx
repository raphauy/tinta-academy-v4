'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Loader2,
} from 'lucide-react'
import type { DiplomaIssue, DiplomaStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ResendConfirmationDialog } from './resend-confirmation-dialog'

type Props = {
  courseId: string
  issues: DiplomaIssue[]
}

const STATUS_ORDER: Record<DiplomaStatus, number> = {
  failed: 0,
  pending: 1,
  generating: 2,
  sending: 3,
  generated: 4,
  sent: 5,
}

function sortIssues(issues: DiplomaIssue[]): DiplomaIssue[] {
  return [...issues].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (byStatus !== 0) return byStatus
    return a.studentName.localeCompare(b.studentName, 'es')
  })
}

function StatusBadge({ status }: { status: DiplomaStatus }) {
  if (status === 'sent') {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Enviado
      </Badge>
    )
  }
  if (status === 'failed') {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="h-3.5 w-3.5" />
        Fallido
      </Badge>
    )
  }
  if (status === 'generated') {
    return (
      <Badge variant="info" className="gap-1">
        <FileText className="h-3.5 w-3.5" />
        Generado
      </Badge>
    )
  }
  if (status === 'generating' || status === 'sending') {
    return (
      <Badge variant="warning" className="gap-1">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {status === 'generating' ? 'Generando' : 'Enviando'}
      </Badge>
    )
  }
  return (
    <Badge variant="stone" className="gap-1">
      <Clock className="h-3.5 w-3.5" />
      Pendiente
    </Badge>
  )
}

function formatDateTime(value: Date | null): string {
  if (!value) return '—'
  return format(value, "d MMM, HH:mm", { locale: es })
}

export function DiplomaIssuesList({ courseId, issues }: Props) {
  if (issues.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay emisiones para este curso.
      </p>
    )
  }

  const sorted = sortIssues(issues)

  return (
    <TooltipProvider delayDuration={150}>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estudiante</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Generado</TableHead>
              <TableHead>Enviado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((issue) => {
              const hasAssets = !!(issue.pngUrl && issue.pdfUrl)
              const canResend =
                issue.status === 'sent' || issue.status === 'failed'
              return (
                <TableRow key={issue.id}>
                  <TableCell className="font-medium">
                    {issue.studentName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {issue.emailTo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={issue.status} />
                      {issue.status === 'failed' && issue.errorMessage && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-xs text-destructive underline decoration-dotted">
                              Ver error
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            {issue.errorMessage}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(issue.generatedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(issue.sentAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {hasAssets && (
                        <>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="cursor-pointer"
                          >
                            <a
                              href={issue.pngUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              PNG
                            </a>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="cursor-pointer"
                          >
                            <a
                              href={issue.pdfUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              PDF
                            </a>
                          </Button>
                        </>
                      )}
                      {canResend && (
                        <ResendConfirmationDialog
                          courseId={courseId}
                          issueId={issue.id}
                          studentName={issue.studentName}
                          emailTo={issue.emailTo}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
