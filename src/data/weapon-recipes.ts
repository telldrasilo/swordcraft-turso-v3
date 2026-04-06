/**
 * Система рецептов и оружия для SwordCraft: Idle Forge
 */

// ================================
// ТИПЫ
// ================================

// Импортируем типы из единого источника
import type { 
  CraftedWeapon, 
  WeaponType, 
  WeaponTier, 
  WeaponMaterial,
  QualityGrade 
} from '@/store/slices/craft-slice'

import {
  qualityGrades,
  getQualityGrade,
  weaponTypeStats,
} from '@/lib/craft/weapon-display-meta'
import { LEGACY_WEAPON_RECIPE_ROWS, type LegacyRecipeRow } from '@/data/recipes/legacy-recipe-rows'

// Реэкспорт для совместимости
export type { CraftedWeapon, WeaponType, WeaponTier, WeaponMaterial, QualityGrade }
export { qualityGrades, getQualityGrade, weaponTypeStats }
export type MaterialType = WeaponMaterial

// Ресурсы для крафта
export interface CraftingCost {
  gold?: number
  soulEssence?: number
  leather?: number
  // Сырьё
  wood?: number
  stone?: number
  iron?: number
  coal?: number
  copper?: number
  tin?: number
  silver?: number
  goldOre?: number
  mithril?: number
  // Переработанные
  ironIngot?: number
  copperIngot?: number
  tinIngot?: number
  bronzeIngot?: number
  steelIngot?: number
  silverIngot?: number
  goldIngot?: number
  mithrilIngot?: number
  planks?: number
  stoneBlocks?: number
}

// Рецепт оружия — легаси-форма для заказов и оценки cost; id строки = шаблон заказа (material×tier×форма)
export interface WeaponRecipe {
  id: string
  /** id рецепта формы в v2 (`allRecipes`), тот же что выбирается в кузнице */
  shapeRecipeId: string
  name: string
  type: WeaponType
  tier: WeaponTier
  material: MaterialType
  
  // Стоимость крафта
  cost: CraftingCost
  
  // Время крафта в секундах
  baseCraftTime: number
  
  // Базовая цена продажи
  baseSellPrice: number
  
  // Требуемый уровень кузнеца
  requiredLevel: number
  
  // Описание
  description: string
  
  // Разблокировка
  unlocked: boolean
  unlockCondition?: string
}

// Активный крафт
export interface ActiveCrafting {
  recipeId: string
  startTime: number
  endTime: number
  progress: number
}

// ================================
// ДАННЫЕ РЕЦЕПТОВ (шаблоны заказов; формы крафта — отдельно в allRecipes)
// ================================

/** Базовая форма v2 по типу оружия (один рецепт на форму, без материала в id). */
export function defaultShapeRecipeIdForWeaponType(type: string): string {
  switch (type) {
    case 'sword':
      return 'basic_sword'
    case 'dagger':
      return 'basic_dagger'
    case 'axe':
      return 'basic_axe'
    case 'mace':
      return 'basic_mace'
    case 'spear':
      return 'basic_spear'
    case 'hammer':
      return 'basic_hammer'
    default:
      return 'basic_sword'
  }
}

function legacyOrderRowFromData(row: LegacyRecipeRow): WeaponRecipe {
  return {
    id: row.id,
    shapeRecipeId: defaultShapeRecipeIdForWeaponType(row.type),
    name: row.name,
    type: row.type,
    tier: row.tier,
    material: row.material,
    cost: row.cost as CraftingCost,
    baseCraftTime: row.baseCraftTime,
    baseSellPrice: row.baseSellPrice,
    requiredLevel: row.requiredLevel,
    description: row.description,
    unlocked: row.unlocked,
    unlockCondition: row.unlockCondition,
  }
}

/** Шаблоны заказов (iron_sword, bronze_axe, …): cost / tier / material для NPC; крафт — по shapeRecipeId */
export const weaponRecipes: WeaponRecipe[] = LEGACY_WEAPON_RECIPE_ROWS.map(legacyOrderRowFromData)

export const legacyWeaponRecipeRowIds: Set<string> = new Set(
  LEGACY_WEAPON_RECIPE_ROWS.map((r) => r.id),
)

// qualityGrades / getQualityGrade / weaponTypeStats — @/lib/craft/weapon-display-meta

// Расчёт качества при крафте
export function calculateCraftQuality(
  workerQuality: number, // Характеристика качества рабочих
  playerLevel: number,
  recipeTier: WeaponTier
): number {
  // Базовое качество (случайное)
  const base = Math.random() * 40 + 30 // 30-70
  
  // Бонус от рабочих
  const workerBonus = workerQuality / 100 * 20 // до +20
  
  // Бонус от уровня игрока
  const levelBonus = Math.min(playerLevel * 0.5, 15) // до +15
  
  // Шанс критического успеха
  const critChance = Math.min(workerQuality / 100 * 0.1 + playerLevel * 0.01, 0.2)
  const critBonus = Math.random() < critChance ? 20 : 0
  
  // Шанс провала для высоких тиров
  const tierPenalty = { common: 0, uncommon: 2, rare: 5, epic: 8, legendary: 12, mythic: 15 }
  const penalty = Math.random() * (tierPenalty[recipeTier] || 0)
  
  const finalQuality = Math.max(1, Math.min(100, base + workerBonus + levelBonus + critBonus - penalty))
  
  return Math.round(finalQuality)
}

export const tierMultipliers = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
  mythic: 5.0
}

export const materialMultipliers = {
  iron: 1.0,
  bronze: 1.15,
  steel: 1.3,
  silver: 1.4,
  gold: 1.5,
  mithril: 2.0
}

// Расчёт атаки оружия
export function calculateAttack(
  type: WeaponType,
  tier: WeaponTier,
  material: MaterialType,
  quality: number
): number {
  const typeStats = weaponTypeStats[type]
  const tierMult = tierMultipliers[tier]
  const materialMult = materialMultipliers[material]
  const qualityMult = qualityGrades[getQualityGrade(quality)].multiplier
  
  const baseAttack = typeStats.attackBase + typeStats.attackPerTier * Object.keys(tierMultipliers).indexOf(tier)
  
  return Math.round(baseAttack * tierMult * materialMult * qualityMult)
}

// Расчёт цены продажи
export function calculateSellPrice(
  basePrice: number,
  quality: number,
  tier: WeaponTier
): number {
  const qualityMult = qualityGrades[getQualityGrade(quality)].multiplier
  const tierMult = tierMultipliers[tier]
  
  return Math.round(basePrice * qualityMult * tierMult)
}

// ================================
// ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ
// ================================

export function getRecipe(id: string): WeaponRecipe | undefined {
  return weaponRecipes.find(r => r.id === id)
}

export function getAvailableRecipes(playerLevel: number): WeaponRecipe[] {
  return weaponRecipes.filter(r => r.requiredLevel <= playerLevel)
}

const ORDER_MATERIAL_TAGS = new Set([
  'iron',
  'bronze',
  'steel',
  'silver',
  'gold',
  'mithril',
])

/** Строка заказа для UI (тир/материал), если recipeId оружия — форма v2 (basic_*). */
export function legacyRecipeRowForCraftedWeapon(weapon: {
  recipeId: string
  type: string
  combatMaterialId?: string
  hiddenTags?: string[]
}): WeaponRecipe | undefined {
  const byOrderId = weaponRecipes.find((r) => r.id === weapon.recipeId)
  if (byOrderId) return byOrderId

  const tagMat = weapon.hiddenTags?.find((t) => ORDER_MATERIAL_TAGS.has(t))
  const materialHint = tagMat ?? weapon.combatMaterialId
  if (materialHint) {
    const byShape =
      weaponRecipes.find(
        (r) =>
          r.shapeRecipeId === weapon.recipeId &&
          r.type === weapon.type &&
          r.material === materialHint
      ) ?? weaponRecipes.find(
        (r) => r.shapeRecipeId === weapon.recipeId && r.type === weapon.type
      )
    return byShape
  }
  return weaponRecipes.find(
    (r) => r.shapeRecipeId === weapon.recipeId && r.type === weapon.type
  )
}

export function canCraft(recipe: WeaponRecipe, resources: CraftingCost): boolean {
  for (const [resource, amount] of Object.entries(recipe.cost)) {
    if ((resources[resource as keyof CraftingCost] || 0) < amount) {
      return false
    }
  }
  return true
}

/** Явный алиас для мест, где рядом импортируется V2 `WeaponRecipe` из `@/types/craft-v2` */
export type LegacyWeaponRecipe = WeaponRecipe
