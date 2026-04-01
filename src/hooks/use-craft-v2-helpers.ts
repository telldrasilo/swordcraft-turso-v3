/**
 * Сборка готового оружия v2 после броска разброса
 */

import type { CraftPlan, CraftedWeaponV2, WeaponRecipe } from '@/types/craft-v2'
import { getQualityRank } from '@/types/craft-v2'
import type { WeaponCalculationResult } from '@/lib/craft/calculator'
import type { WeaponNameResult } from '@/lib/craft/name-generator'

export function buildCompletedWeaponV2(
  plan: CraftPlan,
  rolled: WeaponCalculationResult,
  weaponName: WeaponNameResult,
  recipe: WeaponRecipe
): CraftedWeaponV2 {
  const combatPart = recipe.combatPart || 'blade'
  const combatMatId = plan.materials[combatPart]?.materialId || 'unknown'
  const hiddenTags = [
    recipe.type || 'sword',
    combatMatId,
    `q:${Math.floor(rolled.quality)}`,
    `rank:${weaponName.qualityRank || 'F'}`,
  ]
  const uniqueId = `w_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

  return {
    id: uniqueId,
    recipeId: plan.recipeId,
    prefix: weaponName.prefix,
    baseName: weaponName.baseName,
    suffix: weaponName.suffix,
    fullName: weaponName.fullName,
    type: recipe.type || 'sword',
    tier: recipe.baseStats ? Math.ceil(rolled.stats.attack / 20) : 1,
    materials: rolled.materials,
    stats: rolled.stats,
    quality: rolled.quality,
    qualityGrade: rolled.qualityGrade,
    qualityRank: weaponName.qualityRank || getQualityRank(rolled.quality),
    warSoul: 0,
    maxWarSoul: rolled.stats.soulCapacity,
    createdAt: Date.now(),
    adventureCount: 0,
    sellPrice: rolled.sellPrice,
    hiddenTags,
    combatMaterialId: combatMatId,
    currentDurability: rolled.stats.durability,
    epicMultiplier: 1.0,
    techniquesUsed: plan.techniques,
  }
}
