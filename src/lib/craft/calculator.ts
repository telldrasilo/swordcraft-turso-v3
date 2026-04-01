/**
 * Калькулятор характеристик оружия
 * Рассчитывает итоговые характеристики на основе материалов и техник
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 7 Характеристики оружия
 */

import type { 
  WeaponRecipe, 
  Material, 
  MaterialAssignment, 
  Technique, 
  WeaponStats,
  QualityGrade 
} from '@/types/craft-v2'
import { getMaterialAsLegacy } from '@/data/materials'
import { 
  getQualityGrade, 
  getQualityMultiplier, 
  getQualityColor,
  getQualityNameRu,
  QUALITY_GRADES_CONFIG 
} from '@/types/craft-v2'
import type {
  WeaponForecast,
  StatRange,
  QualityScore,
  QualityRank
} from '@/types/forecast'
import {
  BALANCE_MATERIAL_NEUTRAL,
  BALANCE_MATERIAL_WEIGHT,
  BALANCE_MAX,
  BALANCE_MIN,
  DEFAULT_ENCHANT_POWER,
  DEFAULT_REPAIR_POTENTIAL,
  DEFAULT_WEAPON_BALANCE,
  ENCHANT_POWER_ROUND_DECIMALS,
  MATERIAL_EFFECT_QUANTITY_DIVISOR,
  QUALITY_AVG_MATERIAL_FALLBACK,
  QUALITY_BASE,
  QUALITY_MATERIAL_TILT,
  QUALITY_PER_BLACKSMITH_LEVEL,
  QUALITY_TECHNIQUE_PER_POINT,
  SELL_GOLD_PER_ATTACK,
  SELL_GOLD_PER_DURABILITY,
  SELL_GOLD_PER_ENCHANT_SLOT,
  SELL_QUALITY_BASELINE,
  SOUL_CAPACITY_PER_QUANTITY,
  WEIGHT_PER_UNIT_DENSITY,
  WEIGHT_ROUND_DECIMALS,
} from './constants'
import { applyPercentMultiplier, contributionFromMaterialPercent } from './formulas'

/**
 * Полный результат расчёта оружия
 */
export interface WeaponCalculationResult {
  stats: WeaponStats
  quality: number
  qualityGrade: QualityGrade
  qualityMultiplier: number
  qualityColor: string
  qualityNameRu: string
  sellPrice: number
  materials: {
    partId: string
    materialId: string
    materialName: string
    quantity: number
  }[]
}

/**
 * Рассчитать характеристики оружия
 */
export function calculateWeapon(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[],
  blacksmithLevel: number
): WeaponCalculationResult {
  // 1. Базовые значения из рецепта
  const base = recipe.baseStats
  
  // 2. Собираем материалы
  const materialData: { partId: string; material: Material; quantity: number }[] = []
  
  for (const [partId, { materialId, quantity }] of Object.entries(materials)) {
    const material = getMaterialAsLegacy(materialId)
    if (material) {
      materialData.push({ partId, material, quantity })
    }
  }
  
  // 3. Рассчитываем характеристики
  let attack = base.attackBase
  let durability = base.durabilityBase
  let maxDurability = base.durabilityBase
  let weight = base.weightBase
  let soulCapacity = base.soulCapacityBase
  let balance = DEFAULT_WEAPON_BALANCE
  let repairPotential = DEFAULT_REPAIR_POTENTIAL
  let enchantSlots = 0
  let enchantPower = DEFAULT_ENCHANT_POWER
  
  // Применяем материалы
  for (const { material, quantity } of materialData) {
    const effects = material.weaponEffects
    const props = material.properties
    
    // Атака: база + бонус от материала * вклад части (упрощённо)
    attack += contributionFromMaterialPercent(
      attack,
      effects.attackBonus,
      quantity,
      MATERIAL_EFFECT_QUANTITY_DIVISOR
    )
    
    // Прочность
    durability += contributionFromMaterialPercent(
      durability,
      effects.durabilityBonus,
      quantity,
      MATERIAL_EFFECT_QUANTITY_DIVISOR
    )
    
    // Вместимость души
    soulCapacity += effects.soulCapacity * quantity * SOUL_CAPACITY_PER_QUANTITY
    
    // Вес
    weight += props.weight * quantity * WEIGHT_PER_UNIT_DENSITY
    
    // Ремонт
    repairPotential = Math.min(repairPotential, effects.repairPotential)
    
    // Зачарования
    enchantSlots += effects.enchantSlots
    enchantPower *= effects.enchantPower
    
    // Баланс (среднее по гибкости и твёрдости)
    balance +=
      ((props.flexibility + props.hardness) / 2 - BALANCE_MATERIAL_NEUTRAL) * BALANCE_MATERIAL_WEIGHT
  }
  
  // Применяем техники
  for (const technique of techniques) {
    const effects = technique.effects
    
    if (effects.qualityBonus) {
      attack = applyPercentMultiplier(attack, effects.qualityBonus)
      durability = applyPercentMultiplier(durability, effects.qualityBonus)
    }
    
    if (effects.durabilityBonus) {
      durability = applyPercentMultiplier(durability, effects.durabilityBonus)
    }
    
    if (effects.conductivityBonus) {
      enchantPower = applyPercentMultiplier(enchantPower, effects.conductivityBonus)
    }
  }
  
  // Округляем
  attack = Math.round(attack)
  durability = Math.round(durability)
  maxDurability = Math.round(durability)
  weight = Math.round(weight * WEIGHT_ROUND_DECIMALS) / WEIGHT_ROUND_DECIMALS
  soulCapacity = Math.round(soulCapacity)
  balance = Math.round(Math.max(BALANCE_MIN, Math.min(BALANCE_MAX, balance)))
  enchantPower = Math.round(enchantPower * ENCHANT_POWER_ROUND_DECIMALS) / ENCHANT_POWER_ROUND_DECIMALS
  
  // 4. Рассчитываем качество
  const quality = calculateQuality(blacksmithLevel, materialData, techniques)
  const qualityGrade = getQualityGrade(quality)
  const qualityMultiplier = getQualityMultiplier(quality)
  const qualityColor = getQualityColor(quality)
  const qualityNameRu = getQualityNameRu(quality)
  
  // 5. Применяем множитель качества к характеристикам
  attack = Math.round(attack * qualityMultiplier)
  durability = Math.round(durability * qualityMultiplier)
  maxDurability = durability
  soulCapacity = Math.round(soulCapacity * qualityMultiplier)
  
  // 6. Рассчитываем цену
  const sellPrice = calculateSellPrice(
    attack,
    durability,
    quality,
    materialData,
    enchantSlots
  )
  
  return {
    stats: {
      attack,
      durability,
      maxDurability,
      weight,
      balance,
      soulCapacity,
      repairPotential,
      enchantSlots,
      enchantPower,
    },
    quality,
    qualityGrade,
    qualityMultiplier,
    qualityColor,
    qualityNameRu,
    sellPrice,
    materials: materialData.map(({ partId, material, quantity }) => ({
      partId,
      materialId: material.id,
      materialName: material.name,
      quantity,
    })),
  }
}

/**
 * Рассчитать качество оружия
 */
function calculateQuality(
  blacksmithLevel: number,
  materialData: { material: Material; quantity: number }[],
  techniques: Technique[]
): number {
  // Базовое качество от уровня кузнеца
  let quality = QUALITY_BASE + blacksmithLevel * QUALITY_PER_BLACKSMITH_LEVEL
  
  // Бонус от качества материалов
  const avgMaterialQuality = materialData.reduce((sum, { material }) => {
    const matQuality = (material.properties.hardness + material.properties.flexibility) / 2
    return sum + matQuality
  }, 0) / materialData.length || QUALITY_AVG_MATERIAL_FALLBACK
  
  quality += (avgMaterialQuality - QUALITY_AVG_MATERIAL_FALLBACK) * QUALITY_MATERIAL_TILT
  
  // Бонус от техник
  for (const technique of techniques) {
    if (technique.effects.qualityBonus) {
      quality += technique.effects.qualityBonus * QUALITY_TECHNIQUE_PER_POINT
    }
  }
  
  // Ограничение
  return Math.min(100, Math.max(0, Math.round(quality)))
}

/**
 * Рассчитать цену продажи
 */
function calculateSellPrice(
  attack: number,
  durability: number,
  quality: number,
  materialData: { material: Material; quantity: number }[],
  enchantSlots: number
): number {
  // Базовая цена от характеристик
  let price = attack * SELL_GOLD_PER_ATTACK + durability * SELL_GOLD_PER_DURABILITY
  
  // Бонус от качества
  price *= quality / SELL_QUALITY_BASELINE
  
  // Бонус от редкости материалов
  const rarityMultiplier = materialData.reduce((mult, { material }) => {
    switch (material.source.rarity) {
      case 'common': return mult * 1.0
      case 'uncommon': return mult * 1.2
      case 'rare': return mult * 1.5
      case 'epic': return mult * 2.0
      case 'legendary': return mult * 3.0
      default: return mult
    }
  }, 1.0)
  
  price *= rarityMultiplier
  
  // Бонус от слотов зачарований
  price += enchantSlots * SELL_GOLD_PER_ENCHANT_SLOT
  
  return Math.round(price)
}

/**
 * Получить информацию о градации качества
 */
export function getQualityInfo(quality: number): {
  grade: QualityGrade
  multiplier: number
  color: string
  nameRu: string
  nextThreshold: number | null
  prevThreshold: number | null
} {
  const grade = getQualityGrade(quality)
  const config = QUALITY_GRADES_CONFIG.find(g => g.grade === grade)
  const nextConfig = QUALITY_GRADES_CONFIG.find(g => g.min > quality)

  return {
    grade,
    multiplier: config?.multiplier ?? 1.0,
    color: config?.color ?? 'text-gray-400',
    nameRu: config?.nameRu ?? 'Обычное',
    nextThreshold: nextConfig?.min ?? null,
    prevThreshold: config?.min ?? 0,
  }
}

// ================================
// ПРОГНОЗ РЕЗУЛЬТАТА
// ================================

/**
 * Рассчитать прогноз результата оружия
 * Использует те же формулы, что и calculateWeapon, но добавляет разброс на основе экспертизы
 */
export function calculateForecast(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[],
  blacksmithLevel: number,
  materialExpertise: Record<string, number>
): WeaponForecast {
  // Рассчитываем базовые характеристики используя те же формулы, что и при крафте
  const baseResult = calculateWeapon(recipe, materials, techniques, blacksmithLevel)

  // Рассчитываем среднюю экспертизу для определения разброса
  const avgExpertise = calculateAverageExpertise(materials, materialExpertise)
  const varianceMultiplier = (100 - avgExpertise) / 100 * 0.3

  // Рассчитываем диапазоны характеристик
  const attack: StatRange = {
    min: Math.max(0, Math.round(baseResult.stats.attack * (1 - varianceMultiplier))),
    max: Math.round(baseResult.stats.attack * (1 + varianceMultiplier * 0.5)),
    variance: varianceMultiplier
  }

  const durability: StatRange = {
    min: Math.max(0, Math.round(baseResult.stats.durability * (1 - varianceMultiplier))),
    max: Math.round(baseResult.stats.maxDurability * (1 + varianceMultiplier * 0.5)),
    variance: varianceMultiplier
  }

  const weight: StatRange = {
    min: Math.max(0, Math.round(baseResult.stats.weight * (1 - varianceMultiplier * 0.5))),
    max: Math.round(baseResult.stats.weight * (1 + varianceMultiplier * 0.3)),
    variance: varianceMultiplier
  }

  const soulCapacity: StatRange = {
    min: Math.max(0, Math.round(baseResult.stats.soulCapacity * (1 - varianceMultiplier))),
    max: Math.round(baseResult.stats.soulCapacity * (1 + varianceMultiplier * 0.5)),
    variance: varianceMultiplier
  }

  // Диапазон качества
  const quality: QualityScore = {
    value: baseResult.quality,
    min: Math.max(0, Math.round(baseResult.quality * (1 - varianceMultiplier))),
    max: Math.min(100, Math.round(baseResult.quality * (1 + varianceMultiplier * 0.5))),
    rank: getQualityRankFromQuality(baseResult.quality),
    progress: 0.5
  }

  const predictionAccuracy = 50 + avgExpertise * 0.5

  return {
    attack,
    durability,
    weight,
    soulCapacity,
    quality,
    predictionAccuracy
  }
}

/**
 * Рассчитать среднюю экспертизу по материалам
 */
function calculateAverageExpertise(
  materials: MaterialAssignment,
  materialExpertise: Record<string, number>
): number {
  const values = Object.values(materials).map(m => materialExpertise[m.materialId] || 0)
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
}

/**
 * Получить ранг качества по числовому значению
 */
function getQualityRankFromQuality(quality: number): QualityRank {
  if (quality >= 95) return 'S'
  if (quality >= 85) return 'A'
  if (quality >= 70) return 'B'
  if (quality >= 55) return 'C'
  if (quality >= 40) return 'D'
  return 'F'
}

export default {
  calculateWeapon,
  getQualityInfo,
  calculateForecast,
}
