import { describe, expect, it } from 'vitest'
import { CRAFT_PERCENT_SCALE } from './constants'
import { applyPercentMultiplier, contributionFromMaterialPercent } from './formulas'

describe('applyPercentMultiplier', () => {
  it('applies percent bonus', () => {
    expect(applyPercentMultiplier(100, 10)).toBeCloseTo(110, 10)
    expect(applyPercentMultiplier(100, 0)).toBe(100)
  })
})

describe('contributionFromMaterialPercent', () => {
  it('matches explicit legacy formula', () => {
    const base = 40
    const effect = 20
    const qty = 3
    const div = 2
    const expected = base * (effect / CRAFT_PERCENT_SCALE) * (qty / div)
    expect(contributionFromMaterialPercent(base, effect, qty, div)).toBe(expected)
  })
})
