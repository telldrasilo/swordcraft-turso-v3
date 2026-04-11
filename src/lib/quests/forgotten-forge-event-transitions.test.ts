import { describe, expect, it } from 'vitest'
import {
  reduceForgottenForgeAfterAltarPhaseCompleted,
  reduceForgottenForgeAfterCraftCompleted,
  type ForgottenForgeEventContext,
} from '@/lib/quests/forgotten-forge-event-transitions'
import { taskBannerAnchorFromThread } from '@/store/slices/forgotten-forge-quest-slice'
import { initialAltarConstructionState } from '@/types/altar-construction'

const baseQuest = {
  status: 'active' as const,
  step: 8,
  waitingForCraftAfterPhase2: false,
  lastStepChangeAt: null as number | null,
  flags: {},
}

const ctx = (over: Partial<ForgottenForgeEventContext> = {}): ForgottenForgeEventContext => ({
  nowMs: 1_700_000_000_000,
  forgottenForgeQuest: baseQuest,
  forgottenForgePhase: 'open',
  archivistDialogue: { thread: [] },
  archivistPendingChoices: null,
  altarConstruction: { ...initialAltarConstructionState, altarUnlocked: true },
  altarBuiltInForge: false,
  altarUnlockedByForgottenForgeQuest: true,
  unlockedCraftTechniqueIds: [],
  ...over,
})

describe('reduceForgottenForgeAfterAltarPhaseCompleted', () => {
  it('phase 1 from step 8 advances to 9 and appends archivist line', () => {
    const r = reduceForgottenForgeAfterAltarPhaseCompleted(ctx(), 1)
    expect(r).not.toBeNull()
    if (!r) return
    expect(r.forgottenForgeQuest.step).toBe(9)
    expect(r.archivistDialogue.thread.length).toBeGreaterThan(0)
    expect(r.archivistDialogue.thread[r.archivistDialogue.thread.length - 1].text).toContain('Фундамент')
    expect(r.archivistForgottenForgeTaskBannerAfterEntryId).toBe(
      taskBannerAnchorFromThread(r.archivistDialogue.thread)
    )
  })

  it('phase 2 from step 9 sets waitingForCraft and craft choices', () => {
    const r = reduceForgottenForgeAfterAltarPhaseCompleted(
      ctx({ forgottenForgeQuest: { ...baseQuest, step: 9 } }),
      2
    )
    expect(r).not.toBeNull()
    if (!r) return
    expect(r.forgottenForgeQuest.waitingForCraftAfterPhase2).toBe(true)
    expect(r.forgottenForgeQuest.step).toBe(9)
    expect(r.archivistPendingChoices?.length).toBe(3)
    expect(r.archivistForgottenForgeTaskBannerAfterEntryId).toBe(
      taskBannerAnchorFromThread(r.archivistDialogue.thread)
    )
  })

  it('phase 3 from step 14 advances to 15 awaiting expedition', () => {
    const r = reduceForgottenForgeAfterAltarPhaseCompleted(
      ctx({
        forgottenForgeQuest: { ...baseQuest, step: 14 },
      }),
      3
    )
    expect(r?.forgottenForgeQuest.step).toBe(15)
    expect(r?.forgottenForgePhase).toBe('awaiting_expedition')
  })

  it('phase 5 from step 17 completes quest and builds altar', () => {
    const r = reduceForgottenForgeAfterAltarPhaseCompleted(
      ctx({
        forgottenForgeQuest: { ...baseQuest, step: 17 },
      }),
      5
    )
    expect(r?.forgottenForgeQuest.status).toBe('completed')
    expect(r?.forgottenForgeQuest.step).toBe(18)
    expect(r?.altarBuiltInForge).toBe(true)
    expect(r?.altarConstruction?.altarBuilt).toBe(true)
    expect(r?.altarConstruction?.completedPhases).toEqual([1, 2, 3, 4, 5])
  })

  it('returns null when quest not active', () => {
    expect(
      reduceForgottenForgeAfterAltarPhaseCompleted(
        ctx({
          forgottenForgeQuest: { ...baseQuest, status: 'locked' },
        }),
        1
      )
    ).toBeNull()
  })
})

describe('reduceForgottenForgeAfterCraftCompleted', () => {
  const noAltar = () => false

  it('advances step 9 waiting craft to 11', () => {
    const r = reduceForgottenForgeAfterCraftCompleted(
      ctx({
        forgottenForgeQuest: { ...baseQuest, step: 9, waitingForCraftAfterPhase2: true },
      }),
      'any_recipe',
      noAltar
    )
    expect(r).not.toBeNull()
    if (!r) return
    expect(r.forgottenForgeQuest.step).toBe(11)
    expect(r.forgottenForgeQuest.waitingForCraftAfterPhase2).toBe(false)
    expect(r.archivistForgottenForgeTaskBannerAfterEntryId).toBe(
      taskBannerAnchorFromThread(r.archivistDialogue.thread)
    )
  })

  it('ignores when not waiting craft', () => {
    expect(
      reduceForgottenForgeAfterCraftCompleted(
        ctx({
          forgottenForgeQuest: { ...baseQuest, step: 9, waitingForCraftAfterPhase2: false },
        }),
        'any_recipe',
        noAltar
      )
    ).toBeNull()
  })
})
