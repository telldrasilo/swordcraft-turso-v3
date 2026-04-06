'use client'

import { SessionProvider } from 'next-auth/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ChunkLoadRecovery } from '@/components/providers/chunk-load-recovery'
import { WeaponRepairGuidanceListener } from '@/components/shared/weapon-repair-guidance-listener'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChunkLoadRecovery />
      <WeaponRepairGuidanceListener />
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </SessionProvider>
  )
}
