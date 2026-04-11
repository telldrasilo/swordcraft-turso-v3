/**
 * Primary CTA для карточки особого задания «Эхо забытой кузни» (гильдия → Особые задания).
 */

import { getForgottenForgeExpeditionExpectation } from '@/data/quests/forgotten-forge'
import type { QuestPhase } from '@/store/slices/forgotten-forge-quest-slice'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

export type ForgottenForgeQuestCardPrimaryCta =
  | { kind: 'expedition'; label: string }
  | { kind: 'forge'; label: string }
  | { kind: 'altar'; label: string }
  | { kind: 'archivist'; label: string }
  | { kind: 'none' }

const LABEL = {
  expedition: 'К экспедициям',
  forge: 'К крафту',
  altar: 'К алтарю',
  archivist: 'К архивариусу',
} as const

function altarStepsOpen(step: number): boolean {
  return step === 8 || step === 9 || step === 14 || step === 16 || step === 17
}

/**
 * Какое действие подсветить главной кнопкой карточки (не открывает UI сама — только описание для карточки).
 */
export function getForgottenForgeQuestCardPrimaryCta(
  quest: ForgottenForgeQuestState,
  phase: QuestPhase
): ForgottenForgeQuestCardPrimaryCta {
  if (quest.status === 'locked') {
    return { kind: 'none' }
  }

  if (quest.status === 'available') {
    return { kind: 'archivist', label: LABEL.archivist }
  }

  if (quest.status === 'completed') {
    return { kind: 'none' }
  }

  // active
  if (phase === 'intro') {
    return { kind: 'archivist', label: LABEL.archivist }
  }

  if (phase === 'post_expedition_dialogue') {
    return { kind: 'archivist', label: LABEL.archivist }
  }

  if (phase === 'awaiting_expedition') {
    if (getForgottenForgeExpeditionExpectation(quest.step)) {
      return { kind: 'expedition', label: LABEL.expedition }
    }
    return { kind: 'archivist', label: LABEL.archivist }
  }

  if (phase === 'open') {
    const { step, waitingForCraftAfterPhase2: waitCraft } = quest
    if (step === 9 && waitCraft) {
      return { kind: 'forge', label: LABEL.forge }
    }
    if (altarStepsOpen(step) && !(step === 9 && waitCraft)) {
      return { kind: 'altar', label: LABEL.altar }
    }
    if (step === 7 || step === 0) {
      return { kind: 'archivist', label: LABEL.archivist }
    }
    if (step === 11 || step === 12 || step === 13 || step === 15) {
      return { kind: 'expedition', label: LABEL.expedition }
    }
    return { kind: 'archivist', label: LABEL.archivist }
  }

  if (phase === 'locked' || phase === 'completed') {
    return { kind: 'none' }
  }

  return { kind: 'none' }
}
