import { describe, expect, it } from 'vitest'
import {
  calculateAverageExpertise,
  craftVarianceDownFactor,
  craftVarianceUpFactor,
  statRangeFromBase,
} from '@/lib/craft/craft-variance'

describe('craftVarianceDownFactor / craftVarianceUpFactor', () => {
  it('at zero expertise has wider downside than at max expertise', () => {
    const d0 = craftVarianceDownFactor(0)
    const d100 = craftVarianceDownFactor(100)
    expect(d0).toBeGreaterThan(d100)
  })

  it('at max expertise has wider upside than at zero expertise', () => {
    const u0 = craftVarianceUpFactor(0)
    const u100 = craftVarianceUpFactor(100)
    expect(u100).toBeGreaterThan(u0)
  })
})

describe('statRangeFromBase', () => {
  it('keeps current as base and min <= max', () => {
    const r = statRangeFromBase(40, 50)
    expect(r.current).toBe(40)
    expect(r.min).toBeLessThanOrEqual(r.max)
    expect(r.min).toBeLessThanOrEqual(40)
    expect(r.max).toBeGreaterThanOrEqual(40)
  })

  it('high expertise narrows downside vs low expertise', () => {
    const lowE = statRangeFromBase(100, 0)
    const highE = statRangeFromBase(100, 100)
    expect(highE.min).toBeGreaterThanOrEqual(lowE.min)
    expect(highE.max).toBeGreaterThanOrEqual(lowE.max)
  })
})

describe('calculateAverageExpertise', () => {
  it('averages material expertise entries', () => {
    const m = {
      a: { materialId: 'iron', quantity: 1 },
      b: { materialId: 'oak', quantity: 1 },
    }
    expect(calculateAverageExpertise(m, { iron: 0, oak: 100 })).toBe(50)
  })
})
