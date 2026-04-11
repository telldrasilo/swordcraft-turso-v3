/**
 * Адаптер для обратной совместимости
 * Преобразует MaterialNode в Material для существующего кода крафта.
 *
 * Прилагательные — [`legacy-material-adjectives.ts`](./legacy-material-adjectives.ts).
 * Полный список металлов с числами каталога — [`getMetalMaterialsRuntimeMerged`](./metals-runtime-merge.ts).
 */

import type { MaterialNode } from '@/types/materials/material-core'
import type { Material } from '@/types/craft-v2'
import { materialById, allMaterials } from './library'
import { LEGACY_MATERIAL_ADJECTIVES } from './legacy-material-adjectives'
import { metalMaterials } from './metals'

/**
 * Преобразует MaterialNode в Material для обратной совместимости
 */
export function adaptMaterialNodeToMaterial(node: MaterialNode): Material {
  // Маппинг MaterialClass в старые категории
  const classToCategory: Record<string, string> = {
    metal: 'metal',
    mineral: 'stone',
    wood: 'wood',
    leather: 'leather',
    other: 'other',
  }

  // Определяем rarity
  let rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' = 'common'
  if (node.economy.rarity >= 150) rarity = 'legendary'
  else if (node.economy.rarity >= 100) rarity = 'epic'
  else if (node.economy.rarity >= 60) rarity = 'rare'
  else if (node.economy.rarity >= 30) rarity = 'uncommon'

  // Определяем доминантное свойство
  let dominantPropertyType: 'durability' | 'sharpness' | 'balance' | 'conductivity' = 'durability'
  if (node.physical.hardness >= 70) dominantPropertyType = 'sharpness'
  else if (node.physical.elasticity >= 60) dominantPropertyType = 'balance'
  else if (node.arcane.conductivity >= 40) dominantPropertyType = 'conductivity'

  // Определяем dominantPropertyValue
  let dominantPropertyValue = 50
  switch (dominantPropertyType) {
    case 'sharpness':
      dominantPropertyValue = node.physical.hardness
      break
    case 'balance':
      dominantPropertyValue = Math.round((node.physical.elasticity + node.physical.toughness) / 2)
      break
    case 'conductivity':
      dominantPropertyValue = node.arcane.conductivity
      break
    case 'durability':
    default:
      dominantPropertyValue = Math.round((node.physical.toughness + node.physical.hardness) / 2)
  }

  // Адаптируем MaterialNode к Material
  const material: Material = {
    id: node.identity.id,
    name: node.identity.name,
    adjective: LEGACY_MATERIAL_ADJECTIVES[node.identity.id] ?? '',
    category: classToCategory[node.identity.class] || 'other',
    description: node.summary.basic,
    
    properties: {
      hardness: node.physical.hardness,
      flexibility: node.physical.elasticity,
      weight: node.physical.density,
      conductivity: node.arcane.conductivity,
    },
    
    crafting: {
      workability: node.processing.workability,
      meltingPoint: node.physical.meltingPoint || 0,
      requiredHeat: Math.ceil(node.economy.tier / 2),
    },
    
    weaponEffects: {
      attackBonus: Math.round((node.physical.hardness - 50) / 3),
      durabilityBonus: Math.round((node.physical.toughness - 50) / 5),
      soulCapacity: Math.round(node.arcane.affinity * 2),
      repairPotential: node.processing.repairability / 100,
      enchantPower: node.arcane.conductivity / 100,
      enchantSlots: Math.floor(node.arcane.resonance / 30),
    },
    
    craftTimeModifier: 1 + (100 - node.processing.workability) / 200,
    craftRisk: node.processing.defectRisk,
    
    dominantProperty: {
      type: dominantPropertyType,
      value: dominantPropertyValue,
    },
    
    source: {
      rarity,
      unlockCondition: node.discovery.unlockedBy?.[0]?.requiredExpertise 
        ? `Уровень кузнеца ${Math.ceil(node.discovery.unlockedBy[0].requiredExpertise / 10)}`
        : undefined,
    },
    
    icon: node.icon,
  }

  // Добавляем рецепт если есть
  if (node.recipe) {
    material.recipe = {
      inputs: node.recipe.inputs.map(input => ({
        resourceId: input.materialId,
        quantity: input.quantity,
        name: input.materialId, // Имя не хранится в MaterialRecipeInput
      })),
      requiredLevel: Math.ceil(node.economy.tier * 2),
    }
    
    if (node.recipe.processModifiers) {
      material.recipe.fuel = {
        resourceId: 'coal',
        quantity: Math.ceil(node.recipe.inputs.length * 1.5),
      }
    }
  }

  return material
}

/**
 * Получает Material из MaterialNode по ID
 */
/** Как [`getMetalMaterialRuntimeMerged`](./metals-runtime-merge.ts): каталог, иначе строка из `metalMaterials`. */
export function getMaterialAsLegacy(id: string): Material | undefined {
  const node = materialById[id]
  if (node) return adaptMaterialNodeToMaterial(node)
  return metalMaterials.find((m) => m.id === id)
}

/**
 * Получает все материалы в формате Material[]
 */
export function getAllMaterialsAsLegacy(): Material[] {
  return allMaterials.map(adaptMaterialNodeToMaterial)
}
