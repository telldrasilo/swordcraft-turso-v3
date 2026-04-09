import { describe, expect, it } from 'vitest'
import { getBuffReforgeCostMultiplier, resolveBuffReforgeWarSoulCost } from '@/lib/reforge/reforge-buff-cost'
import { REFORGE_BUFF_WAR_SOUL_COST_PER_TIER } from '@/lib/store-utils/constants'

describe('reforge buff war soul cost by tier', () => {
  it('tier 0 uses multiplier 1', () => {
    expect(getBuffReforgeCostMultiplier(100, 500_000)).toBe(1)
    expect(resolveBuffReforgeWarSoulCost({ warSoul: 100, maxWarSoul: 500_000 }, 280)).toBe(280)
  })

  it('higher tier increases cost', () => {
    const base = 280
    const t5 = resolveBuffReforgeWarSoulCost({ warSoul: 30_000, maxWarSoul: 500_000 }, base)
    const t0 = resolveBuffReforgeWarSoulCost({ warSoul: 100, maxWarSoul: 500_000 }, base)
    expect(t5).toBeGreaterThan(t0)
    expect(t5).toBe(Math.round(base * (1 + 5 * REFORGE_BUFF_WAR_SOUL_COST_PER_TIER)))
  })
})
