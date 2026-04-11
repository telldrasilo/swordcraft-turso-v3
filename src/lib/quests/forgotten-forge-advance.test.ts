import { describe, expect, it } from 'vitest'
import { canAdvanceForgottenForgeAfterExpedition } from './forgotten-forge-advance'
import { FORGOTTEN_FORGE_QUEST_ID, FF_QUEST_EXPEDITION_TAGS } from '@/data/quests/forgotten-forge'

const baseQuest = {
  status: 'active' as const,
  step: 1,
  waitingForCraftAfterPhase2: false,
  lastStepChangeAt: null as number | null,
  flags: {},
}

describe('canAdvanceForgottenForgeAfterExpedition', () => {
  it('returns false without linked quest id', () => {
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: baseQuest,
        forgottenForgePhase: 'awaiting_expedition',
        locationId: 'oak_grove_outskirts',
        success: true,
        linkedQuestId: undefined,
      })
    ).toBe(false)
  })

  it('returns false on failure', () => {
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: baseQuest,
        forgottenForgePhase: 'awaiting_expedition',
        locationId: 'oak_grove_outskirts',
        success: false,
        linkedQuestId: FORGOTTEN_FORGE_QUEST_ID,
      })
    ).toBe(false)
  })

  it('returns true when step 1 and location matches oak grove', () => {
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: baseQuest,
        forgottenForgePhase: 'awaiting_expedition',
        locationId: 'oak_grove_outskirts',
        success: true,
        linkedQuestId: FORGOTTEN_FORGE_QUEST_ID,
      })
    ).toBe(true)
  })

  it('returns false when location does not match step', () => {
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: baseQuest,
        forgottenForgePhase: 'awaiting_expedition',
        locationId: 'red_stone_mines',
        success: true,
        linkedQuestId: FORGOTTEN_FORGE_QUEST_ID,
      })
    ).toBe(false)
  })

  it('returns false in post-dialogue phase', () => {
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: baseQuest,
        forgottenForgePhase: 'post_expedition_dialogue',
        locationId: 'oak_grove_outskirts',
        success: true,
        linkedQuestId: FORGOTTEN_FORGE_QUEST_ID,
      })
    ).toBe(false)
  })

  it('step 11 requires matching questTag on oak grove', () => {
    const q = { ...baseQuest, step: 11 }
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: q,
        forgottenForgePhase: 'awaiting_expedition',
        locationId: 'oak_grove_outskirts',
        success: true,
        linkedQuestId: FORGOTTEN_FORGE_QUEST_ID,
        linkedQuestTag: undefined,
      })
    ).toBe(false)
    expect(
      canAdvanceForgottenForgeAfterExpedition({
        forgottenForgeQuest: q,
        forgottenForgePhase: 'awaiting_expedition',
        locationId: 'oak_grove_outskirts',
        success: true,
        linkedQuestId: FORGOTTEN_FORGE_QUEST_ID,
        linkedQuestTag: FF_QUEST_EXPEDITION_TAGS.runes,
      })
    ).toBe(true)
  })
})
