'use client'

import { FilterForm } from '@/components/educator/filters'
import type { AudienceFilterWithEducator } from '@/types/audience-filter'

interface TagOption {
  slug: string
  name: string
}

interface EditFilterClientProps {
  filter: AudienceFilterWithEducator
  tags: TagOption[]
}

export function EditFilterClient({ filter, tags }: EditFilterClientProps) {
  return <FilterForm filter={filter} tags={tags} />
}
