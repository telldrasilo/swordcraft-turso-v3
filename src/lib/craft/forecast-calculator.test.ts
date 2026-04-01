import { describe, expect, it } from 'vitest'
import type { ForecastInput } from '@/types/forecast'
import type { MaterialNode } from '@/types/materials/material-core'
import { getRecipeById } from '@/data/recipes'
import { getMaterialById } from '@/data/materials'
import { calculateStatBreakdown, calculateWeaponForecast } from './forecast-calculator'

function partFromMaterial(node: MaterialNode, quantity: number, partWeight: number) {
  return {
    material: {
      identity: { id: node.identity.id, name: node.identity.name },
      physical: {
        hardness: node.physical.hardness,
        toughness: node.physical.toughness,
        density: node.physical.density,
        compressiveStrength: node.physical.compressiveStrength,
        elasticity: node.physical.elasticity,
      },
      arcane: {
        conductivity: node.arcane.conductivity,
        affinity: node.arcane.affinity,
      },
    },
    quantity,
    partWeight,
  }
}

function baseInput(): ForecastInput {
  const recipe = getRecipeById('basic_sword')
  const iron = getMaterialById('iron')
  expect(recipe && iron).toBeDefined()
  return {
    recipe: { baseStats: recipe!.baseStats },
    materials: [partFromMaterial(iron!, 3, 0.4)],
    techniques: [],
    blacksmithLevel: 5,
    materialExpertise: { iron: 50 },
  }
}

describe('calculateWeaponForecast', () => {
  it('returns bounded quality and stat ranges', () => {
    const fc = calculateWeaponForecast(baseInput())
    expect(fc.predictionAccuracy).toBeGreaterThanOrEqual(50)
    expect(fc.predictionAccuracy).toBeLessThanOrEqual(100)
    expect(fc.quality.value).toBeGreaterThanOrEqual(0)
    expect(fc.quality.value).toBeLessThanOrEqual(100)
    expect(fc.quality.min).toBeLessThanOrEqual(fc.quality.value)
    expect(fc.quality.max).toBeGreaterThanOrEqual(fc.quality.value)
    expect(fc.attack.min).toBeLessThanOrEqual(fc.attack.max)
    expect(fc.durability.min).toBeLessThanOrEqual(fc.durability.max)
  })
})

describe('calculateStatBreakdown', () => {
  it('returns stat id, accuracy and percentages summing to ~100 when contributions exist', () => {
    const input = baseInput()
    const bd = calculateStatBreakdown(input, 'attack')
    expect(bd.stat).toBe('attack')
    expect(bd.accuracy).toBeGreaterThanOrEqual(50)
    const pct = bd.breakdown.reduce((s, b) => s + b.percentage, 0)
    if (bd.breakdown.length > 0) {
      expect(pct).toBeCloseTo(100, 5)
    }
  })
})
