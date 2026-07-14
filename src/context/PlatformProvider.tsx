'use client'

import { createContext, useContext } from 'react'
import type { PlatformConfig } from '@/lib/platform'
import { PLATFORMS } from '@/lib/platform'

const PlatformContext = createContext<PlatformConfig>(PLATFORMS.bachillerato)

export function PlatformProvider({
  platform,
  children,
}: {
  platform: PlatformConfig
  children: React.ReactNode
}) {
  return (
    <PlatformContext.Provider value={platform}>
      {children}
    </PlatformContext.Provider>
  )
}

export function usePlatform(): PlatformConfig {
  return useContext(PlatformContext)
}
