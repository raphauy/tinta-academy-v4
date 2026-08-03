'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { DiplomaIssue } from '@prisma/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ExcludeIssueDialog } from './exclude-issue-dialog'

type Props = {
  issues: DiplomaIssue[]
  /**
   * Si es true, muestra cualquier issue con asset PNG disponible (incluye
   * `sent` y `failed` con asset). Si es false (default), solo `generated`.
   */
  includeAllWithAssets?: boolean
  /**
   * Habilita "No enviar" por diploma. Requiere `courseId`. Se usa en el paso
   * de revisión, donde el educador decide a quién le llega el diploma.
   */
  courseId?: string
}

export function DiplomaGrid({
  issues,
  includeAllWithAssets = false,
  courseId,
}: Props) {
  const visible = issues.filter((i) =>
    includeAllWithAssets
      ? !!i.pngUrl
      : i.status === 'generated' && !!i.pngUrl
  )
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null)

  const close = useCallback(() => setZoomedIndex(null), [])
  const goPrev = useCallback(() => {
    setZoomedIndex((idx) =>
      idx === null || idx <= 0 ? idx : idx - 1
    )
  }, [])
  const goNext = useCallback(() => {
    setZoomedIndex((idx) =>
      idx === null || idx >= visible.length - 1 ? idx : idx + 1
    )
  }, [visible.length])

  // Atajos de teclado mientras hay un diploma abierto.
  useEffect(() => {
    if (zoomedIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoomedIndex, goPrev, goNext])

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay diplomas generados para mostrar.
      </p>
    )
  }

  const zoomed = zoomedIndex !== null ? visible[zoomedIndex] : null
  const hasPrev = zoomedIndex !== null && zoomedIndex > 0
  const hasNext = zoomedIndex !== null && zoomedIndex < visible.length - 1

  return (
    <>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((issue, idx) => (
          <Card
            key={issue.id}
            className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition"
            onClick={() => setZoomedIndex(idx)}
          >
            <div className="aspect-[1.414/1] bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={issue.pngUrl!}
                alt={`Diploma de ${issue.studentName}`}
                loading="lazy"
                className="w-full h-full object-contain"
              />
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium leading-tight truncate">
                {issue.studentName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {issue.emailTo}
              </p>
              {courseId && (
                <div className="mt-2 flex justify-end border-t pt-2">
                  <ExcludeIssueDialog
                    courseId={courseId}
                    issueId={issue.id}
                    studentName={issue.studentName}
                    stopPropagation
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={zoomed !== null} onOpenChange={(open) => !open && close()}>
        <DialogContent className="sm:max-w-[min(95vw,1400px)] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8">
              <span className="truncate">{zoomed?.studentName}</span>
              <span className="text-xs font-normal text-muted-foreground shrink-0">
                {zoomedIndex !== null
                  ? `${zoomedIndex + 1} de ${visible.length}`
                  : ''}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="relative">
            {zoomed?.pngUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={zoomed.pngUrl}
                alt={`Diploma de ${zoomed.studentName}`}
                className="block w-full h-auto max-h-[80vh] object-contain mx-auto"
              />
            )}

            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full shadow disabled:opacity-40"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label="Diploma anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full shadow disabled:opacity-40"
              onClick={goNext}
              disabled={!hasNext}
              aria-label="Diploma siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Usá las flechas del teclado para navegar
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
