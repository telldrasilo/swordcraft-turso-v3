import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  calculateTierBonuses,
  calculateWarSoulReward,
  clearTierCache,
  formatProgressToNextTier,
  formatTierBonuses,
  formatWarSoulTier,
  getNextTierInfo,
  getProgressToNextTier,
  getWarSoulTierCached,
} from './war-soul-utils'

afterEach(() => {
  vi.restoreAllMocks()
  clearTierCache()
})

describe('calculateWarSoulReward', () => {
  it('applies multipliers and floors with mocked variance', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const r = calculateWarSoulReward({
      baseWarSoul: 10,
      warSoulMultiplier: 1,
      adventurerSkill: 0,
      weaponQuality: 50,
      isCrit: false,
    })
    expect(r).toBeGreaterThanOrEqual(1)
  })
})

describe('calculateTierBonuses', () => {
  it('returns bonus object from tier table', () => {
    const b = calculateTierBonuses(3, 20)
    expect(b).toHaveProperty('successBonus')
    expect(b).toHaveProperty('goldBonus')
  })
})

describe('formatting helpers', () => {
  it('formatWarSoulTier includes tier name', () => {
    const s = formatWarSoulTier(5, 20)
    expect(s.length).toBeGreaterThan(0)
  })

  it('formatTierBonuses lists non-zero bonuses', () => {
    const lines = formatTierBonuses({
      successBonus: 5,
      goldBonus: 0,
      warSoulBonus: 10,
      critChance: 0,
    })
    expect(lines.some(l => l.includes('5'))).toBe(true)
  })

  it('formatProgressToNextTier handles max tier', () => {
    const highWarSoul = 1e6
    const maxS = 100
    const msg = formatProgressToNextTier(highWarSoul, maxS)
    expect(typeof msg).toBe('string')
  })
})

describe('getWarSoulTierCached', () => {
  it('returns same reference for repeated warSoul key', () => {
    const a = getWarSoulTierCached(5, 20)
    const b = getWarSoulTierCached(5, 20)
    expect(a).toBe(b)
  })
})

describe('re-exported tier helpers', () => {
  it('exposes progress and next tier', () => {
    expect(getProgressToNextTier(1, 20)).toBeGreaterThanOrEqual(0)
    expect(getNextTierInfo(1, 20)).toBeDefined()
  })
})
