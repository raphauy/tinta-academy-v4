'use client'

import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

interface ViewAsContextValue {
  viewAsStudentId: string | null
  isViewingAs: boolean
  buildStudentUrl: (path: string) => string
}

const ViewAsContext = createContext<ViewAsContextValue | null>(null)

export function ViewAsProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const viewAsStudentId = searchParams.get('viewAs')
  const isViewingAs = !!viewAsStudentId

  const buildStudentUrl = useCallback(
    (path: string) => {
      if (!viewAsStudentId) return path
      const separator = path.includes('?') ? '&' : '?'
      return `${path}${separator}viewAs=${viewAsStudentId}`
    },
    [viewAsStudentId]
  )

  return (
    <ViewAsContext.Provider value={{ viewAsStudentId, isViewingAs, buildStudentUrl }}>
      {children}
    </ViewAsContext.Provider>
  )
}

export function useViewAs() {
  const context = useContext(ViewAsContext)
  if (!context) {
    throw new Error('useViewAs must be used within ViewAsProvider')
  }
  return context
}
