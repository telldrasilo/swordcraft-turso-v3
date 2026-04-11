/**
 * Чистая логика: засчитывается ли завершение экспедиции для квеста «Эхо забытой кузни».
 */

import {
  FORGOTTEN_FORGE_QUEST_ID,
  getForgottenForgeExpeditionExpectation,
} from '@/data/quests/forgotten-forge'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

export function canAdvanceForgottenForgeAfterExpedition(input: {
  forgottenForgeQuest: ForgottenForgeQuestState
  forgottenForgePhase: string
  locationId?: string
  success: boolean
  linkedQuestId?: string
  linkedQuestTag?: string
}): boolean {
  if (input.linkedQuestId !== FORGOTTEN_FORGE_QUEST_ID) return false
  if (!input.success || !input.locationId) return false
  const q = input.forgottenForgeQuest
  if (q.status !== 'active' || input.forgottenForgePhase !== 'awaiting_expedition') return false

  const exp = getForgottenForgeExpeditionExpectation(q.step)
  if (!exp || exp.locationId !== input.locationId) return false
  if (exp.questTag != null && exp.questTag !== (input.linkedQuestTag ?? '')) return false
  if (exp.questTag == null && (input.linkedQuestTag != null && input.linkedQuestTag !== '')) {
    return false
  }
  return true
}
