import { describe, expect, it } from 'vitest'
import {
  computeMaterialStudySlotCapacity,
  sumUnlockedBuildingLevels,
} from '@/lib/materials/material-study-slots'
import type { ProductionBuilding } from '@/store/slices/workers-slice'
import {
  MATERIAL_STUDY_BASE_SLOTS,
  MATERIAL_STUDY_BUILDING_LEVELS_PER_EXTRA_SLOT,
  MATERIAL_STUDY_MAX_CONCURRENT_SLOTS,
} from '@/lib/store-utils/constants'

function b(partial: Partial<ProductionBuilding> & Pick<ProductionBuilding, 'id'>): ProductionBuilding {
  return {
    name: partial.id,
    type: 'test',
    level: 1,
    produces: 'wood',
    baseProduction: 1,
    requiredWorkers: 1,
    staminaCost: 1,
    progress: 0,
    unlocked: true,
    ...partial,
  }
}

describe('material-study-slots', () => {
  it('base slot when no buildings', () => {
    expect(computeMaterialStudySlotCapacity([])).toBe(MATERIAL_STUDY_BASE_SLOTS)
  })

  it('extra slot from building level sum', () => {
    const buildings = [
      b({ id: 'a', level: 3, unlocked: true }),
      b({ id: 'b', level: 3, unlocked: true }),
    ]
    expect(sumUnlockedBuildingLevels(buildings)).toBe(6)
    expect(computeMaterialStudySlotCapacity(buildings)).toBe(MATERIAL_STUDY_BASE_SLOTS + 1)
  })

  it('ignores locked buildings', () => {
    const buildings = [b({ id: 'a', level: 10, unlocked: false })]
    expect(computeMaterialStudySlotCapacity(buildings)).toBe(MATERIAL_STUDY_BASE_SLOTS)
  })

  it('respects max cap', () => {
    const n = MATERIAL_STUDY_MAX_CONCURRENT_SLOTS * MATERIAL_STUDY_BUILDING_LEVELS_PER_EXTRA_SLOT
    const buildings = [b({ id: 'hq', level: n, unlocked: true })]
    expect(computeMaterialStudySlotCapacity(buildings)).toBe(MATERIAL_STUDY_MAX_CONCURRENT_SLOTS)
  })
})
