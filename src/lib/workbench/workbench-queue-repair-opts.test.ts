import { describe, expect, it } from 'vitest'
import { DURABILITY_MAINTENANCE_TECHNIQUE_ID } from '@/data/weapon-damage/repair-techniques-registry'
import { mergeWorkbenchQueueRepairFinaleOpts } from '@/lib/workbench/workbench-queue-repair-opts'

describe('mergeWorkbenchQueueRepairFinaleOpts', () => {
  it('adds workbenchCompletedStages from plan stages', () => {
    const merged = mergeWorkbenchQueueRepairFinaleOpts([DURABILITY_MAINTENANCE_TECHNIQUE_ID], undefined)
    expect(merged?.workbenchCompletedStages).toBeGreaterThan(0)
  })

  it('preserves existing opts', () => {
    const merged = mergeWorkbenchQueueRepairFinaleOpts([DURABILITY_MAINTENANCE_TECHNIQUE_ID], {
      materialCostMultiplier: 1.2,
    })
    expect(merged?.materialCostMultiplier).toBe(1.2)
    expect(merged?.workbenchCompletedStages).toBeGreaterThan(0)
  })
})
