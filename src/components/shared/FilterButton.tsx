'use client'

import { Button } from '@/components/ui/button'

interface FilterButtonProps {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  icon?: React.ReactNode
}

export function FilterButton({ children, active, onClick, icon }: FilterButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'secondary'}
      size="sm"
      onClick={onClick}
      className="gap-1.5"
    >
      {icon}
      {children}
    </Button>
  )
}
