'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/game-store-composed'

/** Не чаще 1 с; догон после reload внутри updateAltarConstructionProgress. */
export function useAltarConstructionTick(active: boolean) {
  const update = useGameStore((s) => s.updateAltarConstructionProgress)
  const lastRef = useRef(0)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      const now = Date.now()
      if (now - lastRef.current < 900) return
      lastRef.current = now
      update(now)
    }, 1000)
    update(Date.now())
    return () => window.clearInterval(id)
  }, [active, update])
}
