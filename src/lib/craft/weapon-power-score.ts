import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { getWarSoulTier } from '@/data/war-soul-tiers'
import { isWarSoulPoolUncapped } from '@/data/war-soul-balance'
import { WAR_SOUL_WEAPON_POOL_MIN } from '@/lib/war-soul-utils'

/**
 * Сводная «мощь» для сортировки и UI (инвентарь / верстак).
 * Формула: атака + бонус от шкалы качества (0–100 → 0–20) + бонус от тира Души Войны (×2).
 * @see docs/utils/FORMULAS.md
 */
export function recalculateWeaponPowerScore(weapon: CraftedWeaponV2): number {
  const maxPool = isWarSoulPoolUncapped(weapon.maxWarSoul)
    ? Number.POSITIVE_INFINITY
    : weapon.maxWarSoul ?? WAR_SOUL_WEAPON_POOL_MIN
  const tier = getWarSoulTier(weapon.warSoul, maxPool).tier
  const qualityBonus = Math.round((weapon.quality / 100) * 20)
  const warSoulTierBonus = tier * 2
  return Math.max(0, Math.round(weapon.stats.attack + qualityBonus + warSoulTierBonus))
}

export function withRecalculatedPowerScore(weapon: CraftedWeaponV2): CraftedWeaponV2 {
  return { ...weapon, powerScore: recalculateWeaponPowerScore(weapon) }
}
