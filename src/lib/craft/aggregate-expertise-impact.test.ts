import { describe, expect, it } from 'vitest'
import {
  aggregateExpertiseImpactsForPlan,
  buildExpertisePlanRowsFromCraft,
  materialMasteryEfficiencyFromWasteMultiplier,
  NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION,
  resolveExpertiseImpactForPlanRow,
} from './aggregate-expertise-impact'
import { getMaterialById } from '@/data/materials'
import { getRecipeById } from '@/data/recipes'

describe('aggregateExpertiseImpactsForPlan', () => {
  it('returns neutral unit impact for empty plan', () => {
    const agg = aggregateExpertiseImpactsForPlan([], {})
    expect(agg.timeMultiplier).toBe(1)
    expect(agg.defectRiskMultiplier).toBe(1)
    expect(agg.materialMasteryEfficiency).toBe(1)
    expect(agg.qualityBonus).toBe(0)
    expect(agg.varianceMultiplier).toBe(1)
    expect(agg.predictionAccuracy).toBe(50)
  })

  it('neutral per-row when expertise is 0% (§7 п.6)', () => {
    const iron = getMaterialById('iron_alloy')
    expect(iron).toBeDefined()
    if (!iron) return
    const agg = aggregateExpertiseImpactsForPlan(
      [{ materialId: iron.identity.id, partWeight: 1 }],
      { [iron.identity.id]: 0 }
    )
    expect(agg.timeMultiplier).toBe(1)
    expect(agg.defectRiskMultiplier).toBe(1)
    expect(agg.materialMasteryEfficiency).toBe(1)
    expect(agg.qualityBonus).toBe(0)
  })

  it('matches geometric mean illustration 0.88^0.6 * 0.95^0.4 for timeMultiplier', () => {
    const iron = getMaterialById('iron_alloy')
    const oak = getMaterialById('oak')
    expect(iron && oak).toBeDefined()
    if (!iron || !oak) return

    const i0 = resolveExpertiseImpactForPlanRow(iron, 100)
    const i1 = resolveExpertiseImpactForPlanRow(oak, 100)

    const agg = aggregateExpertiseImpactsForPlan(
      [
        { materialId: iron.identity.id, partWeight: 0.6 },
        { materialId: oak.identity.id, partWeight: 0.4 },
      ],
      { [iron.identity.id]: 100, [oak.identity.id]: 100 }
    )

    const expectedRaw =
      Math.pow(i0.timeMultiplier, 0.6) * Math.pow(i1.timeMultiplier, 0.4)
    const expected = Math.max(0.75, expectedRaw)
    expect(agg.timeMultiplier).toBeCloseTo(expected, 5)
  })

  it('buildExpertisePlanRowsFromCraft normalizes weights', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const bladeQ =
      recipe.parts.find((p) => p.id === 'blade')?.minQuantity ??
      recipe.parts[0]?.minQuantity ??
      1
    const gripQ = recipe.parts.find((p) => p.id === 'grip')?.minQuantity ?? 1
    const rows = buildExpertisePlanRowsFromCraft(recipe, {
      blade: { materialId: 'iron_alloy', quantity: bladeQ },
      grip: { materialId: 'oak', quantity: gripQ },
    })
    const s = rows.reduce((a, r) => a + r.partWeight, 0)
    expect(s).toBeCloseTo(1, 5)
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ materialId: 'iron_alloy' }),
        expect.objectContaining({ materialId: 'oak' }),
      ])
    )
  })
})

describe('materialMasteryEfficiencyFromWasteMultiplier', () => {
  it('is 1 for neutral waste', () => {
    expect(materialMasteryEfficiencyFromWasteMultiplier(1)).toBe(1)
  })

  it('increases when waste drops (softcapped)', () => {
    expect(materialMasteryEfficiencyFromWasteMultiplier(0.5)).toBe(1.4)
    expect(materialMasteryEfficiencyFromWasteMultiplier(0.8)).toBeCloseTo(1.25, 5)
  })
})

describe('NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION', () => {
  it('matches expected neutral baseline', () => {
    expect(NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION.timeMultiplier).toBe(1)
    expect(NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION.materialWasteMultiplier).toBe(1)
  })
})
