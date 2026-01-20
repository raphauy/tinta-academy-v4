'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FilterBuilder } from './filter-builder'
import { FilterPreview } from './filter-preview'
import {
  createFilterAction,
  updateFilterAction,
} from '@/app/educator/filters/actions'
import type {
  FilterConditions,
  AudienceFilterWithEducator,
} from '@/types/audience-filter'
import {
  createEmptyConditions,
  parseConditions,
  serializeConditions,
} from '@/types/audience-filter'

interface TagOption {
  slug: string
  name: string
}

interface FilterFormProps {
  filter?: AudienceFilterWithEducator
  tags: TagOption[]
}

export function FilterForm({ filter, tags }: FilterFormProps) {
  const router = useRouter()
  const isEditing = !!filter

  const [name, setName] = useState(filter?.name || '')
  const [description, setDescription] = useState(filter?.description || '')
  const [isPublic, setIsPublic] = useState(filter?.isPublic ?? true)
  const [conditions, setConditions] = useState<FilterConditions>(
    filter ? parseConditions(filter.conditions) : createEmptyConditions()
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    if (
      conditions.groups.length === 0 ||
      conditions.groups.every((g) => g.conditions.length === 0)
    ) {
      toast.error('Debe agregar al menos una condición')
      return
    }

    setSaving(true)

    try {
      const data = {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
        conditions: serializeConditions(conditions),
      }

      let result
      if (isEditing) {
        result = await updateFilterAction({ ...data, id: filter.id })
      } else {
        result = await createFilterAction(data)
      }

      if (result.success) {
        toast.success(
          isEditing
            ? 'Filtro actualizado correctamente'
            : 'Filtro creado correctamente'
        )
        router.push('/educator/filters')
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al guardar el filtro')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Left column - Form */}
        <div className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del filtro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Estudiantes WSET 1 presencial"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional del filtro..."
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="isPublic">Filtro público</Label>
                  <p className="text-sm text-muted-foreground">
                    Los filtros públicos pueden ser usados por otros educadores
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </CardContent>
          </Card>

          {/* Filter builder */}
          <Card>
            <CardHeader>
              <CardTitle>Condiciones del filtro</CardTitle>
            </CardHeader>
            <CardContent>
              <FilterBuilder
                conditions={conditions}
                onChange={setConditions}
                tags={tags}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Preview */}
        <div className="lg:sticky lg:top-4 lg:h-fit">
          <FilterPreview conditions={conditions} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/educator/filters')}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Guardar cambios' : 'Crear filtro'}
        </Button>
      </div>
    </form>
  )
}
