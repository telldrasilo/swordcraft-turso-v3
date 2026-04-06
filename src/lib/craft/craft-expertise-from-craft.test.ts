import { describe, expect, it, vi } from 'vitest'
import {
  applyCraftExpertiseFromCompletedPlan,
  computeCraftExpertiseGainDelta,
  computeCraftExpertiseGainsPreview,
} from './craft-expertise-from-craft'

describe('computeCraftExpertiseGainDelta', () => {
  it('returns 0 at or above 100%', () => {
    expect(computeCraftExpertiseGainDelta(100)).toBe(0)
    expect(computeCraftExpertiseGainDelta(105)).toBe(0)
  })

  it('is positive for mid-range expertise and decreases toward high %', () => {
    const low = computeCraftExpertiseGainDelta(15)
    const mid = computeCraftExpertiseGainDelta(50)
    const high = computeCraftExpertiseGainDelta(90)
    expect(low).toBeGreaterThan(0)
    expect(mid).toBeGreaterThan(0)
    expect(high).toBeGreaterThanOrEqual(0)
    if (high > 0) {
      expect(high).toBeLessThan(mid)
    }
    expect(low).toBeGreaterThanOrEqual(mid * 0.85)
  })
})

describe('applyCraftExpertiseFromCompletedPlan', () => {
  it('dedupes materials and applies addExpertise once per id', () => {
    const add = vi.fn()
    const rows = applyCraftExpertiseFromCompletedPlan(
      {
        a: { materialId: 'm1' },
        b: { materialId: 'm1' },
        c: { materialId: 'm2' },
      },
      {
        getExpertise: id => (id === 'm1' ? 20 : 30),
        addExpertise: (id, d) => add(id, d),
        getMaterialDisplayName: id => id.toUpperCase(),
      }
    )
    expect(add).toHaveBeenCalledTimes(2)
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.materialId).sort()).toEqual(['m1', 'm2'])
    expect(rows.every(r => r.delta > 0)).toBe(true)
  })
})

describe('computeCraftExpertiseGainsPreview', () => {
  it('matches apply deltas for the same knowledge snapshot (without applying)', () => {
    const knowledge = {
      iron: { expertise: 40 } as { expertise: number },
    }
    const preview = computeCraftExpertiseGainsPreview({ x: { materialId: 'iron' } }, knowledge as never)
    const delta = computeCraftExpertiseGainDelta(40)
    expect(preview).toHaveLength(1)
    expect(preview[0]?.delta).toBe(delta)
  })
})
