import { describe, expect, it } from 'vitest'
import { getRecipeById } from '@/data/recipes'
import { computeSoulPotential, computeSoulPotentialDetail } from '@/lib/war-soul-potential'

describe('computeSoulPotential', () => {
  it('returns value in configured range for basic iron + oak synergy', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const materials = {
      blade: { materialId: 'iron', quantity: 3 },
      guard: { materialId: 'iron', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron', quantity: 1 },
    }
    const v = computeSoulPotential(recipe, materials, [])
    expect(v).toBeGreaterThanOrEqual(0.85)
    expect(v).toBeLessThanOrEqual(3)
    const d = computeSoulPotentialDetail(recipe, materials, [])
    expect(d.synergyIds).toContain('soul_pair_iron_oak')
  })

  it('defaults to base range without synergies (tin + birch)', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const materials = {
      blade: { materialId: 'tin_alloy', quantity: 3 },
      guard: { materialId: 'tin_alloy', quantity: 1 },
      grip: { materialId: 'birch', quantity: 1 },
      pommel: { materialId: 'copper_alloy', quantity: 1 },
    }
    const v = computeSoulPotential(recipe, materials, [])
    expect(v).toBeGreaterThanOrEqual(0.85)
    expect(v).toBeLessThanOrEqual(3)
  })
})
