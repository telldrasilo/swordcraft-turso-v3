/**
 * Гейты экрана «Зачарования»: тир гильдии (для полного контента) и квест FF (стройка).
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE1.md
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md
 */

import { getAvailableLocations } from '@/modules/expeditions'

export function canAccessEnchantmentAltarScreen(guildLevel: number): boolean {
  return getAvailableLocations(guildLevel).some((l) => l.tier >= 2)
}

/**
 * Чертёж из квеста FF: экран «Зачарования» и стройка алтаря (без проверки тира гильдии).
 */
export function canAccessForgottenForgeEnchantmentFlow(
  altarUnlockedByForgottenForgeQuest: boolean
): boolean {
  return altarUnlockedByForgottenForgeQuest
}

/**
 * Полноценный контент зачарований (рост перка / эссенция) после завершения стройки v2.
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
