/**
 * Библиотека материалов для энциклопедии
 * Работает с новой системой MaterialNode
 */

import type { MaterialNode, MaterialDisplayCategory } from '@/types/materials'
import { getDisplayCategory } from '@/types/materials'

// Импорт всех материалов из library
import { allMaterials } from './library'

// Все материалы для энциклопедии в одном массиве
export const encyclopediaMaterials: MaterialNode[] = allMaterials

// Карта материалов по ID для быстрого доступа
export const encyclopediaMaterialById: Record<string, MaterialNode> = Object.fromEntries(
  encyclopediaMaterials.map(material => [material.identity.id, material])
)

// Группировка по категориям для отображения
export const encyclopediaByCategory: Record<MaterialDisplayCategory, MaterialNode[]> = {
  all: encyclopediaMaterials,
  ores: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'ores'),
  ingots: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'ingots'),
  stones: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'stones'),
  gems: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'gems'),
  wood: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'wood'),
  leather: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'leather'),
  herbs: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'herbs'),
  organics: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'organics'),
  fuels: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'fuels'),
  other: encyclopediaMaterials.filter(m => getDisplayCategory(m) === 'other'),
}

/**
 * Получить материал для энциклопедии по ID
 */
export function getEncyclopediaMaterialById(id: string): MaterialNode | undefined {
  return encyclopediaMaterialById[id]
}

/**
 * Получить материалы по категории отображения
 */
export function getEncyclopediaMaterialsByCategory(category: MaterialDisplayCategory): MaterialNode[] {
  return encyclopediaByCategory[category] || []
}

/**
 * Поиск материалов по названию
 */
export function searchEncyclopediaMaterials(query: string): MaterialNode[] {
  const normalizedQuery = query.toLowerCase().trim()

  if (!normalizedQuery) {
    return encyclopediaMaterials
  }

  return encyclopediaMaterials.filter(material => {
    const name = material.identity.name.toLowerCase()
    const tags = material.identity.tags.join(' ').toLowerCase()
    const basic = material.summary.basic.toLowerCase()

    return (
      name.includes(normalizedQuery) ||
      tags.includes(normalizedQuery) ||
      basic.includes(normalizedQuery)
    )
  })
}

/**
 * Получить отфильтрованные и отсортированные материалы
 * Сначала фильтрация по категории, потом поиск внутри
 */
export function getFilteredMaterials(
  category: MaterialDisplayCategory,
  searchQuery: string
): MaterialNode[] {
  // Сначала фильтруем по категории
  let materials = category === 'all'
    ? encyclopediaMaterials
    : encyclopediaByCategory[category] || []

  // Затем по поиску
  if (searchQuery.trim()) {
    const normalizedQuery = searchQuery.toLowerCase().trim()

    materials = materials.filter(material => {
      const name = material.identity.name.toLowerCase()
      const tags = material.identity.tags.join(' ').toLowerCase()
      const basic = material.summary.basic.toLowerCase()

      return (
        name.includes(normalizedQuery) ||
        tags.includes(normalizedQuery) ||
        basic.includes(normalizedQuery)
      )
    })
  }

  // Сортируем по редкости (обычные первыми) и имени
  return materials.sort((a, b) => {
    const rarityDiff = a.economy.rarity - b.economy.rarity
    if (rarityDiff !== 0) return rarityDiff
    return a.identity.name.localeCompare(b.identity.name, 'ru')
  })
}

/**
 * Алиас для обратной совместимости
 */
export const filterEncyclopediaMaterials = getFilteredMaterials
