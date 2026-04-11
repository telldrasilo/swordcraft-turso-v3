'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store'
import { toast } from '@/hooks/use-toast'
import type { GameMessagesDockChannel } from '@/types/forgotten-forge-quest'

function truncatePreview(text: string, maxLen: number): string {
  const t = text.trim()
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1))}…`
}

function showDockToast(channel: GameMessagesDockChannel, title: string, description: string) {
  toast({
    duration: 6500,
    title,
    description: truncatePreview(description, 180),
    className: 'cursor-pointer select-none',
    onClick: () => {
      useGameStore.getState().openMessagesDock(channel)
    },
  })
}

/**
 * Временные уведомления о новых сообщениях в ленте (энциклопедия / архивариус).
 * Клик по тосту открывает док на нужном канале. Базовая линия фиксируется после
 * rehydrate персиста, чтобы не дублировать старые сообщения при загрузке сейва.
 */
export function ChatMessagesToastListener() {
  const baselineRef = useRef<{
    archivistLastId?: string
    encyclopediaNewestId?: string
  } | null>(null)
  const toastsEnabledRef = useRef(false)

  useEffect(() => {
    const primeBaseline = () => {
      const state = useGameStore.getState()
      const thread = state.archivistDialogue?.thread ?? []
      const lastArch = thread[thread.length - 1]
      const msgs = Array.isArray(state.gameMessages) ? state.gameMessages : []
      const encSorted = msgs.filter((m) => m.kind === 'encyclopedia').sort((a, b) => b.ts - a.ts)
      const newestEnc = encSorted[0]
      baselineRef.current = {
        archivistLastId: lastArch?.id,
        encyclopediaNewestId: newestEnc?.id,
      }
    }

    const enableAndPrime = () => {
      primeBaseline()
      toastsEnabledRef.current = true
    }

    const unsubHydration = useGameStore.persist.onFinishHydration(() => {
      enableAndPrime()
    })
    if (useGameStore.persist.hasHydrated()) {
      enableAndPrime()
    }

    const fallbackEnable = window.setTimeout(() => {
      if (!toastsEnabledRef.current && useGameStore.persist.hasHydrated()) {
        enableAndPrime()
      }
    }, 2500)

    const unsubStore = useGameStore.subscribe((state) => {
      if (
        !toastsEnabledRef.current &&
        useGameStore.persist.hasHydrated()
      ) {
        enableAndPrime()
      }
      if (!toastsEnabledRef.current) return

      const thread = state.archivistDialogue?.thread ?? []
      const lastArch = thread[thread.length - 1]
      const msgs = Array.isArray(state.gameMessages) ? state.gameMessages : []
      const encSorted = msgs.filter((m) => m.kind === 'encyclopedia').sort((a, b) => b.ts - a.ts)
      const newestEnc = encSorted[0]

      const b = baselineRef.current
      if (!b) return

      if (lastArch) {
        if (lastArch.id !== b.archivistLastId) {
          const title = lastArch.speaker === 'archivist' ? 'Архивариус' : 'Диалог'
          showDockToast('archivist', title, lastArch.text)
          b.archivistLastId = lastArch.id
        }
      } else {
        b.archivistLastId = undefined
      }

      if (newestEnc) {
        if (newestEnc.id !== b.encyclopediaNewestId) {
          showDockToast(
            'encyclopedia',
            newestEnc.title?.trim() ? newestEnc.title : 'Энциклопедия',
            newestEnc.body
          )
          b.encyclopediaNewestId = newestEnc.id
        }
      } else {
        b.encyclopediaNewestId = undefined
      }
    })

    return () => {
      window.clearTimeout(fallbackEnable)
      unsubHydration()
      unsubStore()
    }
  }, [])

  return null
}
