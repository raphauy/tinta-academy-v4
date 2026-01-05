import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
  isActive?: boolean
  children?: NavItem[]
}

export interface MainNavProps {
  items: NavItem[]
  onNavigate?: (href: string) => void
}

/**
 * MainNav - Sidebar navigation component
 * Supports nested items with expandable sections
 */
export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="px-3 space-y-1">
      {items.map((item) => (
        <NavItemComponent
          key={item.href}
          item={item}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}

interface NavItemComponentProps {
  item: NavItem
  onNavigate?: (href: string) => void
  depth?: number
}

function NavItemComponent({ item, onNavigate, depth = 0 }: NavItemComponentProps) {
  const [expanded, setExpanded] = useState(
    item.children?.some((child) => child.isActive) ?? false
  )
  const hasChildren = item.children && item.children.length > 0
  const Icon = item.icon

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded)
    } else {
      onNavigate?.(item.href)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          ${depth > 0 ? 'ml-6' : ''}
          ${
            item.isActive
              ? 'bg-[#143F3B] text-white'
              : 'text-[#2E2E2E] hover:bg-[#EBEBEB]'
          }
        `}
        style={{ fontFamily: 'Geist, system-ui, sans-serif' }}
      >
        {Icon && (
          <Icon
            size={18}
            className={item.isActive ? 'text-white' : 'text-[#7F7F7F]'}
          />
        )}
        <span className="flex-1 text-left">{item.label}</span>
        {hasChildren && (
          <span className={item.isActive ? 'text-white' : 'text-[#7F7F7F]'}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavItemComponent
              key={child.href}
              item={child}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
