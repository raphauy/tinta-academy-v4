'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()

  /**
   * Check if path matches a nav item, considering:
   * 1. exactMatch flag - only match if pathname === href
   * 2. Query params - if href contains query params, they must match
   * 3. Sibling exclusion - don't match if a sibling with more specific href matches
   */
  const isPathActive = (href: string, exactMatch?: boolean, itemSiblings: NavItem[] = []) => {
    // Parse href to separate path from query params
    const [hrefPath, hrefQuery] = href.split('?')
    const hrefParams = new URLSearchParams(hrefQuery || '')

    // Exact match mode: only match if pathname equals href path
    if (exactMatch) {
      return pathname === hrefPath
    }

    // Check basic path match (exact or starts with)
    const basicMatch = pathname === hrefPath || pathname.startsWith(hrefPath + '/')
    if (!basicMatch) return false

    // If href has query params, check that they match current search params
    if (hrefQuery) {
      for (const [key, value] of hrefParams.entries()) {
        if (searchParams.get(key) !== value) {
          return false
        }
      }
    }

    // Check if a sibling with a more specific href matches
    // A sibling is "more specific" if its href starts with this href and also matches the pathname
    const hasBetterSiblingMatch = itemSiblings.some((sibling) => {
      if (sibling.href === href) return false // Same item
      const [siblingPath] = sibling.href.split('?')
      // Sibling is more specific if it starts with our href and matches pathname
      if (siblingPath.startsWith(hrefPath + '/') || hrefPath.startsWith(siblingPath + '/')) {
        const siblingMatches = pathname === siblingPath || pathname.startsWith(siblingPath + '/')
        // If sibling matches and has a longer (more specific) href, prefer it
        if (siblingMatches && siblingPath.length > hrefPath.length) {
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
