'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, ChevronsUpDown, Plus, X, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  getTagsAction,
  createTagAction,
  type TagData,
} from '@/app/educator/actions'

interface TagSelectorProps {
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
  initialTags?: TagData[]
}

export function TagSelector({
  selectedTagIds,
  onChange,
  initialTags = [],
}: TagSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tags, setTags] = useState<TagData[]>(initialTags)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  // Fetch tags on mount if not provided
  const fetchTags = useCallback(async () => {
    if (tags.length > 0) return

    setLoading(true)
    try {
      const result = await getTagsAction()
      if (result.success && result.data) {
        setTags(result.data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    } finally {
      setLoading(false)
    }
  }, [tags.length])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))

  const handleSelect = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedTagIds, tagId])
    }
  }

  const handleRemove = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId))
  }

  const handleCreateTag = async () => {
    if (!searchValue.trim() || searchValue.trim().length < 2) return

    setCreating(true)
    try {
      const result = await createTagAction(searchValue.trim())
      if (result.success && result.data) {
        // Add new tag to list and select it
        setTags((prev) => [...prev, result.data!])
        onChange([...selectedTagIds, result.data.id])
        setSearchValue('')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    } finally {
      setCreating(false)
    }
  }

  // Check if search matches any existing tag
  const searchMatchesExisting = tags.some(
    (tag) =>
      tag.name.toLowerCase() === searchValue.toLowerCase() ||
      tag.slug === searchValue.toLowerCase().replace(/\s+/g, '-')
  )

  const showCreateOption =
    searchValue.trim().length >= 2 && !searchMatchesExisting

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Cargando tags...
              </>
            ) : selectedTagIds.length === 0 ? (
              'Busca o crea tags para categorizar tu curso'
            ) : (
              `${selectedTagIds.length} tag${selectedTagIds.length > 1 ? 's' : ''} seleccionado${selectedTagIds.length > 1 ? 's' : ''}`
            )}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={true}>
            <CommandInput
              placeholder="Buscar o crear tag..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {searchValue.trim().length < 2 ? (
                  <span className="text-muted-foreground">
                    Escribe al menos 2 caracteres
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    No se encontraron tags
                  </span>
                )}
              </CommandEmpty>
              <CommandGroup className="space-y-1 p-2">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id)
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => handleSelect(tag.id)}
                      className="flex items-center gap-2 p-1 aria-selected:bg-transparent"
                    >
                      <Check
                        className={cn(
                          'size-4 shrink-0',
                          isSelected
                            ? 'text-verde-uva-600 opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <Badge
                        variant="secondary"
                        className={cn(
                          'cursor-pointer px-3 py-1 transition-colors',
                          isSelected
                            ? 'bg-verde-uva-500 text-white hover:bg-verde-uva-600'
                            : 'bg-verde-uva-100 text-verde-uva-800 hover:bg-verde-uva-200'
                        )}
                      >
                        {tag.name}
                      </Badge>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {showCreateOption && (
                <CommandGroup>
                  <CommandItem
                    value={`create-${searchValue}`}
                    onSelect={handleCreateTag}
                    disabled={creating}
                    className="text-verde-uva-600"
                  >
                    {creating ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}
                    Crear &quot;{searchValue}&quot;
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="bg-verde-uva-100 text-verde-uva-800 hover:bg-verde-uva-200 transition-colors"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemove(tag.id)}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label={`Eliminar tag ${tag.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
