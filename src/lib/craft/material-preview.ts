/**
 * Расчёт превью характеристик материала для крафта
 * Рассчитывает диапазоны возможных значений с учётом экспертизы
 */

import type { MaterialNode } from '@/types/materials/material-core'
import type { WeaponRecipe } from '@/types/craft-v2'
import type { Material } from '@/types/craft-v2'
import { getMaterialAsLegacy } from '@/data/materials'
import { calculateExpertiseImpact } from '@/types/materials/knowledge'
import { getMaterialById } from '@/data/materials'

// ================================
// ТИПЫ
// ================================

/** Превью характеристик материала */
export interface MaterialPreview {
  attack: { min: number; max: number; base: number }
  durability: { min: number; max: number; base: number }
  weight: number
  soulCapacity: { min: number; max: number; base: number }
  quality: { min: number; max: number }
  predictionAccuracy: number // 50-100%
}

/** Сравнение с текущим выбранным материалом */
export interface MaterialComparison {
  preview: MaterialPreview
  delta: {
    attack: { min: number; max: number } | null
    durability: { min: number; max: number } | null
    quality: { min: number; max: number } | null
  }
}

// ================================
// ФУНКЦИИ РАСЧЁТА
// ================================

/**
 * Рассчитать превью характеристик материала
 */
export function calculateMaterialPreview(
  material: MaterialNode,
  recipe: WeaponRecipe,
  partId: string,
  blacksmithLevel: number,
  expertise: number
): MaterialPreview {
  const legacyMaterial = getMaterialAsLegacy(material?.identity?.id || '')
  if (!legacyMaterial) {
    throw new Error(`Material not found: ${material?.identity?.id}`)
  }

  const impact = calculateExpertiseImpact(material, expertise)
  
  // 1. Базовое качество от уровня кузнеца и экспертизы
  const baseQuality = 30 + blacksmithLevel * 2
  const qualityBonus = expertise * 0.15 // До +15
  const avgMaterialQuality = (material.physical.hardness + material.physical.elasticity) / 2
  const materialQualityBonus = (avgMaterialQuality - 50) * 0.2
  
  const baseQualityValue = Math.min(100, baseQuality + qualityBonus + materialQualityBonus)
  
  // 2. Разброс от экспертизы (varianceMultiplier)
  // Чем выше экспертиза, тем меньше разброс
  // varianceMultiplier: 1.0 при 0% экспертизы, 0.2 при 100% экспертизы
  const variance = impact.varianceMultiplier
  
  // 3. Базовые значения для части из рецепта
  const recipePart = recipe.parts.find(p => p.id === partId)
  const partQuantity = recipePart?.minQuantity || 1
  
  // 4. Рассчитываем базовые характеристики
  const baseAttack = recipe.baseStats.attackBase
  const baseDurability = recipe.baseStats.durabilityBase
  const baseSoul = recipe.baseStats.soulCapacityBase
  const baseWeight = recipe.baseStats.weightBase
  
  // Бонусы от материала
  const attackBonus = baseAttack * (legacyMaterial.weaponEffects.attackBonus / 100) * (partQuantity / 2)
  const durabilityBonus = baseDurability * (legacyMaterial.weaponEffects.durabilityBonus / 100) * (partQuantity / 2)
  const soulBonus = legacyMaterial.weaponEffects.soulCapacity * partQuantity * 0.5
  const weightBonus = legacyMaterial.properties.weight * partQuantity * 0.1
  
  // Базовые значения с бонусами
  const attackBase = Math.round(baseAttack + attackBonus)
  const durabilityBase = Math.round(baseDurability + durabilityBonus)
  const soulBase = Math.round(baseSoul + soulBonus)
  const weightValue = Math.round((baseWeight + weightBonus) * 10) / 10
  
  // 5. Асимметричный разброс от экспертизы
  // При 0% экспертизы: min = base - 75%, max = base + 15%
  // При 100% экспертизы: min = base - 0%, max = base + 0%
  const expertiseFactor = expertise / 100  // 0.0 - 1.0
  
  // Разброс вниз уменьшается с 75% до 0%
  const downVarianceFactor = 0.75 * (1 - expertiseFactor)
  
  // Разброс вверх уменьшается с 15% до 0%
  const upVarianceFactor = 0.15 * (1 - expertiseFactor)
  
  // Применяем к базовым значениям
  const attackDown = Math.round(attackBase * downVarianceFactor)
  const attackUp = Math.round(attackBase * upVarianceFactor)
  const durabilityDown = Math.round(durabilityBase * downVarianceFactor)
  const durabilityUp = Math.round(durabilityBase * upVarianceFactor)
  const soulDown = Math.round(soulBase * downVarianceFactor)
  const soulUp = Math.round(soulBase * upVarianceFactor)
  const qualityVariance = Math.round(10 * (1 - expertiseFactor))
  
  // 6. Точность прогноза - УСИЛЕНА зависимость от экспертизы
  // Базовая формула: 50% + (expertise * 0.5) = 50-100%
  // Это означает: 0% экспертизы = 50% точности, 100% экспертизы = 100% точности
  const baseAccuracy = 50 + (expertise * 0.5)
  
  // Модификаторы от материала
  const materialAccuracyFactor =
    (material.chemical.stability / 100) * 10 +       // Стабильность до +10%
    (material.arcane.stability / 100) * 10 +          // Магическая стабильность до +10%
    (material.economy.discoverability / 100) * 5      // Изученность до +5%
  
  const predictionAccuracy = Math.min(100, Math.max(50, baseAccuracy + materialAccuracyFactor))
  
  return {
    attack: {
      base: attackBase,
      min: Math.max(0, attackBase - attackDown),
      max: attackBase + attackUp,
    },
    durability: {
      base: durabilityBase,
      min: Math.max(0, durabilityBase - durabilityDown),
      max: durabilityBase + durabilityUp,
    },
    weight: weightValue,
    soulCapacity: {
      base: soulBase,
      min: Math.max(0, soulBase - soulDown),
      max: soulBase + soulUp,
    },
    quality: {
      min: Math.max(0, baseQualityValue - qualityVariance),
      max: Math.min(100, baseQualityValue + qualityVariance),
    },
    predictionAccuracy,
  }
}

/**
 * Рассчитать сравнение с текущим выбранным материалом
 */
export function calculateMaterialComparison(
  newMaterial: MaterialNode,
  currentMaterialId: string | null,
  recipe: WeaponRecipe,
  partId: string,
  blacksmithLevel: number,
  newMaterialExpertise: number,
  currentMaterialExpertise?: number
): MaterialComparison {
  const preview = calculateMaterialPreview(newMaterial, recipe, partId, blacksmithLevel, newMaterialExpertise)
  
  // Если нет текущего материала - дельта null
  if (!currentMaterialId) {
    return {
      preview,
      delta: {
        attack: null,
        durability: null,
        quality: null,
      },
    }
  }
  
  // Получаем текущий материал
  const currentMaterial = getMaterialById(currentMaterialId)
  if (!currentMaterial) {
    // Материал не найден - дельта null
    return {
      preview,
      delta: {
        attack: null,
        durability: null,
        quality: null,
      },
    }
  }
  
  // Рассчитываем превью для текущего материала с его экспертизой
  // Если экспертиза текущего материала не указана, используем экспертизу нового материала
  const expertiseForCurrent = currentMaterialExpertise ?? newMaterialExpertise
  const currentPreview = calculateMaterialPreview(
    currentMaterial,
    recipe,
    partId,
    blacksmithLevel,
    expertiseForCurrent
  )
  
  // Рассчитываем дельту
  return {
    preview,
    delta: {
      attack: {
        min: preview.attack.min - currentPreview.attack.min,
        max: preview.attack.max - currentPreview.attack.max,
      },
      durability: {
        min: preview.durability.min - currentPreview.durability.min,
        max: preview.durability.max - currentPreview.durability.max,
      },
      quality: {
        min: preview.quality.min - currentPreview.quality.min,
        max: preview.quality.max - currentPreview.quality.max,
      },
    },
  }
}

export default {
  calculateMaterialPreview,
  calculateMaterialComparison,
}
