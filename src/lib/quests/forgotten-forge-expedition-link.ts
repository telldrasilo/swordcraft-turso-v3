/**
 * Связка экспедиции с квестом «Эхо забытой кузни» (linkedQuestId при старте).
 */

import {
  FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP,
  FORGOTTEN_FORGE_QUEST_ID,
} from '@/data/quests/forgotten-forge'
import type { QuestPhase } from '@/store/slices/forgotten-forge-quest-slice'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

export function getForgottenForgeLinkedQuestIdForExpedition(
  expedition: { moduleLocationId?: string },
  q: ForgottenForgeQuestState,
  phase: QuestPhase
): typeof FORGOTTEN_FORGE_QUEST_ID | undefined {
  if (q.status !== 'active' || phase !== 'awaiting_expedition') return undefined
  const need = FORGOTTEN_FORGE_EXPEDITION_LOCATION_BY_STEP[q.step]
  if (!need || expedition.moduleLocationId !== need) return undefined
  if (q.step === 5) {
    const c = q.flags.step5Cleanse
    if (c !== 'magic' && c !== 'physical') return undefined
  }
  return FORGOTTEN_FORGE_QUEST_ID
}
