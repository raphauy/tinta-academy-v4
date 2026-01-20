'use client'

import { FilterForm } from '@/components/educator/filters'

interface TagOption {
  slug: string
  name: string
}

interface NewFilterClientProps {
  tags: TagOption[]
}

export function NewFilterClient({ tags }: NewFilterClientProps) {
  return <FilterForm tags={tags} />
}
