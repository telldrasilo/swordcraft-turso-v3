/**
 * Утилиты для работы с Душой Войны
 * 
 * Расчёт наград, тиров и бонусов
 */

import {
  WarSoulTierInfo,
  WarSoulBonus,
  getWarSoulTier,
  getWarSoulTierName,
  getWarSoulTierIcon,
  getWarSoulTierColor,
  getWarSoulTierBgColor,
  getWarSoulTierBonus,
  getProgressToNextTier,
  isMaxTierReached,
  getNextTierInfo,
} from '@/data/war-soul-tiers'

// Re-export функции из war-soul-tiers для удобства
export {
  getWarSoulTier,
  getWarSoulTierName,
  getWarSoulTierIcon,
  getWarSoulTierColor,
  getWarSoulTierBgColor,
  getWarSoulTierBonus,
  getProgressToNextTier,
  isMaxTierReached,
  getNextTierInfo,
}

export type { WarSoulTierInfo, WarSoulBonus }

// ================================
// РАСЧЁТ НАГРАД
// ================================

export interface WarSoulCalculationParams {
  baseWarSoul: number
  warSoulMultiplier?: number
  adventurerSkill?: number
  weaponQuality?: number
  isCrit?: boolean
  critMultiplier?: number
  tierBonuses?: WarSoulBonus
}

/**
 * Рассчитать награду Души Войны
 * 
 * Унифицированная формула для экспедиций и приключений
 */
export function calculateWarSoulReward(params: WarSoulCalculationParams): number {
  const {
    baseWarSoul,
    warSoulMultiplier = 1.0,
    adventurerSkill = 0,
    weaponQuality = 50,
    isCrit = false,
    critMultiplier = 1.5,
    tierBonuses,
  } = params

  // Базовый расчёт
  let result = baseWarSoul * warSoulMultiplier

  // Бонус от навыка искателя (+1% за каждый пункт навыка)
  result *= (1 + adventurerSkill / 100)

  // Бонус от качества оружия (0.8 - 1.2)
  const qualityBonus = 0.8 + (weaponQuality / 100) * 0.4
  result *= qualityBonus

  // Бонус от тира души
  if (tierBonuses?.warSoulBonus) {
    result *= (1 + tierBonuses.warSoulBonus / 100)
  }

  // Критический успех
  if (isCrit) {
    result *= critMultiplier
  }

  // Случайная вариация ±20%
  const variance = 0.8 + Math.random() * 0.4
  result *= variance

  // Минимум 1 душа
  return Math.max(1, Math.floor(result))
}

/**
 * Рассчитать бонусы от тира для экспедиции
 * 
 * Используется при расчёте результатов экспедиций
 */
export function calculateTierBonuses(warSoul: number, maxWarSoul: number): {
  successBonus: number
  goldBonus: number
  warSoulBonus: number
  critChance: number
} {
  const tier = getWarSoulTier(warSoul, maxWarSoul)
  return tier.bonus
}

// ================================
// ФОРМАТИРОВАНИЕ
// ================================

/**
 * Получить форматированное имя тира с иконкой
 */
export function formatWarSoulTier(warSoul: number, maxWarSoul: number): string {
  const tier = getWarSoulTier(warSoul, maxWarSoul)
  return `${tier.icon} ${tier.name}`
}

/**
 * Получить описание бонусов тира
 */
export function formatTierBonuses(bonus: WarSoulBonus): string[] {
  const parts: string[] = []
  
  if (bonus.successBonus > 0) {
    parts.push(`+${bonus.successBonus}% шанс успеха`)
  }
  if (bonus.goldBonus > 0) {
    parts.push(`+${bonus.goldBonus}% золота`)
  }
  if (bonus.warSoulBonus > 0) {
    parts.push(`+${bonus.warSoulBonus}% душ`)
  }
  if (bonus.critChance > 0) {
    parts.push(`+${bonus.critChance}% крита`)
  }
  
  return parts
}

/**
 * Получить строку прогресса к следующему тиру
 */
export function formatProgressToNextTier(warSoul: number, maxWarSoul: number): string {
  const progress = getProgressToNextTier(warSoul, maxWarSoul)
  const nextTier = getNextTierInfo(warSoul, maxWarSoul)
  
  if (!nextTier) {
    return 'Максимальный тир достигнут!'
  }
  
  return `${progress}% до ${nextTier.icon} ${nextTier.name}`
}

// ================================
// МЕМОИЗАЦИЯ
// ================================

// Простая мемоизация для getWarSoulTier
const tierCache = new Map<number, WarSoulTierInfo>()

/**
 * Получить тир с кэшированием (для оптимизации)
 */
export function getWarSoulTierCached(warSoul: number, maxWarSoul: number): WarSoulTierInfo {
  const cacheKey = warSoul
  
  const cached = tierCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }
  
  const tier = getWarSoulTier(warSoul, maxWarSoul)
  tierCache.set(cacheKey, tier)
  return tier
}

/**
 * Очистить кэш тиров (вызывать при необходимости)
 */
export function clearTierCache(): void {
  tierCache.clear()
}
