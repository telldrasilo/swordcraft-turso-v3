/**
 * Единая шина игровых сообщений (заготовка §6. CRAFT_SYSTEM_ROADMAP).
 */

import type { EncyclopediaTechniqueRef } from '@/types/encyclopedia-techniques'

export type GameMessageKind = 'encyclopedia' | 'archivist' | 'craft' | 'expedition' | 'system'

export interface GameMessageNavigationTarget {
  screen: string
  /** Опционально: id сущности для фокуса (каталожный materialId на экране энциклопедии). */
  entityId?: string
  /** Опционально: фокус карточки техники; приоритетнее `entityId` для screen encyclopedia. */
  techniqueRef?: EncyclopediaTechniqueRef
}

export interface GameMessage {
  id: string
  ts: number
  kind: GameMessageKind
  title: string
  body: string
  navigationTarget?: GameMessageNavigationTarget
  payload?: Record<string, unknown>
}
