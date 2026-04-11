/**
 * Связка экспедиции с квестом «Эхо забытой кузни» (linkedQuestId при старте).
 */

import { FORGOTTEN_FORGE_QUEST_ID, getForgottenForgeExpeditionExpectation } from '@/data/quests/forgotten-forge'
import type { QuestPhase } from '@/store/slices/forgotten-forge-quest-slice'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

export function getForgottenForgeLinkedQuestIdForExpedition(
  expedition: { moduleLocationId?: string },
  q: ForgottenForgeQuestState,
  phase: QuestPhase
): typeof FORGOTTEN_FORGE_QUEST_ID | undefined {
  if (q.status !== 'active' || phase !== 'awaiting_expedition') return undefined
  const exp = getForgottenForgeExpeditionExpectation(q.step)
  if (!exp || !exp.locationId || expedition.moduleLocationId !== exp.locationId) return undefined
  if (q.step === 5) {
    const c = q.flags.step5Cleanse
    if (c !== 'magic' && c !== 'physical') return undefined
  }
  return FORGOTTEN_FORGE_QUEST_ID
}

export function getForgottenForgeLinkedQuestTagForStep(step: number): string | undefined {
  return getForgottenForgeExpeditionExpectation(step)?.questTag
}
