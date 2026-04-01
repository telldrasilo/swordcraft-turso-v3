import { describe, expect, it } from 'vitest'
import type { MaterialAssignment } from '@/types/craft-v2'
import { getRecipeById } from '@/data/recipes'
import { calculateWeapon, getQualityInfo } from '@/lib/craft/calculator'

describe('getQualityInfo', () => {
  it('returns stable grade for mid quality', () => {
    const q = getQualityInfo(50)
    expect(q.grade).toBeDefined()
    expect(q.multiplier).toBeGreaterThan(0)
    expect(q.nameRu.length).toBeGreaterThan(0)
  })

  it('maps low and legendary quality to expected grades', () => {
    expect(getQualityInfo(0).grade).toBe('poor')
    expect(getQualityInfo(100).grade).toBe('legendary')
    expect(getQualityInfo(100).nextThreshold).toBeNull()
  })

  it('exposes next threshold above current quality when not max', () => {
    const q = getQualityInfo(40)
    expect(q.nextThreshold).not.toBeNull()
    expect(q.nextThreshold!).toBeGreaterThan(40)
  })
})

describe('calculateWeapon', () => {
  it('computes stable stats for basic_sword + iron/oak (matches refactor baseline)', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const materials: MaterialAssignment = {
      blade: { materialId: 'iron', quantity: 3 },
      guard: { materialId: 'iron', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron', quantity: 1 },
    }
    const r = calculateWeapon(recipe!, materials, [], 10)
    expect(r.stats.attack).toBe(39)
    expect(r.stats.durability).toBe(58)
    expect(r.stats.balance).toBe(66)
    expect(r.quality).toBe(48)
    expect(r.sellPrice).toBe(123)
  })
})
