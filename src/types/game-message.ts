/**
 * Единая шина игровых сообщений (заготовка §6. CRAFT_SYSTEM_ROADMAP).
 */

export type GameMessageKind = 'encyclopedia' | 'archivist' | 'craft' | 'expedition' | 'system'

export interface GameMessageNavigationTarget {
  screen: string
  /** Опционально: id сущности для фокуса */
  entityId?: string
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
