// ================================
// КАЛЬКУЛЯТОР ПРОГНОЗА РЕЗУЛЬТАТА ОРУЖИЯ
// ================================

import type {
  ForecastInput,
  WeaponForecast,
  QualityScore,
  QualityRank,
  StatRange,
  StatBreakdown,
  ContributionBreakdown,
  ContributionDetail,
} from '@/types/forecast'
import {
  CRAFT_PERCENT_SCALE,
  QUALITY_BASE,
  QUALITY_PER_BLACKSMITH_LEVEL,
  WEIGHT_PER_UNIT_DENSITY,
  WEIGHT_ROUND_DECIMALS,
  FORECAST_ATTACK_HARDNESS_WEIGHT,
  FORECAST_ATTACK_MAX_SPREAD_RATIO,
  FORECAST_ATTACK_TOUGHNESS_WEIGHT,
  FORECAST_ATTACK_VARIANCE_SPREAD,
  FORECAST_AVG_MATERIAL_QUALITY_FALLBACK,
  FORECAST_BREAKDOWN_EXPERTISE_PER_POINT,
  FORECAST_BREAKDOWN_MASTERY_PER_LEVEL,
  FORECAST_DUR_COMPRESSIVE_WEIGHT,
  FORECAST_DUR_MAX_SPREAD_RATIO,
  FORECAST_DUR_TOUGHNESS_WEIGHT,
  FORECAST_DUR_VARIANCE_SPREAD,
  FORECAST_EXPERTISE_FACTOR_BASE,
  FORECAST_EXPERTISE_FACTOR_SLOPE,
  FORECAST_MATERIAL_FACTOR_BASE,
  FORECAST_MATERIAL_QUALITY_DIVISOR,
  FORECAST_PREDICTION_ACCURACY_BASE,
  FORECAST_PREDICTION_ACCURACY_PER_EXPERTISE,
  FORECAST_QUALITY_MATERIAL_TERM_WEIGHT,
  FORECAST_QUALITY_MAX_SPREAD_RATIO,
  FORECAST_QUALITY_RANK_FALLBACK,
  FORECAST_QUALITY_RANK_THRESHOLDS,
  FORECAST_QUALITY_VARIANCE_SPREAD,
  FORECAST_RANK_PROGRESS_RANGES,
  FORECAST_RISK_AGGREGATE_DIVISOR,
  FORECAST_RISK_CURVE_WEIGHT,
  FORECAST_RISK_FACTOR_MAX_REDUCTION,
  FORECAST_SOUL_AFFINITY_WEIGHT,
  FORECAST_SOUL_CONDUCTIVITY_WEIGHT,
  FORECAST_SOUL_MAX_SPREAD_RATIO,
  FORECAST_SOUL_VARIANCE_SPREAD,
  FORECAST_TECHNIQUE_FACTOR_QUALITY_DIVISOR,
  FORECAST_TECHNIQUE_INCOMPATIBILITY_PENALTY,
  FORECAST_TECHNIQUE_MATERIAL_INCOMPATIBILITIES,
  FORECAST_WEIGHT_MAX_SPREAD_RATIO,
  FORECAST_WEIGHT_TECH_BALANCED_DESIGN_PERCENT,
  FORECAST_WEIGHT_TECH_MASTER_BALANCE_PERCENT,
  FORECAST_WEIGHT_VARIANCE_SPREAD,
} from './constants'
import { applyPercentMultiplier } from './formulas'

// ================================
// РАСЧЁТ ПРОГНОЗА
// ================================

export function calculateWeaponForecast(input: ForecastInput): WeaponForecast {
  const { recipe, materials, techniques, blacksmithLevel, materialExpertise } = input

  // 1. Расчёт средней экспертизы
  const avgExpertise = calculateAverageExpertise(materials, materialExpertise)
  const predictionAccuracy =
    FORECAST_PREDICTION_ACCURACY_BASE + avgExpertise * FORECAST_PREDICTION_ACCURACY_PER_EXPERTISE

  // 2. Расчёт качества
  const quality = calculateQuality(input, avgExpertise)

  // 3. Расчёт характеристик
  const attack = calculateAttack(input, avgExpertise, predictionAccuracy)
  const durability = calculateDurability(input, avgExpertise, predictionAccuracy)
  const weight = calculateWeight(input, avgExpertise, predictionAccuracy)
  const soulCapacity = calculateSoulCapacity(input, avgExpertise, predictionAccuracy)

  return {
    attack,
    durability,
    weight,
    soulCapacity,
    quality,
    predictionAccuracy
  }
}

// ================================
// РАСЧЁТ КАЧЕСТВА
// ================================

function calculateQuality(input: ForecastInput, avgExpertise: number): QualityScore {
  const { blacksmithLevel, materials, techniques } = input

  // A. BaseScore (30-130)
  const baseScore = QUALITY_BASE + blacksmithLevel * QUALITY_PER_BLACKSMITH_LEVEL

  // B. MaterialFactor (0.5-1.5)
  const avgMaterialQuality = calculateAverageMaterialQuality(materials)
  const materialFactor =
    FORECAST_MATERIAL_FACTOR_BASE + avgMaterialQuality / FORECAST_MATERIAL_QUALITY_DIVISOR

  // C. ExpertiseFactor (0.85-1.15)
  const expertiseFactor =
    FORECAST_EXPERTISE_FACTOR_BASE +
    (avgExpertise / CRAFT_PERCENT_SCALE) * FORECAST_EXPERTISE_FACTOR_SLOPE

  // D. TechniqueFactor (1.0-1.5)
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.qualityBonus || 0), 0)
  const incompatibilityPenalty = checkMaterialCompatibility(techniques, materials)
    ? 0
    : FORECAST_TECHNIQUE_INCOMPATIBILITY_PENALTY
  const techniqueFactor =
    1.0 +
    techniqueBonus / FORECAST_TECHNIQUE_FACTOR_QUALITY_DIVISOR -
    incompatibilityPenalty

  // E. RiskFactor (0.7-1.0)
  const totalRisk =
    techniques.reduce((sum, t) => sum + (t.penalties?.riskOfFailure || 0), 0) /
    FORECAST_RISK_AGGREGATE_DIVISOR
  const riskFactor =
    1.0 - Math.min(totalRisk * FORECAST_RISK_CURVE_WEIGHT, FORECAST_RISK_FACTOR_MAX_REDUCTION)

  // Итоговое качество
  let finalQuality =
    (baseScore + materialFactor * FORECAST_QUALITY_MATERIAL_TERM_WEIGHT) *
    expertiseFactor *
    techniqueFactor *
    riskFactor
  finalQuality = Math.max(0, Math.min(CRAFT_PERCENT_SCALE, finalQuality))

  // Диапазон
  const varianceMultiplier =
    ((CRAFT_PERCENT_SCALE - avgExpertise) / CRAFT_PERCENT_SCALE) * FORECAST_QUALITY_VARIANCE_SPREAD
  const min = finalQuality * (1 - varianceMultiplier)
  const max = finalQuality * (1 + varianceMultiplier * FORECAST_QUALITY_MAX_SPREAD_RATIO)

  // Ранг
  const rank = getQualityRank(finalQuality)
  const progress = calculateRankProgress(finalQuality, rank)

  return {
    value: Math.round(finalQuality),
    min: Math.round(min),
    max: Math.round(max),
    rank,
    progress
  }
}

// ================================
// РАСЧЁТ АТАКИ
// ================================

function calculateAttack(
  input: ForecastInput,
  avgExpertise: number,
  predictionAccuracy: number
): StatRange {
  const { recipe, materials, techniques } = input

  let attack = recipe.baseStats.attackBase
  const totalWeight = materials.reduce((sum, m) => sum + m.partWeight, 0)

  // Вклад материалов
  for (const part of materials) {
    const material = part.material
    const contribution =
      material.physical.hardness * FORECAST_ATTACK_HARDNESS_WEIGHT +
      material.physical.toughness * FORECAST_ATTACK_TOUGHNESS_WEIGHT
    attack += (contribution * part.partWeight) / totalWeight
  }

  // Вклад техник
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.qualityBonus || 0), 0)
  attack = applyPercentMultiplier(attack, techniqueBonus)

  // Диапазон
  const varianceMultiplier =
    ((CRAFT_PERCENT_SCALE - avgExpertise) / CRAFT_PERCENT_SCALE) * FORECAST_ATTACK_VARIANCE_SPREAD
  const min = Math.max(0, attack * (1 - varianceMultiplier))
  const max = attack * (1 + varianceMultiplier * FORECAST_ATTACK_MAX_SPREAD_RATIO)

  return {
    min: Math.round(min),
    max: Math.round(max),
    variance: varianceMultiplier
  }
}

// ================================
// РАСЧЁТ ПРОЧНОСТИ
// ================================

function calculateDurability(
  input: ForecastInput,
  avgExpertise: number,
  predictionAccuracy: number
): StatRange {
  const { recipe, materials, techniques } = input

  let durability = recipe.baseStats.durabilityBase

  // Вклад материалов
  for (const part of materials) {
    const material = part.material
    durability += material.physical.toughness * FORECAST_DUR_TOUGHNESS_WEIGHT * part.quantity
    durability +=
      material.physical.compressiveStrength * FORECAST_DUR_COMPRESSIVE_WEIGHT * part.quantity
  }

  // Вклад техник
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.durabilityBonus || 0), 0)
  durability = applyPercentMultiplier(durability, techniqueBonus)

  // Диапазон
  const varianceMultiplier =
    ((CRAFT_PERCENT_SCALE - avgExpertise) / CRAFT_PERCENT_SCALE) * FORECAST_DUR_VARIANCE_SPREAD
  const min = Math.max(0, durability * (1 - varianceMultiplier))
  const max = durability * (1 + varianceMultiplier * FORECAST_DUR_MAX_SPREAD_RATIO)

  return {
    min: Math.round(min),
    max: Math.round(max),
    variance: varianceMultiplier
  }
}

// ================================
// РАСЧЁТ ВЕСА
// ================================

function calculateWeight(
  input: ForecastInput,
  avgExpertise: number,
  predictionAccuracy: number
): StatRange {
  const { recipe, materials, techniques } = input

  let weight = recipe.baseStats.weightBase

  // Вклад материалов
  for (const part of materials) {
    const material = part.material
    weight += material.physical.density * part.quantity * WEIGHT_PER_UNIT_DENSITY
  }

  // Вклад техник (balanced_design может снижать вес)
  const weightReduction = techniques.reduce((sum, t) => {
    if (t.id === 'balanced_design') return sum + FORECAST_WEIGHT_TECH_BALANCED_DESIGN_PERCENT
    if (t.id === 'master_balance') return sum + FORECAST_WEIGHT_TECH_MASTER_BALANCE_PERCENT
    return sum
  }, 0)

  weight *= 1 - weightReduction / CRAFT_PERCENT_SCALE

  // Диапазон (меньшая неопределённость для веса)
  const varianceMultiplier =
    ((CRAFT_PERCENT_SCALE - avgExpertise) / CRAFT_PERCENT_SCALE) * FORECAST_WEIGHT_VARIANCE_SPREAD
  const min = Math.max(0, weight * (1 - varianceMultiplier))
  const max = weight * (1 + varianceMultiplier * FORECAST_WEIGHT_MAX_SPREAD_RATIO)

  return {
    min: Math.round(Math.min(min, max) * WEIGHT_ROUND_DECIMALS) / WEIGHT_ROUND_DECIMALS,
    max: Math.round(max * WEIGHT_ROUND_DECIMALS) / WEIGHT_ROUND_DECIMALS,
    variance: varianceMultiplier
  }
}

// ================================
// РАСЧЁТ ВМЕСТИМОСТИ ДУШИ
// ================================

function calculateSoulCapacity(
  input: ForecastInput,
  avgExpertise: number,
  predictionAccuracy: number
): StatRange {
  const { recipe, materials, techniques } = input

  let soulCapacity = recipe.baseStats.soulCapacityBase

  // Вклад материалов
  for (const part of materials) {
    const material = part.material
    soulCapacity +=
      material.arcane.conductivity * FORECAST_SOUL_CONDUCTIVITY_WEIGHT * part.quantity
    soulCapacity += material.arcane.affinity * FORECAST_SOUL_AFFINITY_WEIGHT * part.quantity
  }

  // Вклад техник
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.conductivityBonus || 0), 0)
  soulCapacity = applyPercentMultiplier(soulCapacity, techniqueBonus)

  // Диапазон
  const varianceMultiplier =
    ((CRAFT_PERCENT_SCALE - avgExpertise) / CRAFT_PERCENT_SCALE) * FORECAST_SOUL_VARIANCE_SPREAD
  const min = Math.max(0, soulCapacity * (1 - varianceMultiplier))
  const max = soulCapacity * (1 + varianceMultiplier * FORECAST_SOUL_MAX_SPREAD_RATIO)

  return {
    min: Math.round(min),
    max: Math.round(max),
    variance: varianceMultiplier
  }
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

function calculateAverageExpertise(
  materials: ForecastInput['materials'],
  materialExpertise: Record<string, number>
): number {
  if (materials.length === 0) return 0

  const total = materials.reduce((sum, m) => {
    const expertise = materialExpertise[m.material.identity.id] || 0
    return sum + expertise
  }, 0)

  return total / materials.length
}

function calculateAverageMaterialQuality(
  materials: ForecastInput['materials']
): number {
  if (materials.length === 0) return FORECAST_AVG_MATERIAL_QUALITY_FALLBACK

  const totalWeight = materials.reduce((sum, m) => sum + m.partWeight, 0)

  const weightedSum = materials.reduce((sum, m) => {
    const material = m.material
    const quality = (material.physical.hardness + material.physical.toughness) / 2
    return sum + quality * m.partWeight
  }, 0)

  return weightedSum / totalWeight
}

function checkMaterialCompatibility(
  techniques: ForecastInput['techniques'],
  materials: ForecastInput['materials']
): boolean {
  // Проверяем совместимость техник с материалами
  // Например: dragon_hardening требует мифрил
  const materialIds = materials.map(m => m.material.identity.id)

  for (const technique of techniques) {
    const requiredMaterials = FORECAST_TECHNIQUE_MATERIAL_INCOMPATIBILITIES[technique.id]
    if (!requiredMaterials) continue

    // Если техника требует определённый материал, а его нет - несовместимость
    const hasRequiredMaterial = requiredMaterials.some(id =>
      materialIds.some(mid => mid.includes(id))
    )

    if (hasRequiredMaterial) return false
  }

  return true
}

function getQualityRank(value: number): QualityRank {
  for (const { min, rank } of FORECAST_QUALITY_RANK_THRESHOLDS) {
    if (value >= min) return rank
  }
  return FORECAST_QUALITY_RANK_FALLBACK
}

function calculateRankProgress(value: number, rank: QualityRank): number {
  const [min, max] = FORECAST_RANK_PROGRESS_RANGES[rank]
  const range = max - min
  const progress = (value - min) / range

  return Math.max(0, Math.min(1, progress))
}

// ================================
// ДЕТАЛИЗАЦИЯ ВКЛАДОВ
// ================================

export function calculateStatBreakdown(
  input: ForecastInput,
  stat: 'attack' | 'durability' | 'weight' | 'soulCapacity'
): StatBreakdown {
  const { recipe, materials, techniques, blacksmithLevel, materialExpertise } = input

  const avgExpertise = calculateAverageExpertise(materials, materialExpertise)
  const predictionAccuracy =
    FORECAST_PREDICTION_ACCURACY_BASE + avgExpertise * FORECAST_PREDICTION_ACCURACY_PER_EXPERTISE

  const breakdown: ContributionBreakdown[] = []

  // Вклад материалов
  const materialContribution = calculateMaterialContribution(input, stat)
  if (materialContribution.value !== 0) {
    breakdown.push(materialContribution)
  }

  // Вклад техник
  const techniqueContribution = calculateTechniqueContribution(input, stat)
  if (techniqueContribution.value !== 0) {
    breakdown.push(techniqueContribution)
  }

  // Вклад мастерства
  const masteryContribution = calculateMasteryContribution(input, stat, blacksmithLevel)
  if (masteryContribution.value !== 0) {
    breakdown.push(masteryContribution)
  }

  // Вклад экспертизы
  const expertiseContribution = calculateExpertiseContribution(input, stat, avgExpertise)
  if (expertiseContribution.value !== 0) {
    breakdown.push(expertiseContribution)
  }

  const totalValue = breakdown.reduce((sum, b) => sum + b.value, 0)

  return {
    stat,
    breakdown: breakdown.map(b => ({
      ...b,
      percentage: totalValue > 0 ? (b.value / totalValue) * 100 : 0
    })),
    accuracy: Math.round(predictionAccuracy)
  }
}

function calculateMaterialContribution(
  input: ForecastInput,
  stat: 'attack' | 'durability' | 'weight' | 'soulCapacity'
): ContributionBreakdown {
  const { materials } = input
  const details: ContributionDetail[] = []

  for (const part of materials) {
    const material = part.material
    let value = 0

    switch (stat) {
      case 'attack':
        value =
          (material.physical.hardness * FORECAST_ATTACK_HARDNESS_WEIGHT +
            material.physical.toughness * FORECAST_ATTACK_TOUGHNESS_WEIGHT) *
          part.partWeight
        break
      case 'durability':
        value =
          (material.physical.toughness * FORECAST_DUR_TOUGHNESS_WEIGHT +
            material.physical.compressiveStrength * FORECAST_DUR_COMPRESSIVE_WEIGHT) *
          part.quantity
        break
      case 'weight':
        value = material.physical.density * part.quantity * WEIGHT_PER_UNIT_DENSITY
        break
      case 'soulCapacity':
        value =
          (material.arcane.conductivity * FORECAST_SOUL_CONDUCTIVITY_WEIGHT +
            material.arcane.affinity * FORECAST_SOUL_AFFINITY_WEIGHT) *
          part.quantity
        break
    }

    details.push({
      name: material.identity.name,
      value: Math.round(value)
    })
  }

  const totalValue = details.reduce((sum, d) => sum + d.value, 0)

  return {
    source: 'materials',
    value: totalValue,
    percentage: 0, // будет рассчитано позже
    details
  }
}

function calculateTechniqueContribution(
  input: ForecastInput,
  stat: 'attack' | 'durability' | 'weight' | 'soulCapacity'
): ContributionBreakdown {
  const { techniques } = input
  const details: ContributionDetail[] = []

  for (const technique of techniques) {
    let value = 0

    switch (stat) {
      case 'attack':
        value = technique.effects.qualityBonus || 0
        break
      case 'durability':
        value = technique.effects.durabilityBonus || 0
        break
      case 'weight':
        if (technique.id === 'balanced_design') value = -FORECAST_WEIGHT_TECH_BALANCED_DESIGN_PERCENT
        if (technique.id === 'master_balance') value = -FORECAST_WEIGHT_TECH_MASTER_BALANCE_PERCENT
        break
      case 'soulCapacity':
        value = technique.effects.conductivityBonus || 0
        break
    }

    if (value !== 0) {
      details.push({
        name: technique.name,
        value
      })
    }
  }

  const totalValue = details.reduce((sum, d) => sum + d.value, 0)

  return {
    source: 'techniques',
    value: totalValue,
    percentage: 0,
    details
  }
}

function calculateMasteryContribution(
  input: ForecastInput,
  stat: 'attack' | 'durability' | 'weight' | 'soulCapacity',
  blacksmithLevel: number
): ContributionBreakdown {
  const value = blacksmithLevel * FORECAST_BREAKDOWN_MASTERY_PER_LEVEL

  return {
    source: 'mastery',
    value: value > 0 ? value : 0,
    percentage: 0,
    details: [
      {
        name: 'Мастерство кузнеца',
        value: value > 0 ? value : 0
      }
    ]
  }
}

function calculateExpertiseContribution(
  input: ForecastInput,
  stat: 'attack' | 'durability' | 'weight' | 'soulCapacity',
  avgExpertise: number
): ContributionBreakdown {
  const value = avgExpertise * FORECAST_BREAKDOWN_EXPERTISE_PER_POINT

  return {
    source: 'expertise',
    value: value > 0 ? value : 0,
    percentage: 0,
    details: [
      {
        name: 'Экспертиза материалов',
        value: value > 0 ? Math.round(value) : 0
      }
    ]
  }
}
