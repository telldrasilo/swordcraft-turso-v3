/**
 * §6.13: агрегация ExpertiseImpact по плану крафта (взвешенные средние).
 */

import type { MaterialAssignment, WeaponRecipe } from '@/types/craft-v2'
import type { ExpertiseImpact } from '@/types/materials/knowledge'
import { calculateExpertiseImpact } from '@/types/materials/knowledge'
import type { MaterialNode } from '@/types/materials/material-core'
import { getMaterialById } from '@/data/materials'

/** Нейтральное влияние при отсутствии экспертизы (§7 п.6 роадмапа). */
export const NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION: ExpertiseImpact = {
  timeMultiplier: 1,
  defectRiskMultiplier: 1,
  materialWasteMultiplier: 1,
  qualityBonus: 0,
  varianceMultiplier: 1,
  predictionAccuracy: 50,
}

/** После агрегации: суммарное ускорение от экспертизы не глубже −25% к базе этапа. */
export const AGGREGATED_TIME_MULTIPLIER_SOFTCAP_MIN = 0.75

/** Верхний софткап эффективности мастерства (множитель к материальному вкладу). */
export const MATERIAL_MASTERY_EFFICIENCY_SOFTCAP_MAX = 1.4

export interface ExpertisePlanRow {
  materialId: string
  /** Доли суммируются в 1 по участвующим частям */
  partWeight: number
}

export interface AggregatedExpertiseImpact {
  timeMultiplier: number
  defectRiskMultiplier: number
  /** Геом. среднее мастерства: 1 / waste, с софткапом; для глобальных множителей. */
  materialMasteryEfficiency: number
  materialWasteMultiplier: number
  qualityBonus: number
  varianceMultiplier: number
  predictionAccuracy: number
}

function weightedGeometricMean(values: number[], weights: number[]): number {
  const sumW = weights.reduce((a, b) => a + b, 0)
  if (sumW <= 0) return 1
  let logSum = 0
  for (let i = 0; i < values.length; i++) {
    const wi = weights[i]
    const vi = values[i]
    if (wi === undefined || vi === undefined) continue
    const w = wi / sumW
    const v = Math.max(1e-9, vi)
    logSum += w * Math.log(v)
  }
  return Math.exp(logSum)
}

function weightedArithmeticMean(values: number[], weights: number[]): number {
  const sumW = weights.reduce((a, b) => a + b, 0)
  if (sumW <= 0) return 0
  let s = 0
  for (let i = 0; i < values.length; i++) {
    const vi = values[i]
    const wi = weights[i]
    if (vi === undefined || wi === undefined) continue
    s += vi * (wi / sumW)
  }
  return s
}

/**
 * Множитель мастерства по полю `materialWasteMultiplier` из impact (меньше отходы → выше мастерство).
 */
export function materialMasteryEfficiencyFromWasteMultiplier(wasteMultiplier: number): number {
  const w = Math.max(0.05, wasteMultiplier)
  return Math.min(MATERIAL_MASTERY_EFFICIENCY_SOFTCAP_MAX, 1 / w)
}

export function resolveExpertiseImpactForPlanRow(
  materialNode: MaterialNode | undefined,
  expertise: number
): ExpertiseImpact {
  if (!materialNode || expertise <= 0) {
    return { ...NEUTRAL_EXPERTISE_IMPACT_FOR_AGGREGATION }
  }
  return calculateExpertiseImpact(materialNode, expertise)
}

export function buildExpertisePlanRowsFromCraft(
  recipe: WeaponRecipe,
  materials: MaterialAssignment
): ExpertisePlanRow[] {
  let sum = 0
  const acc: { materialId: string; w: number }[] = []

  for (const p of recipe.parts) {
    const a = materials[p.id]
    if (!a?.materialId) continue
    const w = a.quantity > 0 ? a.quantity : p.minQuantity
    sum += w
    acc.push({ materialId: a.materialId, w })
  }

  if (sum <= 0 || acc.length === 0) return []

  return acc.map(({ materialId, w }) => ({
    materialId,
    partWeight: w / sum,
  }))
}

/**
 * Агрегирует per-material `ExpertiseImpact` по весам частей плана.
 */
export function aggregateExpertiseImpactsForPlan(
  rows: ExpertisePlanRow[],
  materialExpertise: Record<string, number>
): AggregatedExpertiseImpact {
  if (rows.length === 0) {
    return {
      timeMultiplier: 1,
      defectRiskMultiplier: 1,
      materialMasteryEfficiency: 1,
      materialWasteMultiplier: 1,
      qualityBonus: 0,
      varianceMultiplier: 1,
      predictionAccuracy: 50,
    }
  }

  const weights = rows.map((r) => r.partWeight)
  const impacts: ExpertiseImpact[] = rows.map((r) => {
    const exp = materialExpertise[r.materialId] ?? 0
    const node = getMaterialById(r.materialId)
    return resolveExpertiseImpactForPlanRow(node, exp)
  })

  const wasteMults = impacts.map((i) => i.materialWasteMultiplier)
  const masteryEffs = impacts.map((i) => materialMasteryEfficiencyFromWasteMultiplier(i.materialWasteMultiplier))

  const timeMultiplier = Math.max(
    AGGREGATED_TIME_MULTIPLIER_SOFTCAP_MIN,
    weightedGeometricMean(
      impacts.map((i) => i.timeMultiplier),
      weights
    )
  )

  const defectRiskMultiplier = weightedGeometricMean(
    impacts.map((i) => i.defectRiskMultiplier),
    weights
  )

  const materialWasteMultiplier = weightedGeometricMean(wasteMults, weights)
  const materialMasteryEfficiency = weightedGeometricMean(masteryEffs, weights)

  const qualityBonus = Math.min(
    100,
    weightedArithmeticMean(
      impacts.map((i) => i.qualityBonus),
      weights
    )
  )

  const varianceMultiplier = weightedGeometricMean(
    impacts.map((i) => i.varianceMultiplier),
    weights
  )

  const predictionAccuracy = Math.min(
    100,
    Math.max(
      50,
      weightedArithmeticMean(
        impacts.map((i) => i.predictionAccuracy),
        weights
      )
    )
  )

  return {
    timeMultiplier,
    defectRiskMultiplier,
    materialMasteryEfficiency,
    materialWasteMultiplier,
    qualityBonus,
    varianceMultiplier,
    predictionAccuracy,
  }
}

/**
 * Множитель времени этапа для материала и уровня экспертизы (до общих модификаторов уровня/workability).
 */
export function getExpertiseTimeMultiplierForMaterial(
  materialId: string,
  materialExpertOrMap: number | Record<string, number>
): number {
  const expertise =
    typeof materialExpertOrMap === 'number'
      ? materialExpertOrMap
      : (materialExpertOrMap[materialId] ?? 0)
  const node = getMaterialById(materialId)
  const impact = resolveExpertiseImpactForPlanRow(node, expertise)
  return Math.max(AGGREGATED_TIME_MULTIPLIER_SOFTCAP_MIN, impact.timeMultiplier)
}
