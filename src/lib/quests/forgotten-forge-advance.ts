/**
 * Чистая логика: засчитывается ли завершение экспедиции для квеста «Эхо забытой кузни».
 */

import {
  FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP,
  FORGOTTEN_FORGE_QUEST_ID,
} from '@/data/quests/forgotten-forge'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

export function canAdvanceForgottenForgeAfterExpedition(input: {
  forgottenForgeQuest: ForgottenForgeQuestState
  forgottenForgePhase: string
  locationId?: string
  success: boolean
  linkedQuestId?: string
}): boolean {
  if (input.linkedQuestId !== FORGOTTEN_FORGE_QUEST_ID) return false
  if (!input.success || !input.locationId) return false
  const q = input.forgottenForgeQuest
  if (q.status !== 'active' || input.forgottenForgePhase !== 'awaiting_expedition') return false
  const expected = FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP[q.step]
  return expected === input.locationId
}
