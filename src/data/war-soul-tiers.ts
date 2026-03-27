/**
 * Система тиров Души Войны
 * 
 * Определяет уровни Души Войны от Искры до Великой Души
 */

/**
 * Бонусы тира Души Войны
 */
export interface WarSoulBonus {
  successBonus: number  // +X% шанс успеха экспедиции
  goldBonus: number     // +X% золота
  warSoulBonus: number  // +X% к получаемой душе
  critChance: number    // +X% шанс критического успеха
}

/**
 * Информация о тире Души Войны
 */
export interface WarSoulTierInfo {
  tier: number          // Номер тира (0-10)
  name: string          // Название
  icon: string         // Emoji иконка
  color: string        // Tailwind класс цвета текста
  bgColor: string      // Tailwind класс фона
  minWarSoul: number   // Минимальное количество душ для этого тира
  maxWarSoul: number   // Максимальное количество душ (кап тира)
  description: string   // Описание
  bonus: WarSoulBonus  // Бонусы
}

/**
 * Данные тиров Души Войны
 * 
 * Тиры от Искры (0) до Великой Души Войны (10)
 * Великая Душа Войны недостижима с текущими материалами (требует 1000+)
 * Тир Мифрила соответствует Средней Душе (тир 4)
 */
export const WAR_SOUL_TIERS: WarSoulTierInfo[] = [
  {
    tier: 0,
    name: 'Искра',
    icon: '✨',
    color: 'text-stone-400',
    bgColor: 'bg-stone-800/80',
    minWarSoul: 0,
    maxWarSoul: 10,
    description: 'Первые проблески боевого духа',
    bonus: { successBonus: 0, goldBonus: 0, warSoulBonus: 0, critChance: 0 }
  },
  {
    tier: 1,
    name: 'Тлеющая',
    icon: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
    minWarSoul: 10,
    maxWarSoul: 25,
    description: 'Начальный огонь боевых воспоминаний',
    bonus: { successBonus: 2, goldBonus: 3, warSoulBonus: 2, critChance: 0 }
  },
  {
    tier: 2,
    name: 'Горящая',
    icon: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    minWarSoul: 25,
    maxWarSoul: 50,
    description: 'Укрепляющийся боевой дух',
    bonus: { successBonus: 4, goldBonus: 5, warSoulBonus: 3, critChance: 1 }
  },
  {
    tier: 3,
    name: 'Пылающая',
    icon: '💫',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
    minWarSoul: 50,
    maxWarSoul: 100,
    description: 'Яркая индивидуальность оружия',
    bonus: { successBonus: 6, goldBonus: 8, warSoulBonus: 5, critChance: 2 }
  },
  {
    tier: 4,
    name: 'Средняя',
    icon: '🌟',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    minWarSoul: 100,
    maxWarSoul: 200,
    description: 'Сформировавшаяся боевая аура (тир Мифрила)',
    bonus: { successBonus: 8, goldBonus: 10, warSoulBonus: 7, critChance: 3 }
  },
  {
    tier: 5,
    name: 'Сильная',
    icon: '⭐',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    minWarSoul: 200,
    maxWarSoul: 350,
    description: 'Мощный дух воина',
    bonus: { successBonus: 10, goldBonus: 12, warSoulBonus: 10, critChance: 4 }
  },
  {
    tier: 6,
    name: 'Благородная',
    icon: '👑',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/30',
    minWarSoul: 350,
    maxWarSoul: 500,
    description: 'Величие в каждом ударе',
    bonus: { successBonus: 12, goldBonus: 15, warSoulBonus: 12, critChance: 5 }
  },
  {
    tier: 7,
    name: 'Величественная',
    icon: '🦅',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
    minWarSoul: 500,
    maxWarSoul: 700,
    description: 'Легендарная слава оружия',
    bonus: { successBonus: 15, goldBonus: 18, warSoulBonus: 15, critChance: 6 }
  },
  {
    tier: 8,
    name: 'Героическая',
    icon: '🏆',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30',
    minWarSoul: 700,
    maxWarSoul: 900,
    description: 'Оружие героев прошлого',
    bonus: { successBonus: 18, goldBonus: 22, warSoulBonus: 18, critChance: 7 }
  },
  {
    tier: 9,
    name: 'Легендарная',
    icon: '⚔️',
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/30',
    minWarSoul: 900,
    maxWarSoul: 1000,
    description: 'Переписывающая историю',
    bonus: { successBonus: 20, goldBonus: 25, warSoulBonus: 20, critChance: 8 }
  },
  {
    tier: 10,
    name: 'Великая Душа Войны',
    icon: '☀️',
    color: 'text-amber-300',
    bgColor: 'bg-amber-600/40',
    minWarSoul: 1000,
    maxWarSoul: Infinity,
    description: 'Абсолютное совершенство (недостижима с текущими материалами)',
    bonus: { successBonus: 25, goldBonus: 30, warSoulBonus: 25, critChance: 10 }
  }
]

/**
 * Получить информацию о тире по количеству душ
 */
export function getWarSoulTier(warSoul: number, maxWarSoul: number = 100): WarSoulTierInfo {
  // Учитываем максимальный кап душ
  const effectiveWarSoul = Math.min(warSoul, maxWarSoul)
  
  // Ищем подходящий тир
  for (let i = WAR_SOUL_TIERS.length - 1; i >= 0; i--) {
    if (effectiveWarSoul >= WAR_SOUL_TIERS[i].minWarSoul) {
      return WAR_SOUL_TIERS[i]
    }
  }
  
  return WAR_SOUL_TIERS[0]
}

/**
 * Получить название тира
 */
export function getWarSoulTierName(warSoul: number, maxWarSoul: number = 100): string {
  return getWarSoulTier(warSoul, maxWarSoul).name
}

/**
 * Получить иконку тира
 */
export function getWarSoulTierIcon(warSoul: number, maxWarSoul: number = 100): string {
  return getWarSoulTier(warSoul, maxWarSoul).icon
}

/**
 * Получить цвет тира
 */
export function getWarSoulTierColor(warSoul: number, maxWarSoul: number = 100): string {
  return getWarSoulTier(warSoul, maxWarSoul).color
}

/**
 * Получить фоновый цвет тира
 */
export function getWarSoulTierBgColor(warSoul: number, maxWarSoul: number = 100): string {
  return getWarSoulTier(warSoul, maxWarSoul).bgColor
}

/**
 * Получить бонусы тира
 */
export function getWarSoulTierBonus(warSoul: number, maxWarSoul: number = 100): WarSoulBonus {
  return getWarSoulTier(warSoul, maxWarSoul).bonus
}

/**
 * Получить прогресс к следующему тиру (0-100%)
 */
export function getProgressToNextTier(warSoul: number, maxWarSoul: number = 100): number {
  const effectiveWarSoul = Math.min(warSoul, maxWarSoul)
  const currentTier = getWarSoulTier(effectiveWarSoul, maxWarSoul)
  
  // Если это максимальный тир
  if (currentTier.tier >= 10 || currentTier.maxWarSoul === Infinity) {
    return 100
  }
  
  const progress = effectiveWarSoul - currentTier.minWarSoul
  const range = currentTier.maxWarSoul - currentTier.minWarSoul
  
  return Math.min(100, Math.floor((progress / range) * 100))
}

/**
 * Получить информацию о следующем тире
 */
export function getNextTierInfo(warSoul: number, maxWarSoul: number = 100): WarSoulTierInfo | null {
  const currentTier = getWarSoulTier(warSoul, maxWarSoul)
  const nextTierIndex = currentTier.tier + 1
  
  if (nextTierIndex >= WAR_SOUL_TIERS.length) {
    return null
  }
  
  return WAR_SOUL_TIERS[nextTierIndex]
}

/**
 * Проверить, достигнут ли максимальный тир
 */
export function isMaxTierReached(warSoul: number, maxWarSoul: number = 100): boolean {
  const tier = getWarSoulTier(warSoul, maxWarSoul)
  return tier.tier >= 10
}
