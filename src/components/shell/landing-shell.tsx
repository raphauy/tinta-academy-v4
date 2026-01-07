'use client'

import { createContext, useContext } from 'react'
import type { UserMenuUser } from './user-menu'

interface LandingShellContextValue {
  user?: UserMenuUser
}

const LandingShellContext = createContext<LandingShellContextValue>({})

export function useLandingShell() {
  return useContext(LandingShellContext)
}

interface LandingShellProps {
  children: React.ReactNode
  user?: UserMenuUser
}

/**
 * LandingShell - Minimal shell for landing page (no sticky header)
 * The landing page has its own transparent header over the hero
 */
export function LandingShell({ children, user }: LandingShellProps) {
  return (
    <LandingShellContext.Provider value={{ user }}>
      <div className="min-h-screen">{children}</div>
    </LandingShellContext.Provider>
  )
}
