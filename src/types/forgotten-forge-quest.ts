/**
 * Квест «Эхо забытой кузни» — состояние в store.
 * @see docs/Quests/FORGOTTEN_FORGE.md
 */

export type ForgottenForgeQuestStatus = 'locked' | 'available' | 'active' | 'completed'

export type ForgottenForgePreFlag =
  | { step: 3; insurance: boolean }
  | { step: 5; cleanse: 'magic' | 'physical' }
  | { step: 6; anselm: 'deal' | 'theft' }

export interface ForgottenForgeQuestState {
  status: ForgottenForgeQuestStatus
  /** 0..7 по документу квеста */
  step: number
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
}

export interface ArchivistPendingChoice {
  id: string
  label: string
}

export interface ArchivistDialogueState {
  thread: ArchivistThreadEntry[]
}

export type GameMessagesDockChannel = 'encyclopedia' | 'archivist'
