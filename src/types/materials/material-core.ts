// ================================
// МАППИНГ КЛАССОВ В КАТЕГОРИИ
// ================================

export function getDisplayCategory(material: MaterialNode): MaterialDisplayCategory {
  const { class: matClass, origin, tags, id } = material.identity

  // Руды: минералы с тегом 'ore' или уголь
  if (matClass === 'mineral' && (tags.includes('ore') || id === 'coal')) {
    return 'ores'
  }

  // Слитки: все металлы (natural, refined, alloy)
  if (matClass === 'metal') {
    return 'ingots'
  }

  // Камни: минералы без тега 'ore' и не уголь
  if (matClass === 'mineral') {
    return 'stones'
  }

  // Дерево
  if (matClass === 'wood') {
    return 'wood'
  }

  // Кожа
  if (matClass === 'leather') {
    return 'leather'
  }

  // Другое
  return 'other'
}

// ================================
// РЕДКОСТЬ
// ================================

export type MaterialRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export function getMaterialRarity(economy: MaterialEconomy): MaterialRarity {
  const { rarity } = economy

  if (rarity >= 150) return 'legendary'
  if (rarity >= 100) return 'epic'
  if (rarity >= 60) return 'rare'
  if (rarity >= 30) return 'uncommon'
  return 'common'
}

export const RARITY_COLORS: Record<MaterialRarity, string> = {
  common: 'text-stone-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400',
}

export const RARITY_BG_COLORS: Record<MaterialRarity, string> = {
  common: 'bg-stone-900/30',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30',
  legendary: 'bg-amber-900/30',
}

export const RARITY_LABELS: Record<MaterialRarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
}

// ================================
// КАТЕГОРИИ ДЛЯ ОТОБРАЖЕНИЯ
// ================================

export type MaterialDisplayCategory = 'all' | 'ores' | 'ingots' | 'stones' | 'wood' | 'leather' | 'other'

export const MATERIAL_CATEGORIES: { id: MaterialDisplayCategory; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'ores', label: 'Руды' },
  { id: 'ingots', label: 'Слитки' },
  { id: 'stones', label: 'Камни' },
  { id: 'wood', label: 'Дерево' },
  { id: 'leather', label: 'Кожа' },
  { id: 'other', label: 'Другое' },
]

// Алиас для совместимости со старыми импортами
export { getDisplayCategory as getMaterialDisplayCategory } from './material-core'
