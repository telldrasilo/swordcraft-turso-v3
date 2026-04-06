/**
 * Единый гейт экрана «Зачарования» (алтарь): доступ к контенту tier-2 локаций.
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE1.md
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md
 */

import { getAvailableLocations } from '@/modules/expeditions/data/locations'

export function canAccessEnchantmentAltarScreen(guildLevel: number): boolean {
  return getAvailableLocations(guildLevel).some((l) => l.tier >= 2)
}

/**
 * Полноценный контент модуля зачарований (плейсхолдер фазы 2+): tier-2,
 * чертёж и артефакты после квеста «Эхо забытой кузни», узел **собран** в кузнице.
 */
export function canUseEnchantmentAltarContent(
  guildLevel: number,
  altarUnlockedByForgottenForgeQuest: boolean,
  altarBuiltInForge: boolean
): boolean {
  return (
    canAccessEnchantmentAltarScreen(guildLevel) &&
    altarUnlockedByForgottenForgeQuest &&
    altarBuiltInForge
  )
}
