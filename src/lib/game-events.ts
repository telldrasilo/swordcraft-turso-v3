/**
 * Типизированная шина событий между системами (алтарь, квест, крафт).
 * Emit вызывать после commit в Zustand (например queueMicrotask).
 */

import type { AltarPhase } from '@/types/altar-construction'

export type GameEventPayloads = {
  'altar:phaseCompleted': { phase: AltarPhase }
  'craft:completed': { recipeId: string }
  'expedition:completed': { locationId: string; questTag?: string; success: boolean }
}

export type GameEventName = keyof GameEventPayloads

type Listener<K extends GameEventName> = (payload: GameEventPayloads[K]) => void

const buckets = new Map<GameEventName, Set<Listener<GameEventName>>>()

function getBucket<K extends GameEventName>(event: K): Set<Listener<K>> {
  let b = buckets.get(event) as Set<Listener<K>> | undefined
  if (!b) {
    b = new Set()
    buckets.set(event, b as Set<Listener<GameEventName>>)
  }
  return b
}

export const gameEvents = {
  on<K extends GameEventName>(event: K, fn: Listener<K>): () => void {
    const b = getBucket(event)
    b.add(fn as Listener<K>)
    return () => {
      b.delete(fn as Listener<K>)
    }
  },

  emit<K extends GameEventName>(event: K, payload: GameEventPayloads[K]): void {
    const b = buckets.get(event)
    if (!b) return
    for (const fn of [...b]) {
      try {
        ;(fn as Listener<K>)(payload)
      } catch (e) {
        console.error(`[gameEvents] ${event}`, e)
      }
    }
  },
}
