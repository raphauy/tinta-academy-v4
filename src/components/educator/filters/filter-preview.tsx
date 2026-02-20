'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { previewFilterAction } from '@/app/educator/filters/actions'
import type {
  FilterConditions,
  FilterPreviewResult,
  FilterPreviewStudent,
} from '@/types/audience-filter'
import { serializeConditions } from '@/types/audience-filter'

const PAGE_SIZE = 20

interface FilterPreviewProps {
  conditions: FilterConditions
  debounceMs?: number
}

export function FilterPreview({
  conditions,
  debounceMs = 500,
}: FilterPreviewProps) {
  const [preview, setPreview] = useState<FilterPreviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  // Memoize serialized conditions to use as stable dependency
  const conditionsJson = useMemo(
    () => serializeConditions(conditions),
    [conditions]
  )

  // Request ID to handle race conditions
  const requestIdRef = useRef(0)

  const fetchPreview = useCallback(async (pageNum: number) => {
    // Parse conditions from stable JSON string
    const parsedConditions = JSON.parse(conditionsJson) as FilterConditions

    // Don't fetch if conditions are empty
    if (
      parsedConditions.groups.length === 0 ||
      parsedConditions.groups.every((g) => g.conditions.length === 0)
    ) {
      setPreview(null)
      return
    }

    const currentRequestId = ++requestIdRef.current
    setLoading(true)
    setError(null)

    try {
      const result = await previewFilterAction({
        conditions: conditionsJson,
        limit: PAGE_SIZE,
        offset: pageNum * PAGE_SIZE,
      })

      // Ignore if a newer request has been made
      if (currentRequestId !== requestIdRef.current) return

      if (result.success && result.data) {
        setPreview(result.data)
      } else if (!result.success) {
        setError(result.error || 'Error al evaluar filtro')
      }
    } catch {
      // Ignore if a newer request has been made
      if (currentRequestId !== requestIdRef.current) return
      setError('Error al evaluar filtro')
    } finally {
      // Only update loading if this is still the current request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [conditionsJson])

  // Reset to page 0 when conditions change
  useEffect(() => {
    setPage(0)
    const timer = setTimeout(() => fetchPreview(0), debounceMs)
    return () => clearTimeout(timer)
  }, [conditionsJson, fetchPreview, debounceMs])

  // Fetch when page changes (but not on initial mount / conditions change)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    fetchPreview(page)
  }, [page, fetchPreview])

  const getStudentName = (student: FilterPreviewStudent) => {
    if (student.firstName || student.lastName) {
      return `${student.firstName || ''} ${student.lastName || ''}`.trim()
    }
    return student.email
  }

  const totalPages = preview ? Math.ceil(preview.count / PAGE_SIZE) : 0
  const showingFrom = preview && preview.count > 0 ? page * PAGE_SIZE + 1 : 0
  const showingTo = preview ? Math.min((page + 1) * PAGE_SIZE, preview.count) : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vista previa
          </CardTitle>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!loading && preview && (
            <Badge variant={preview.count > 0 ? 'default' : 'secondary'}>
              {preview.count}{' '}
              {preview.count === 1 ? 'estudiante' : 'estudiantes'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!error && !preview && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Agrega condiciones para ver una vista previa
          </p>
        )}

        {!error && preview && preview.count === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay estudiantes que coincidan con estas condiciones
          </p>
        )}

        {!error && preview && preview.count > 0 && (
          <div className="space-y-3">
            <div className="border rounded-md max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {getStudentName(student)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.email}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {showingFrom}-{showingTo} de {preview.count}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1 || loading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
