/**
 * Стоимость баффов перековки в ДВ: база из реестра × множитель ранга души (тир 0…10).
 */
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { getWarSoulTier } from '@/data/war-soul-tiers'
import { REFORGE_BUFF_WAR_SOUL_COST_PER_TIER } from '@/lib/store-utils/constants'

export function getBuffReforgeCostMultiplier(warSoul: number, maxWarSoul: number): number {
  const tier = getWarSoulTier(warSoul, maxWarSoul).tier
  return 1 + tier * REFORGE_BUFF_WAR_SOUL_COST_PER_TIER
}

export function resolveBuffReforgeWarSoulCost(
  weapon: Pick<CraftedWeaponV2, 'warSoul' | 'maxWarSoul'>,
  baseWarSoulCost: number
): number {
  const m = getBuffReforgeCostMultiplier(weapon.warSoul, weapon.maxWarSoul)
  return Math.max(1, Math.round(baseWarSoulCost * m))
}
