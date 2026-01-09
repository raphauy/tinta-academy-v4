'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { NavItem } from './navigation-config'

export type { NavItem }

export interface MainNavProps {
  items: NavItem[]
  viewAsStudentId?: string
}

export function MainNav({ items, viewAsStudentId }: MainNavProps) {
  return (
    <nav className="space-y-1 px-3">
      {items.map((item) => (
        <NavItemComponent
          key={item.href}
          item={item}
          viewAsStudentId={viewAsStudentId}
        />
      ))}
    </nav>
  )
}

interface NavItemComponentProps {
  item: NavItem
  depth?: number
  viewAsStudentId?: string
}

function NavItemComponent({ item, depth = 0, viewAsStudentId }: NavItemComponentProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const hasActiveChild = item.children?.some(
    (child) =>
      pathname === child.href ||
      child.children?.some((grandchild) => pathname === grandchild.href)
  )

  const [expanded, setExpanded] = useState(hasActiveChild ?? false)
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  // Build href with viewAs query param if present
  const href = viewAsStudentId
    ? `${item.href}?viewAs=${viewAsStudentId}`
    : item.href

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            depth > 0 ? 'ml-6' : ''
          } ${
            hasActiveChild
              ? 'bg-primary/10 text-primary'
              : 'text-foreground hover:bg-secondary'
          }`}
        >
          {Icon && (
            <Icon
              size={18}
              className={hasActiveChild ? 'text-primary' : 'text-muted-foreground'}
            />
          )}
          <span className="flex-1 text-left">{item.label}</span>
          <span className={hasActiveChild ? 'text-primary' : 'text-muted-foreground'}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        </button>

        {expanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent
                key={child.href}
                item={child}
                depth={depth + 1}
                viewAsStudentId={viewAsStudentId}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        depth > 0 ? 'ml-6' : ''
      } ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground hover:bg-secondary'
      }`}
    >
      {Icon && (
        <Icon
          size={18}
          className={isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
        />
      )}
      <span className="flex-1 text-left">{item.label}</span>
    </Link>
  )
}
