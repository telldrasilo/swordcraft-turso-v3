// ================================
// ЯДРО ТИПОВ МАТЕРИАЛОВ (MaterialNode)
// Согласовано с записями в src/data/materials/library/**/*.ts
// ================================

export type MaterialClass = 'metal' | 'mineral' | 'wood' | 'leather' | 'organic' | 'other'

export type MaterialOrigin = 'natural' | 'refined' | 'alloy' | 'processed' | 'composite' | string

export interface MaterialIdentity {
  id: string
  name: string
  class: MaterialClass
  origin: MaterialOrigin
  tags: string[]
}

export interface MaterialPhysical {
  density: number
  hardness: number
  toughness: number
  elasticity: number
  meltingPoint: number | null
  ignitionPoint: number | null
  thermalConductivity: number
  porosity: number
  compressiveStrength: number
  tensileStrength: number
}

export interface MaterialChemical {
  reactivity: number
  stability: number
  corrosionResistance: number
  oxidationResistance: number
  acidity: number
  solubility: number
}

export interface MaterialArcane {
  conductivity: number
  affinity: number
  stability: number
  resonance: number
}

export interface MaterialProcessing {
  workability: number
  refineDifficulty: number
  purityPotential: number
  defectRisk: number
  repairability: number
}

export interface MaterialEconomy {
  rarity: number
  tier: number
  baseValue: number
  availability: number
  discoverability: number
}

export type ProcessType = string

export interface MaterialRecipeInput {
  materialId: string
  quantity: number
  fraction?: number
}

export interface MaterialProcessModifiers {
  temperature?: number
  duration?: number
  qualityImpact?: number
}

export interface MaterialRecipe {
  process: ProcessType
  inputs: MaterialRecipeInput[]
  processModifiers?: MaterialProcessModifiers
  yield: number
}

export interface MaterialSummary {
  basic: string
  applied: string
  strengths: string[]
  weaknesses: string[]
  bestFor: string[]
}

export type DiscoveryType = 'harvest' | 'craft' | 'research' | string

export interface DiscoveryRequirement {
  type: DiscoveryType
  requiredExpertise: number
}

export type DiscoveryPath = DiscoveryRequirement

export interface MaterialDiscovery {
  unlockedBy: DiscoveryRequirement[]
  /** Стоимость исследования (золото и т.п.), если применимо */
  researchCost?: number
}

export interface MaterialNode {
  identity: MaterialIdentity
  physical: MaterialPhysical
  chemical: MaterialChemical
  arcane: MaterialArcane
  processing: MaterialProcessing
  economy: MaterialEconomy
  summary: MaterialSummary
  discovery: MaterialDiscovery
  recipe?: MaterialRecipe
  description: string
  icon: string
  version: number
}

// ================================
// МАППИНГ КЛАССОВ В КАТЕГОРИИ
// ================================

export function getDisplayCategory(material: MaterialNode): MaterialDisplayCategory {
  const { class: matClass, tags, id } = material.identity

  if (matClass === 'mineral' && tags.includes('gem')) {
    return 'gems'
  }

  if (matClass === 'mineral' && (tags.includes('ore') || id === 'coal' || id === 'ancient_coal')) {
    return 'ores'
  }

  if (matClass === 'metal') {
    return 'ingots'
  }

  if (matClass === 'mineral') {
    return 'stones'
  }

  if (matClass === 'wood') {
    return 'wood'
  }

  if (matClass === 'leather') {
    return 'leather'
  }

  if (matClass === 'organic') {
    return 'organics'
  }

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

export type MaterialDisplayCategory =
  | 'all'
  | 'ores'
  | 'ingots'
  | 'stones'
  | 'gems'
  | 'wood'
  | 'leather'
  | 'organics'
  | 'other'

export const MATERIAL_CATEGORIES: { id: MaterialDisplayCategory; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'ores', label: 'Руды' },
  { id: 'ingots', label: 'Слитки' },
  { id: 'stones', label: 'Камни' },
  { id: 'gems', label: 'Кристаллы' },
  { id: 'wood', label: 'Дерево' },
  { id: 'leather', label: 'Кожа' },
  { id: 'organics', label: 'Органика' },
  { id: 'other', label: 'Другое' },
]
