import { describe, expect, it } from 'vitest'
import type { WeaponRepairPlan } from '@/types/weapon-repair'
import {
  getRepairStageProgressFromElapsed,
  getWeaponRepairPlanTotalDurationMs,
} from './repair-stage-timing'

const tinyPlan = (): WeaponRepairPlan => ({
  techniqueIds: ['a'],
  totalGold: 0,
  mergedMaterials: {},
  stages: [
    {
      order: 1,
      stageTemplateId: 's1',
      name: 'A',
      baseDurationSec: 1,
      category: 'preparation',
      sourceTechniqueId: 'a',
      sourceTechniqueName: 'A',
    },
    {
      order: 2,
      stageTemplateId: 's2',
      name: 'B',
      baseDurationSec: 1,
      category: 'work',
      sourceTechniqueId: 'a',
      sourceTechniqueName: 'A',
    },
  ],
})

describe('repair-stage-timing', () => {
  it('getRepairStageProgressFromElapsed starts at first stage', () => {
    const plan = tinyPlan()
    const v = getRepairStageProgressFromElapsed(plan, 0)
    expect(v.stageIndex).toBe(0)
    expect(v.allStagesComplete).toBe(false)
    expect(v.progressInStage).toBe(0)
  })

  it('advances to second stage after first duration', () => {
    const plan = tinyPlan()
    const d1 = 1000
    const v = getRepairStageProgressFromElapsed(plan, d1 + 100)
    expect(v.stageIndex).toBe(1)
    expect(v.allStagesComplete).toBe(false)
  })

  it('marks complete after total duration', () => {
    const plan = tinyPlan()
    const total = getWeaponRepairPlanTotalDurationMs(plan)
    const v = getRepairStageProgressFromElapsed(plan, total + 50)
    expect(v.allStagesComplete).toBe(true)
    expect(v.progressInStage).toBe(100)
  })
})
