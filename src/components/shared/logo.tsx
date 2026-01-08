'use client'

import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect -- Standard hydration pattern
  }, [])

  // Avoid hydration mismatch by showing nothing until mounted
  if (!mounted) {
    return <div className="relative h-10 w-36" />
  }

  return (
    <div className="relative h-10 w-36">
      <Image
        src={
          resolvedTheme === 'dark'
            ? '/TintaAcademy_Logo_Blanco.png'
            : '/TintaAcademy_Logo_Negro.png'
        }
        alt="Tinta Academy"
        fill
        className="object-contain"
        priority
      />
    </div>
  )
}
