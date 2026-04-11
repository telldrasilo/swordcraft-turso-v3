import { describe, expect, it } from 'vitest'
import type { CraftTimelinePlanDraft } from '@/types/craft/timeline-plan-contract'

describe('CraftTimelinePlanDraft (phase 4.1)', () => {
  it('accepts empty ordered stage list', () => {
    const plan: CraftTimelinePlanDraft = { stageRefs: [] }
    expect(plan.stageRefs).toHaveLength(0)
  })
})
