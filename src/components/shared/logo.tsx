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
    return <div className="relative h-9 w-40" />
  }

  return (
    <div className="relative h-9 w-40">
      <Image
        src={
          resolvedTheme === 'dark'
            ? '/TintaAcademy_Logo_Blanco.png'
            : '/TintaAcademy_Logo_Negro.png'
        }
        alt="Tinta Academy"
        fill
        sizes="160px"
        className="object-contain"
        priority
      />
    </div>
  )
}
