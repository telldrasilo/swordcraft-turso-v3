import { describe, expect, it } from 'vitest'
import { getForgottenForgeQuestCardPrimaryCta } from '@/lib/quests/forgotten-forge-quest-card-cta'
import type { QuestPhase } from '@/store/slices/forgotten-forge-quest-slice'
import type { ForgottenForgeQuestState } from '@/types/forgotten-forge-quest'

const baseActive = (): ForgottenForgeQuestState => ({
  status: 'active',
  step: 0,
  waitingForCraftAfterPhase2: false,
  lastStepChangeAt: null,
  flags: {},
})

describe('getForgottenForgeQuestCardPrimaryCta', () => {
  it('locked → none', () => {
    expect(
      getForgottenForgeQuestCardPrimaryCta(
        { ...baseActive(), status: 'locked' },
        'locked'
      ).kind
    ).toBe('none')
  })

  it('available → archivist', () => {
    const r = getForgottenForgeQuestCardPrimaryCta(
      { ...baseActive(), status: 'available' },
      'intro'
    )
    expect(r).toEqual({ kind: 'archivist', label: 'К архивариусу' })
  })

  it('completed → none', () => {
    expect(
      getForgottenForgeQuestCardPrimaryCta(
        { ...baseActive(), status: 'completed', step: 18 },
        'completed'
      ).kind
    ).toBe('none')
  })

  it('intro + active → archivist', () => {
    const r = getForgottenForgeQuestCardPrimaryCta(baseActive(), 'intro')
    expect(r.kind).toBe('archivist')
  })

  it('post_expedition_dialogue → archivist', () => {
    const r = getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 4 }, 'post_expedition_dialogue')
    expect(r.kind).toBe('archivist')
  })

  it('awaiting_expedition with expectation → expedition', () => {
    const phases: QuestPhase[] = ['awaiting_expedition']
    for (const ph of phases) {
      expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 3 }, ph).kind).toBe(
        'expedition'
      )
      expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 11 }, ph).kind).toBe(
        'expedition'
      )
    }
  })

  it('awaiting_expedition без ожидания похода → archivist', () => {
    const r = getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 7 }, 'awaiting_expedition')
    expect(r.kind).toBe('archivist')
  })

  it('open step 8 → altar', () => {
    expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 8 }, 'open').kind).toBe('altar')
  })

  it('open step 9 + waiting craft → forge', () => {
    const r = getForgottenForgeQuestCardPrimaryCta(
      { ...baseActive(), step: 9, waitingForCraftAfterPhase2: true },
      'open'
    )
    expect(r).toEqual({ kind: 'forge', label: 'К крафту' })
  })

  it('open step 9 без ожидания крафта → altar', () => {
    const r = getForgottenForgeQuestCardPrimaryCta(
      { ...baseActive(), step: 9, waitingForCraftAfterPhase2: false },
      'open'
    )
    expect(r).toEqual({ kind: 'altar', label: 'К алтарю' })
  })

  it('open step 7 → archivist', () => {
    expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 7 }, 'open').kind).toBe(
      'archivist'
    )
  })

  it('open step 14 / 16 / 17 → altar', () => {
    expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 14 }, 'open').kind).toBe('altar')
    expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 16 }, 'open').kind).toBe('altar')
    expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 17 }, 'open').kind).toBe('altar')
  })

  it('open step 12 → expedition', () => {
    expect(getForgottenForgeQuestCardPrimaryCta({ ...baseActive(), step: 12 }, 'open').kind).toBe(
      'expedition'
    )
  })
})
