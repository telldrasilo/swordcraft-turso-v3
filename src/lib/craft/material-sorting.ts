/**
 * Умная сортировка и фильтрация материалов для селектора
 */

import type { MaterialNode } from '@/types/materials/material-core'
import type { WeaponRecipe } from '@/types/craft-v2'
import type { Resources, ResourceKey } from '@/store/slices/resources-slice'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import { getResourceKeyForMaterial } from './inventory-check'
import { getMaterialRarity, type MaterialRarity } from '@/types/materials/material-core'

// ================================
// ТИПЫ
// ================================

/** Контекст для сортировки */
export interface SortContext {
  inventory: Resources
  knowledge: Record<string, MaterialKnowledge>
  recipe: WeaponRecipe
  partId: string
  blacksmithLevel: number
  dominantProperty?: string  // Главное свойство из рецепта
}

// ================================
// КОНСТАНТЫ
// ================================

const RARITY_VALUES: Record<MaterialRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  epic: 4,
  legendary: 5,
}

// ================================
// ФУНКЦИИ ФИЛЬТРАЦИИ
// ================================

/**
 * Фильтровать материалы по открытым в энциклопедии
 */
export function filterDiscoveredMaterials(
  materials: MaterialNode[],
  knowledge: Record<string, MaterialKnowledge>
): MaterialNode[] {
  return materials.filter(material => {
    const matKnowledge = knowledge[material.identity.id]
    return matKnowledge && matKnowledge.expertise > 0
  })
}

// ================================
// ФУНКЦИИ СОРТИРОВКИ
// ================================

/**
 * Умная сортировка материалов
 * Приоритет: доступность × качество × экспертиза × редкость
 */
export function smartSortMaterials(
  materials: MaterialNode[],
  context: SortContext
): MaterialNode[] {
  // Копируем массив для неизменности
  return [...materials].sort((a, b) => {
    const scoreA = calculateMaterialScore(a, context)
    const scoreB = calculateMaterialScore(b, context)
    
    // Сортировка по убыванию оценки
    return scoreB - scoreA
  })
}

/**
 * Рассчитать оценку материала для сортировки
 * Чем выше оценка, тем выше материал в списке
 */
function calculateMaterialScore(material: MaterialNode, context: SortContext): number {
  const { inventory, knowledge, recipe, partId, blacksmithLevel, dominantProperty } = context
  
  // 1. Доступность (вес 40%) - 40 баллов максимум
  const availabilityScore = calculateAvailabilityScore(material, inventory)
  
  // 2. Качество для данной части (вес 30%) - 30 баллов максимум
  const qualityScore = calculateQualityScore(material, recipe, partId, dominantProperty)
  
  // 3. Экспертиза (вес 20%) - 20 баллов максимум
  const expertiseScore = calculateExpertiseScore(material, knowledge)
  
  // 4. Редкость (вес 10%) - 10 баллов максимум
  const rarityScore = calculateRarityScore(material)
  
  // Общая оценка
  return availabilityScore * 0.4 + 
         qualityScore * 0.3 + 
         expertiseScore * 0.2 + 
         rarityScore * 0.1
}

/**
 * Оценка доступности материала
 * Есть в инвентаре = 100, нет = 0
 */
function calculateAvailabilityScore(
  material: MaterialNode,
  inventory: Resources
): number {
  const resourceKey = getResourceKeyForMaterial(material.identity.id)
  if (!resourceKey) return 0
  
  const quantity = inventory[resourceKey] || 0
  // Нормализуем: 0 = 0, >=1 = 100
  return quantity > 0 ? 100 : 0
}

/**
 * Оценка качества материала для данной части
 */
function calculateQualityScore(
  material: MaterialNode,
  recipe: WeaponRecipe,
  partId: string,
  dominantProperty?: string
): number {
  const rarityValue = RARITY_VALUES[getMaterialRarity(material.economy)] // 1-5
  const normalizedRarity = ((rarityValue - 1) / 4) * 50 // 0-50
  
  // Свойства важные для разных частей
  const physical = material.physical
  const arcane = material.arcane
  const properties = material.properties
  
  let propertyScore = 0
  
  // Если в рецепте указано главное свойство, используем его
  if (dominantProperty) {
    const propValue = getDominantPropertyValue(material, dominantProperty)
    propertyScore = propValue / 100 * 50
  } else {
    // Иначе используем старую логику на основе части
    switch (partId) {
      case 'blade':
        // Для лезвия важны: твёрдость + проводимость
        propertyScore = (physical.hardness * 0.6 + arcane.conductivity * 0.4) / 100 * 50
        break
        
      case 'guard':
      case 'pommel':
        // Для гарды/навершия важны: твёрдость + прочность
        propertyScore = (physical.hardness * 0.7 + physical.toughness * 0.3) / 100 * 50
        break
        
      case 'grip':
        // Для рукояти важны: гибкость + меньше вес (используем density)
        propertyScore = (physical.elasticity * 0.8 + (100 - physical.density) * 0.2) / 100 * 50
        break
        
      default:
        // По умолчанию: среднее значение
        propertyScore = (physical.hardness + physical.toughness + physical.elasticity) / 3
        break
    }
  }
  
  return Math.min(50, normalizedRarity + propertyScore * 0.5)
}

/**
 * Получить значение главного свойства материала
 */
function getDominantPropertyValue(material: MaterialNode | undefined, prop: string | undefined): number {
  if (!material || !prop) return 50
  const physical = material.physical
  const arcane = material.arcane
  
  const propMap: Record<string, number> = {
    hardness: physical?.hardness ?? 50,
    elasticity: physical?.elasticity ?? 50,
    toughness: physical?.toughness ?? 50,
    weight: physical?.density ?? 50,  // Используем density вместо weight
    conductivity: arcane?.conductivity ?? 50
  }
  
  return propMap[prop] ?? 50
}

/**
 * Оценка экспертизы
 */
function calculateExpertiseScore(
  material: MaterialNode,
  knowledge: Record<string, MaterialKnowledge>
): number {
  const matKnowledge = knowledge[material.identity.id]
  if (!matKnowledge) return 0
  
  // Экспертиза 0-100 -> оценка 0-20
  return matKnowledge.expertise * 0.2
}

/**
 * Оценка редкости
 */
function calculateRarityScore(material: MaterialNode): number {
  const rarityValue = RARITY_VALUES[getMaterialRarity(material.economy)] // 1-5
  // Нормализуем в 0-10
  return ((rarityValue - 1) / 4) * 10
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Проверить, есть ли материал в инвентаре
 */
export function isMaterialAvailable(
  material: MaterialNode,
  inventory: Resources
): boolean {
  const resourceKey = getResourceKeyForMaterial(material.identity.id)
  if (!resourceKey) return false
  
  return (inventory[resourceKey] || 0) > 0
}

/**
 * Получить количество материала в инвентаре
 */
export function getMaterialQuantity(
  material: MaterialNode,
  inventory: Resources
): number {
  const resourceKey = getResourceKeyForMaterial(material.identity.id)
  if (!resourceKey) return 0
  
  return inventory[resourceKey] || 0
}

export default {
  filterDiscoveredMaterials,
  smartSortMaterials,
  isMaterialAvailable,
  getMaterialQuantity,
}
