/**
 * Библиотека материалов
 * Центральный экспорт всех материалов
 */

// Экспорт из новой структуры library
export * from './library'

// Экспорт коллекций
export * from './collections'

// Импорт типов
import type { MaterialNode } from '@/types/materials/material-core'

// Импорт всех материалов из library
import {
  allMaterials,
  materialById,
  allMetals,
  allWoods,
  allLeathers,
} from './library'

// Реэкспорт для обратной совместимости
export { allMaterials }
export { materialById }

// Группировка по классам (для энциклопедии и крафта; в т.ч. world-resources)
export const materialsByClass = {
  metal: allMetals,
  mineral: allMaterials.filter(m => m.identity.class === 'mineral'),
  wood: allWoods,
  leather: allLeathers,
  organic: allMaterials.filter(m => m.identity.class === 'organic'),
  other: allMaterials.filter(m => m.identity.class === 'other'),
}

/**
 * Получить материал по ID
 */
export function getMaterialById(id: string): MaterialNode | undefined {
  return materialById[id]
}

/**
 * Получить материалы по классу
 */
export function getMaterialsByClass(className: string): MaterialNode[] {
  return materialsByClass[className as keyof typeof materialsByClass] || []
}

/**
 * Получить материалы по тегу
 */
export function getMaterialsByTag(tag: string): MaterialNode[] {
  return allMaterials.filter(m => m.identity.tags.includes(tag))
}

/**
 * Получить материалы по тиру
 */
export function getMaterialsByTier(tier: number): MaterialNode[] {
  return allMaterials.filter(m => m.economy.tier === tier)
}

/**
 * Получить материалы, доступные игроку
 * @param playerLevel Уровень кузнеца
 * @param unlockedMaterials Список разблокированных ID
 */
export function getAvailableMaterials(
  playerLevel: number,
  unlockedMaterials: string[] = []
): MaterialNode[] {
  return allMaterials.filter(material => {
    // Если материал в списке разблокированных
    if (unlockedMaterials.includes(material.identity.id)) return true
    
    // Проверяем условия разблокировки
    if (material.discovery.unlockedBy) {
      return material.discovery.unlockedBy.some(unlock => {
        if (unlock.type === 'harvest') return true
        if (unlock.type === 'craft') return playerLevel >= Math.floor(unlock.requiredExpertise / 10)
        if (unlock.type === 'research') return playerLevel >= Math.floor(unlock.requiredExpertise / 10)
        return false
      })
    }
    
    // Материалы без условий доступны по редкости
    return material.economy.rarity <= 30
  })
}

/**
 * Поиск материалов по названию
 */
export function searchMaterials(query: string): MaterialNode[] {
  const lowerQuery = query.toLowerCase()
  return allMaterials.filter(m => 
    m.identity.name.toLowerCase().includes(lowerQuery) ||
    m.identity.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Поиск материалов по категории и названию
 * Сначала фильтрация по категории, потом поиск внутри
 */
export function searchMaterialsByCategory(
  category: string,
  query: string
): MaterialNode[] {
  const categoryMaterials = category === 'all' 
    ? allMaterials 
    : getMaterialsByClass(category)
  
  if (!query.trim()) return categoryMaterials
  
  const lowerQuery = query.toLowerCase()
  return categoryMaterials.filter(m => 
    m.identity.name.toLowerCase().includes(lowerQuery) ||
    m.identity.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Получить материалы для части оружия
 * @param _partId ID части (blade, guard, grip, pommel) - не используется, для совместимости
 * @param allowedCategories Разрешённые классы материалов
 */
export function getMaterialsForPart(
  _partId: string,
  allowedCategories: string[]
): MaterialNode[] {
  // Маппинг старых категорий на новые классы
  const categoryToClass: Record<string, string[]> = {
    metal: ['metal'],
    alloy: ['metal'],  // сплавы - это тоже металлы
    wood: ['wood'],
    leather: ['leather'],
    stone: ['mineral'],
  }

  const allowedClasses = allowedCategories.flatMap(cat => 
    categoryToClass[cat] || [cat]
  )

  return allMaterials.filter(m => 
    allowedClasses.includes(m.identity.class)
  )
}

// Экспорт адаптера для обратной совместимости
export {
  adaptMaterialNodeToMaterial,
  getMaterialAsLegacy,
  getAllMaterialsAsLegacy,
} from './adapter'
