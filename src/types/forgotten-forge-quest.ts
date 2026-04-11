/**
 * Квест «Эхо забытой кузни» — состояние в store.
 * @see docs/Quests/FORGOTTEN_FORGE.md
 * @see docs/Quests/ALTAR_REWORK/FORGOTTEN_FORGE v2.md (шаги 0–18)
 */

import type { GameScreen } from '@/types/game'

/** Максимальный шаг сценария v2 (финал после фазы V). */
export const FORGOTTEN_FORGE_QUEST_STEP_MAX = 18

export type ForgottenForgeQuestStatus = 'locked' | 'available' | 'active' | 'completed'

export type ForgottenForgePreFlag =
  | { step: 3; insurance: boolean }
  | { step: 5; cleanse: 'magic' | 'physical' }
  | { step: 6; anselm: 'deal' | 'theft' }

export interface ForgottenForgeQuestState {
  status: ForgottenForgeQuestStatus
  /** Сюжетный шаг квеста v2: 0..FORGOTTEN_FORGE_QUEST_STEP_MAX */
  step: number
  /**
   * После завершения фазы II: ждём успешный крафт оружия v2 (см. CHAT.md).
   * Шаг при этом остаётся на ветке «ожидание крафта».
   */
  waitingForCraftAfterPhase2: boolean
  /** Опционально: отладка / аналитика переходов */
  lastStepChangeAt: number | null
  /** Выбор на шаге 0 (1–3) */
  step0Choice?: 1 | 2 | 3
  /** Страховка в шахтах (шаг 3), очистка (5), Ансельм (6) */
  flags: {
    step3Insurance?: boolean
    step5Cleanse?: 'magic' | 'physical'
    step6Anselm?: 'deal' | 'theft'
  }
}

export type ArchivistSpeaker = 'archivist' | 'player'

export interface ArchivistThreadEntry {
  id: string
  ts: number
  speaker: ArchivistSpeaker
  text: string
  /** Если задано, сообщение в доке ведёт на экран (например разблокировка алтаря). */
  ctaToScreen?: GameScreen
}

export interface ArchivistPendingChoice {
  id: string
  label: string
}

export interface ArchivistDialogueState {
  thread: ArchivistThreadEntry[]
}

export type GameMessagesDockChannel = 'encyclopedia' | 'archivist'
