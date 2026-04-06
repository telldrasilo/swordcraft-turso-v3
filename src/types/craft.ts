/**
 * Типы для системы крафта
 */

import type { CraftingCost } from './resources'
import type { QualityGrade } from './shared/quality'
import type { WeaponEnchantment } from './shared/enchantment'

// Re-export shared functions for backward compatibility
export {
  getQualityGrade,
  getQualityMultiplier,
  getQualityColor,
  QUALITY_GRADES_V1 as QUALITY_GRADES,
} from './shared/quality'

// ================================
// КРАФТ
// ================================

/** Активный крафт */
export interface ActiveCraft {
  recipeId: string | null
  weaponName: string
  progress: number
  startTime: number | null
  endTime: number | null
  quality: number
}

/** Инвентарь оружия */
export interface WeaponInventory {
  weapons: CraftedWeapon[]
  maxSlots: number
}

/** Активная переработка */
export interface ActiveRefining {
  recipeId: string | null
  resourceName: string
  progress: number
  startTime: number | null
  endTime: number | null
  amount: number
}

// ================================
// РЕЦЕПТЫ
// ================================

/** Разблокированные рецепты */
export interface UnlockedRecipes {
  weaponRecipes: string[]
  refiningRecipes: string[]
}

/** Источник получения рецепта */
export interface RecipeSource {
  recipeId: string
  source: 'purchase' | 'order' | 'expedition' | 'level'
  obtainedAt: number
}

// ================================
// ОРУЖИЕ
// ================================

/** Тип оружия */
export type WeaponType = 'sword' | 'dagger' | 'axe' | 'mace' | 'spear' | 'hammer' | 'bow' | 'staff'

/** Тир оружия */
export type WeaponTier = 1 | 2 | 3 | 4 | 5 | 6

/** Материал оружия */
export type WeaponMaterial = 'iron' | 'bronze' | 'steel' | 'silver' | 'gold' | 'mithril'

/** Созданное оружие */
export interface CraftedWeapon {
  id: string
  recipeId: string
  name: string
  type: WeaponType
  tier: WeaponTier
  material: WeaponMaterial
  quality: number
  qualityGrade: QualityGrade
  attack: number
  durability: number
  maxDurability: number
  sellPrice: number
  createdAt: number
  warSoul: number
  adventureCount: number
  epicMultiplier: number
  materials: CraftingCost
  enchantments?: WeaponEnchantment[]
}

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialCraft: ActiveCraft = {
  recipeId: null,
  weaponName: 'Нет активного крафта',
  progress: 0,
  startTime: null,
  endTime: null,
  quality: 0,
}

export const initialWeaponInventory: WeaponInventory = {
  weapons: [],
  maxSlots: 20,
}

export const initialRefining: ActiveRefining = {
  recipeId: null,
  resourceName: 'Нет активной переработки',
  progress: 0,
  startTime: null,
  endTime: null,
  amount: 0,
}

export const initialUnlockedRecipes: UnlockedRecipes = {
  weaponRecipes: [
    'basic_sword',
    'basic_dagger',
    'basic_axe',
    'basic_mace',
    'basic_spear',
    'basic_hammer',
  ],
  refiningRecipes: ['iron_ingot', 'copper_ingot', 'tin_ingot', 'wood_planks', 'stone_blocks'],
}
