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
          siblings={items}
          viewAsStudentId={viewAsStudentId}
        />
      ))}
    </nav>
  )
}

interface NavItemComponentProps {
  item: NavItem
  siblings?: NavItem[]
  depth?: number
  viewAsStudentId?: string
}

function NavItemComponent({ item, siblings = [], depth = 0, viewAsStudentId }: NavItemComponentProps) {
  const pathname = usePathname()

  /**
   * Check if path matches a nav item, considering:
   * 1. exactMatch flag - only match if pathname === href
   * 2. Sibling exclusion - don't match if a sibling with more specific href matches
   */
  const isPathActive = (href: string, exactMatch?: boolean, itemSiblings: NavItem[] = []) => {
    // Exact match mode: only match if pathname equals href
    if (exactMatch) {
      return pathname === href
    }

    // Check basic match (exact or starts with)
    const basicMatch = pathname === href || pathname.startsWith(href + '/')
    if (!basicMatch) return false

    // Check if a sibling with a more specific href matches
    // A sibling is "more specific" if its href starts with this href and also matches the pathname
    const hasBetterSiblingMatch = itemSiblings.some((sibling) => {
      if (sibling.href === href) return false // Same item
      // Sibling is more specific if it starts with our href and matches pathname
      if (sibling.href.startsWith(href + '/') || href.startsWith(sibling.href + '/')) {
        const siblingMatches = pathname === sibling.href || pathname.startsWith(sibling.href + '/')
        // If sibling matches and has a longer (more specific) href, prefer it
        if (siblingMatches && sibling.href.length > href.length) {
          return true
        }
      }
      return false
    })

    return !hasBetterSiblingMatch
  }

  const isActive = isPathActive(item.href, item.exactMatch, siblings)
  const hasActiveChild = item.children?.some(
    (child) =>
      isPathActive(child.href, child.exactMatch, item.children) ||
      child.children?.some((grandchild) => isPathActive(grandchild.href, grandchild.exactMatch, child.children))
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
                siblings={item.children}
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
