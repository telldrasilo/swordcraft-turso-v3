import { describe, expect, it, vi } from 'vitest'
import type { MaterialStudyTechnique } from '@/types/material-study'
import { refundMaterialStudyTechniqueCosts } from '@/lib/materials/material-study-refund'

describe('refundMaterialStudyTechniqueCosts', () => {
  it('делит стоимость пополам между ResourceKey и stash по маппингу материала', () => {
    const addResource = vi.fn()
    const addMaterialToStash = vi.fn()
    const technique: MaterialStudyTechnique = {
      id: 't1',
      name: 'T',
      durationMs: 1000,
      materialCosts: [
        { materialId: 'coal', quantity: 3 },
        { materialId: 'birch', quantity: 2 },
      ],
    }
    refundMaterialStudyTechniqueCosts({ addResource, addMaterialToStash }, technique, 0.5)
    expect(addResource).toHaveBeenCalledWith('coal', 1)
    expect(addResource).toHaveBeenCalledWith('wood', 1)
    expect(addMaterialToStash).not.toHaveBeenCalled()
  })
})
