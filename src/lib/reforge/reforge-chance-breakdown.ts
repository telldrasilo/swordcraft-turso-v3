import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { ReforgeTechniqueEntry } from '@/data/reforge/reforge-techniques-registry'
import { getWarSoulTier } from '@/data/war-soul-tiers'
import { computeAwakenPoolRatio, computeAwakenScarChance } from './apply'

export interface AwakenChanceBreakdown {
  base: number
  poolRatio: number
  poolContribution: number
  tier: number
  tierBonus: number
  /** Совпадает с `computeAwakenScarChance` после cap 0.9 */
  total: number
}

/** Разложение шанса пробуждения для UI (сумма вкладов до cap). */
export function getAwakenChanceBreakdown(
  weapon: CraftedWeaponV2,
  technique: ReforgeTechniqueEntry
): AwakenChanceBreakdown {
  const base = technique.awakenBaseChance ?? 0.1
  const poolRatio = computeAwakenPoolRatio(weapon)
  const poolContribution = poolRatio * 0.25
  const tier = getWarSoulTier(weapon.warSoul, weapon.maxWarSoul).tier
  const tierBonus = tier * 0.015
  const total = computeAwakenScarChance(weapon, technique)
  return {
    base,
    poolRatio,
    poolContribution,
    tier,
    tierBonus,
    total,
  }
}
