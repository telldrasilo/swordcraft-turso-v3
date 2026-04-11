'use client'

import { SessionProvider } from 'next-auth/react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { ChunkLoadRecovery } from '@/components/providers/chunk-load-recovery'
import { WeaponRepairGuidanceListener } from '@/components/shared/weapon-repair-guidance-listener'
import { ChatMessagesToastListener } from '@/components/shared/chat-messages-toast-listener'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {/*
        Toaster раньше слушателей: toast() из ChatMessagesToastListener использует модульные
        listeners в use-toast — если тост показать до mount Toaster, уведомление теряется.
      */}
      <Toaster />
      <ChunkLoadRecovery />
      <WeaponRepairGuidanceListener />
      <ChatMessagesToastListener />
      <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
    </SessionProvider>
  )
}
