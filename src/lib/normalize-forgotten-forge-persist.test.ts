import { describe, expect, it } from 'vitest'
import { normalizeForgottenForgePersistFromSave } from '@/lib/normalize-forgotten-forge-persist'
import { initialForgottenForgeQuestSlice } from '@/store/slices/forgotten-forge-quest-slice'
import { initialAltarConstructionState } from '@/types/altar-construction'

describe('normalizeForgottenForgePersistFromSave', () => {
  it('fills defaults when blob is empty', () => {
    const r = normalizeForgottenForgePersistFromSave(null)
    expect(r.forgottenForgeQuest).toEqual(initialForgottenForgeQuestSlice.forgottenForgeQuest)
    expect(r.archivistForgottenForgeTaskBannerAfterEntryId).toBeNull()
    expect(r.materialStashQuestItemIds).toEqual([])
    expect(r.altarConstruction).toMatchObject({
      ...initialAltarConstructionState,
      altarUnlocked: false,
      altarBuilt: false,
    })
  })

  it('preserves quest step up to v2 max (not clamped to 7)', () => {
    const r = normalizeForgottenForgePersistFromSave({
      forgottenForgeQuest: {
        status: 'active',
        step: 12,
        waitingForCraftAfterPhase2: false,
        lastStepChangeAt: null,
        flags: {},
      },
    })
    expect(r.forgottenForgeQuest.step).toBe(12)
  })

  it('reads materialStashQuestItemIds and altarConstruction', () => {
    const r = normalizeForgottenForgePersistFromSave({
      forgottenForgeQuest: {
        status: 'active',
        step: 8,
        waitingForCraftAfterPhase2: true,
        lastStepChangeAt: 100,
        flags: {},
      },
      altarUnlockedByForgottenForgeQuest: true,
      altarBuiltInForge: false,
      materialStashQuestItemIds: ['resonator_matrix', 'resonator_matrix', 'peat'],
      altarConstruction: {
        completedPhases: [1],
        activePhase: 2,
        activePhaseStageIndex: 1,
        activePhaseStartTime: 1,
        activePhaseStageStartTime: 2,
        activePhaseStages: [
          {
            id: 'a',
            name: 'A',
            durationSec: 10,
            description: 'd',
          },
        ],
      },
    })
    expect(r.materialStashQuestItemIds).toEqual(['resonator_matrix', 'peat'])
    expect(r.altarConstruction.completedPhases).toEqual([1])
    expect(r.altarConstruction.activePhase).toBe(2)
    expect(r.altarConstruction.altarUnlocked).toBe(true)
    expect(r.altarConstruction.altarBuilt).toBe(false)
    expect(r.forgottenForgeQuest.waitingForCraftAfterPhase2).toBe(true)
    expect(r.forgottenForgeQuest.lastStepChangeAt).toBe(100)
  })

  it('sets altarUnlocked when FF step >= 7 but legacy save missed the flag', () => {
    const r = normalizeForgottenForgePersistFromSave({
      forgottenForgeQuest: {
        status: 'active',
        step: 7,
        waitingForCraftAfterPhase2: false,
        lastStepChangeAt: null,
        flags: {},
      },
      altarUnlockedByForgottenForgeQuest: false,
      altarBuiltInForge: false,
    })
    expect(r.altarUnlockedByForgottenForgeQuest).toBe(true)
    expect(r.altarConstruction.altarUnlocked).toBe(true)
  })

  it('roundtrips cloud save–shaped forgottenForgePersist (use-cloud-save payload)', () => {
    const blob = {
      forgottenForgeQuest: {
        status: 'active' as const,
        step: 14,
        waitingForCraftAfterPhase2: false,
        lastStepChangeAt: 99,
        flags: { step6Anselm: 'deal' as const },
      },
      forgottenForgePhase: 'open',
      archivistDialogue: { thread: [] },
      archivistPendingChoices: null as null,
      archivistForgottenForgeTaskBannerAfterEntryId: 'entry-anchor-1',
      altarUnlockedByForgottenForgeQuest: true,
      altarBuiltInForge: false,
      materialStashQuestItemIds: ['resonator_matrix'],
      altarConstruction: {
        ...initialAltarConstructionState,
        altarUnlocked: true,
        completedPhases: [1, 2] as (1 | 2 | 3 | 4 | 5)[],
        activePhase: null,
      },
    }
    const r = normalizeForgottenForgePersistFromSave(blob)
    expect(r.forgottenForgeQuest.step).toBe(14)
    expect(r.archivistForgottenForgeTaskBannerAfterEntryId).toBe('entry-anchor-1')
    expect(r.altarUnlockedByForgottenForgeQuest).toBe(true)
    expect(r.altarBuiltInForge).toBe(false)
    expect(r.materialStashQuestItemIds).toContain('resonator_matrix')
    expect(r.altarConstruction.completedPhases).toEqual([1, 2])
  })
})
