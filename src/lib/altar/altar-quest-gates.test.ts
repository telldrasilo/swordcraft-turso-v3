import { describe, expect, it } from 'vitest'
import {
  forgottenForgeAllowsStartingAltarPhase,
  getForgottenForgeAltarPhaseBlockHint,
} from '@/lib/altar/altar-quest-gates'

const q = (partial: Record<string, unknown>) =>
  ({
    status: 'active',
    step: 8,
    waitingForCraftAfterPhase2: false,
    ...partial,
  }) as const

describe('forgottenForgeAllowsStartingAltarPhase', () => {
  it('follows DEVELOPMENT_HUB §3.5 matrix', () => {
    expect(forgottenForgeAllowsStartingAltarPhase(q({ step: 8 }), 1)).toBe(true)
    expect(forgottenForgeAllowsStartingAltarPhase(q({ step: 8 }), 2)).toBe(false)

    expect(
      forgottenForgeAllowsStartingAltarPhase(q({ step: 9, waitingForCraftAfterPhase2: false }), 2)
    ).toBe(true)
    expect(
      forgottenForgeAllowsStartingAltarPhase(q({ step: 9, waitingForCraftAfterPhase2: true }), 3)
    ).toBe(false)

    expect(forgottenForgeAllowsStartingAltarPhase(q({ step: 14 }), 3)).toBe(true)
    expect(forgottenForgeAllowsStartingAltarPhase(q({ step: 16 }), 4)).toBe(true)
    expect(forgottenForgeAllowsStartingAltarPhase(q({ step: 17 }), 5)).toBe(true)
  })

  it('rejects when quest not active', () => {
    expect(
      forgottenForgeAllowsStartingAltarPhase(
        { status: 'locked', step: 8, waitingForCraftAfterPhase2: false },
        1
      )
    ).toBe(false)
  })
})

describe('getForgottenForgeAltarPhaseBlockHint', () => {
  it('hints craft gate after phase II', () => {
    const h = getForgottenForgeAltarPhaseBlockHint(
      q({ step: 9, waitingForCraftAfterPhase2: true })
    )
    expect(h).toContain('кузниц')
  })
})
