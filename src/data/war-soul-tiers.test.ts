import { describe, expect, it } from 'vitest'
import {
  WAR_SOUL_WEAPON_POOL_MIN,
  WAR_SOUL_FORECAST_BAR_CAP,
  getWarSoulTier,
  getProgressToNextTier,
  resolveWarSoulProgressBarMax,
  scaleCraftSoulCapacityToWeaponPool,
} from './war-soul-tiers'

describe('scaleCraftSoulCapacityToWeaponPool', () => {
  it('rounds up to a multiple of 10_000 and respects minimum pool', () => {
    expect(scaleCraftSoulCapacityToWeaponPool(1)).toBe(WAR_SOUL_WEAPON_POOL_MIN)
    expect(scaleCraftSoulCapacityToWeaponPool(63)).toBe(260_000)
    expect(scaleCraftSoulCapacityToWeaponPool(100)).toBe(400_000)
  })
})

describe('WAR_SOUL_TIERS', () => {
  it('maps soul amounts to expected named tiers', () => {
    expect(getWarSoulTier(0).name).toBe('Искра')
    expect(getWarSoulTier(500).name).toBe('Тлеющая')
    expect(getWarSoulTier(29_000).name).toBe('Сильная')
    expect(getWarSoulTier(250_000).tier).toBe(10)
  })

  it('respects weapon pool cap (effective soul = min(current, cap))', () => {
    expect(getWarSoulTier(10_000, 5_000).name).toBe('Горящая')
    expect(getWarSoulTier(600, 100).name).toBe('Искра')
  })

  it('returns 100% progress at max tier', () => {
    expect(getProgressToNextTier(300_000)).toBe(100)
  })
})

describe('WAR_SOUL_FORECAST_BAR_CAP', () => {
  it('matches pool min × 5 for forecast bar normalization', () => {
    expect(WAR_SOUL_FORECAST_BAR_CAP).toBe(WAR_SOUL_WEAPON_POOL_MIN * 5)
  })
})

describe('resolveWarSoulProgressBarMax', () => {
  it('uses next tier entry threshold in UI, not weapon pool size', () => {
    const pool = 644_758
    expect(resolveWarSoulProgressBarMax(0, pool)).toBe(500)
    expect(resolveWarSoulProgressBarMax(100, pool)).toBe(500)
  })

  it('uses weapon pool on max tier', () => {
    const pool = 644_758
    expect(resolveWarSoulProgressBarMax(250_000, pool)).toBe(pool)
  })
})
