/**
 * Ядро системы материалов
 * Независимая база данных материалов для использования в разных системах
 * (кузница, стройка, алхимия и т.д.)
 */

// ================================ КЛАССЫ И ПРОИСХОЖДЕНИЕ

export type MaterialClass = 'mineral' | 'metal' | 'wood' | 'leather' | 'other'
export type MaterialOrigin = 'natural' | 'refined' | 'alloy' | 'composite' | 'byproduct'

// ================================ ИДЕНТИФИКАЦИЯ

export interface MaterialIdentity {
  id: string
  name: string
  class: MaterialClass
  origin: MaterialOrigin
  tags: string[]
}

// ================================ ФИЗИЧЕСКИЕ СВОЙСТВА

export interface MaterialPhysical {
  // Механические
  density: number           // г/см³, 0.1-20.0
  hardness: number          // условная шкала 0-200
  toughness: number         // 0-200
  elasticity: number        // 0-200

  // Тепловые
  meltingPoint: number | null // °C, 0-4000, null если не плавится
  ignitionPoint: number | null // °C, null если не горит
  thermalConductivity: number // условно 0-100

  // Структурные
  porosity: number          // 0-100, %
  compressiveStrength: number // 0-200
  tensileStrength: number   // 0-200
}

// ================================ ХИМИЧЕСКИЕ СВОЙСТВА

export interface MaterialChemical {
  reactivity: number         // 0-100, химическая активность
  stability: number          // 0-100, устойчивость
  corrosionResistance: number // 0-100
  oxidationResistance: number // 0-100
  acidity: number            // 0-14, pH
  solubility: number         // 0-100
}

// ================================ МАГИЧЕСКИЕ СВОЙСТВА

export interface MaterialArcane {
  conductivity: number    // 0-100, магическая проводимость
  affinity: number       // 0-100, родство с магией
  stability: number      // 0-100, устойчивость к магии
  resonance: number      // 0-100, резонанс со школами
}

// ================================ ТЕХНОЛОГИЧЕСКИЕ СВОЙСТВА

export interface MaterialProcessing {
  workability: number      // 0-100, обрабатываемость
  refineDifficulty: number // 0-100, сложность переработки
  purityPotential: number  // 0-100, максимальная чистота
  defectRisk: number       // 0-100, риск дефектов
  repairability: number    // 0-100, ремонтопригодность
}

// ================================ ЭКОНОМИКА

export interface MaterialEconomy {
  rarity: number          // 0-200, выше = реже
  tier: number           // 1-10, уровень сложности
  baseValue: number      // базовая цена
  availability: number   // 0-100, доступность
  discoverability: number // 0-100, вероятность открытия
}

// ================================ РЕЦЕПТ ПРОИЗВОДСТВА

export type ProcessType =
  | 'smelting'
  | 'alloying'
  | 'tanning'
  | 'distillation'
  | 'refining'
  | 'crushing'
  | string

export interface MaterialRecipeInput {
  materialId: string
  quantity: number
  fraction: number        // доля в смеси (для сплавов)
}

export interface MaterialProcessModifiers {
  temperature?: number
  duration?: number       // базовое время, сек
  catalyst?: string | null
  qualityImpact?: number  // влияние качества процесса
}

export interface MaterialRecipe {
  process: ProcessType
  inputs: MaterialRecipeInput[]
  processModifiers?: MaterialProcessModifiers
  yield: number
  byproducts?: Array<{ materialId: string; quantity: number }>
  propertyTransform?: Record<string, number> // переопределение свойств
}

// ================================ РЕЗЮМЕ ДЛЯ UI

export interface MaterialSummary {
  basic: string           // короткое описание
  applied: string         // где применяется
  strengths: string[]     // плюсы
  weaknesses: string[]    // минусы
  bestFor: string[]       // лучшие применения
}

// ================================ ПУТИ ОТКРЫТИЯ

export type DiscoveryType =
  | 'harvest'      // добыча
  | 'craft'        // создание
  | 'use'          // использование
  | 'research'     // исследование
  | 'mastery'      // мастерство
  | 'special'      // особые события
  | 'quest'        // квесты
  | 'trade'        // торговля

export interface DiscoveryRequirement {
  quantity?: number
  threshold?: number
  requiredMaterial?: string
  requiredBuilding?: string
}

export interface DiscoveryPath {
  type: DiscoveryType
  requiredExpertise: number // минимальная экспертиза
  requirement?: DiscoveryRequirement
}

export interface MaterialDiscovery {
  unlockedBy: DiscoveryPath[]
  researchCost?: number
}

// ================================ ПОЛНАЯ СУЩНОСТЬ МАТЕРИАЛА

export interface MaterialNode {
  // Ядро
  identity: MaterialIdentity
  physical: MaterialPhysical
  chemical: MaterialChemical
  arcane: MaterialArcane
  processing: MaterialProcessing
  economy: MaterialEconomy

  // Рецепт (если применимо)
  recipe?: MaterialRecipe

  // Резюме для UI
  summary: MaterialSummary

  // Пути открытия
  discovery: MaterialDiscovery

  // Описание
  description?: string
  icon?: string

  // Метаданные
  version: number
  createdAt?: number
  updatedAt?: number
}

// ================================ КАТЕГОРИИ ДЛЯ ОТОБРАЖЕНИЯ

export type MaterialDisplayCategory =
  | 'all'
  | 'ores'
  | 'ingots'
  | 'stones'
  | 'wood'
  | 'leather'
  | 'other'

export const MATERIAL_CATEGORIES: { id: MaterialDisplayCategory; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'ores', label: 'Руды' },
  { id: 'ingots', label: 'Слитки' },
  { id: 'stones', label: 'Камни' },
  { id: 'wood', label: 'Дерево' },
  { id: 'leather', label: 'Кожа' },
  { id: 'other', label: 'Другое' },
]

// ================================ МАППИНГ КЛАССОВ В КАТЕГОРИИ

export function getDisplayCategory(material: MaterialNode): MaterialDisplayCategory {
  const { class: matClass, origin, tags } = material.identity

  // Руды
  if (matClass === 'mineral' && (tags.includes('ore') || origin === 'natural')) {
    return 'ores'
  }

  // Слитки
  if (matClass === 'metal' && (origin === 'refined' || origin === 'alloy')) {
    return 'ingots'
  }

  // Камни
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

  return 'other'
}

// ================================ РЕДКОСТЬ ДЛЯ UI

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
  common: 'bg-stone-900/50 border-stone-700',
  uncommon: 'bg-green-900/30 border-green-700/50',
  rare: 'bg-blue-900/30 border-blue-700/50',
  epic: 'bg-purple-900/30 border-purple-700/50',
  legendary: 'bg-amber-900/30 border-amber-700/50',
}

export const RARITY_LABELS: Record<MaterialRarity, string> = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
}
