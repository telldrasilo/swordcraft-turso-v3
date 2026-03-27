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
  ForecastStats
} from '@/types/forecast'

// ================================
// РАСЧЁТ ПРОГНОЗА
// ================================

export function calculateWeaponForecast(input: ForecastInput): WeaponForecast {
  const { recipe, materials, techniques, blacksmithLevel, materialExpertise } = input

  // 1. Расчёт средней экспертизы
  const avgExpertise = calculateAverageExpertise(materials, materialExpertise)
  const predictionAccuracy = 50 + (avgExpertise * 0.5) // 50-100%

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
  const baseScore = 30 + blacksmithLevel * 2

  // B. MaterialFactor (0.5-1.5)
  const avgMaterialQuality = calculateAverageMaterialQuality(materials)
  const materialFactor = 0.5 + (avgMaterialQuality / 200)

  // C. ExpertiseFactor (0.85-1.15)
  const expertiseFactor = 0.85 + (avgExpertise / 100) * 0.3

  // D. TechniqueFactor (1.0-1.5)
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.qualityBonus || 0), 0)
  const incompatibilityPenalty = checkMaterialCompatibility(techniques, materials) ? 0 : 0.1
  const techniqueFactor = 1.0 + (techniqueBonus / 100) - incompatibilityPenalty

  // E. RiskFactor (0.7-1.0)
  const totalRisk = techniques.reduce((sum, t) => sum + (t.penalties?.riskOfFailure || 0), 0) / 100
  const riskFactor = 1.0 - Math.min(totalRisk * 0.3, 0.3)

  // Итоговое качество
  let finalQuality = (baseScore + materialFactor * 20) * expertiseFactor * techniqueFactor * riskFactor
  finalQuality = Math.max(0, Math.min(100, finalQuality))

  // Диапазон
  const varianceMultiplier = (100 - avgExpertise) / 100 * 0.4
  const min = finalQuality * (1 - varianceMultiplier)
  const max = finalQuality * (1 + varianceMultiplier * 0.5)

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
    const contribution = material.physical.hardness * 0.5 + material.physical.toughness * 0.3
    attack += contribution * part.partWeight / totalWeight
  }

  // Вклад техник
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.qualityBonus || 0), 0)
  attack *= 1 + (techniqueBonus / 100)

  // Диапазон
  const varianceMultiplier = (100 - avgExpertise) / 100 * 0.3
  const min = Math.max(0, attack * (1 - varianceMultiplier))
  const max = attack * (1 + varianceMultiplier * 0.5)

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
    durability += material.physical.toughness * 0.6 * part.quantity
    durability += material.physical.compressiveStrength * 0.2 * part.quantity
  }

  // Вклад техник
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.durabilityBonus || 0), 0)
  durability *= 1 + (techniqueBonus / 100)

  // Диапазон
  const varianceMultiplier = (100 - avgExpertise) / 100 * 0.25
  const min = Math.max(0, durability * (1 - varianceMultiplier))
  const max = durability * (1 + varianceMultiplier * 0.5)

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
    weight += material.physical.density * part.quantity * 0.1
  }

  // Вклад техник (balanced_design может снижать вес)
  const weightReduction = techniques.reduce((sum, t) => {
    // Проверяем специальные техники по ID
    if (t.id === 'balanced_design') return sum + 10 // -10% веса
    if (t.id === 'master_balance') return sum + 5 // -5% веса
    return sum
  }, 0)

  weight *= 1 - (weightReduction / 100)

  // Диапазон (меньшая неопределённость для веса)
  const varianceMultiplier = (100 - avgExpertise) / 100 * 0.15
  const min = Math.max(0, weight * (1 - varianceMultiplier))
  const max = weight * (1 + varianceMultiplier * 0.3)

  return {
    min: Math.round(Math.min(min, max) * 10) / 10,
    max: Math.round(max * 10) / 10,
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
    soulCapacity += material.arcane.conductivity * 0.3 * part.quantity
    soulCapacity += material.arcane.affinity * 0.2 * part.quantity
  }

  // Вклад техник
  const techniqueBonus = techniques.reduce((sum, t) => sum + (t.effects.conductivityBonus || 0), 0)
  soulCapacity *= 1 + (techniqueBonus / 100)

  // Диапазон
  const varianceMultiplier = (100 - avgExpertise) / 100 * 0.35
  const min = Math.max(0, soulCapacity * (1 - varianceMultiplier))
  const max = soulCapacity * (1 + varianceMultiplier * 0.5)

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
  if (materials.length === 0) return 50

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
  const incompatibleCombinations: Record<string, string[]> = {
    'dragon_hardening': ['mythril', 'mithril'],
    'elven_forging': ['iron', 'steel']
  }

  const materialIds = materials.map(m => m.material.identity.id)

  for (const technique of techniques) {
    const requiredMaterials = incompatibleCombinations[technique.id]
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
  if (value >= 95) return 'S'
  if (value >= 85) return 'A'
  if (value >= 70) return 'B'
  if (value >= 55) return 'C'
  if (value >= 40) return 'D'
  return 'F'
}

function calculateRankProgress(value: number, rank: QualityRank): number {
  const ranges: Record<QualityRank, [number, number]> = {
    S: [95, 100],
    A: [85, 94],
    B: [70, 84],
    C: [55, 69],
    D: [40, 54],
    F: [0, 39]
  }

  const [min, max] = ranges[rank]
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
  const predictionAccuracy = 50 + (avgExpertise * 0.5)

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
        value = (material.physical.hardness * 0.5 + material.physical.toughness * 0.3) * part.partWeight
        break
      case 'durability':
        value = (material.physical.toughness * 0.6 + material.physical.compressiveStrength * 0.2) * part.quantity
        break
      case 'weight':
        value = material.physical.density * part.quantity * 0.1
        break
      case 'soulCapacity':
        value = (material.arcane.conductivity * 0.3 + material.arcane.affinity * 0.2) * part.quantity
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
        if (technique.id === 'balanced_design') value = -10
        if (technique.id === 'master_balance') value = -5
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
  // Бонус мастерства кузнеца (2% за уровень)
  const value = blacksmithLevel * 2

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
  // Бонус экспертизы (0.5% за единицу экспертизы)
  const value = avgExpertise * 0.5

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
