/**
 * Система тиров Души Войны
 *
 * Пороги `minWarSoul` / `maxWarSoul` согласованы с:
 * - типичной наградой душ за успешную миссию модуля экспедиций (десятки–сотни очков за раз);
 * - **будущими модификаторами миссии** (события, контракты, баффы локации) — закладывайте запас в формулу;
 * - **бонусом текущего тира** `bonus.warSoulBonus` (% к душе), который применяется при завершении экспедиции
 *   (см. `guild-expedition-cross-slice`: итог умножается на `1 + warSoulBonus/100`). Чем выше тир, тем быстрее
 *   растёт заполнение пула — при подборе ширины интервалов это учтено (см. комментарии к ключевым ступеням).
 *
 * Ёмкость пула на оружии (`maxWarSoul` / `stats.soulCapacity` после крафта) масштабируется через
 * {@link scaleCraftSoulCapacityToWeaponPool} — «сырой» soul capacity из крафта (обычно десятки–сотни)
 * переводится в крупные **круглые** числа (шаг 10 000, минимум {@link WAR_SOUL_WEAPON_POOL_MIN}).
 */

/**
 * Минимальная ёмкость пула душ на оружии: должна быть ≥ порога входа в тир 10,
 * иначе прогрессия «Великая ДВ» недостижима.
 */
export const WAR_SOUL_WEAPON_POOL_MIN = 250_000

/**
 * Верхняя граница шкалы «пул душ» в UI прогноза крафта (нормализация полосы диапазона).
 * Совпадает с масштабом чисел после {@link scaleCraftSoulCapacityToWeaponPool}.
 */
export const WAR_SOUL_FORECAST_BAR_CAP = WAR_SOUL_WEAPON_POOL_MIN * 5

/** «Сырой» soul capacity из калькулятора крафта × числитель, затем округление к шагу (круглые ёмкости). */
const WAR_SOUL_POOL_SCALE_NUMERATOR = 4000
const WAR_SOUL_POOL_ROUND_STEP = 10_000

/**
 * Переводит вместимость душ из расчёта крафта в фактический кап накопления на оружии.
 * Кратно 10 000 для читаемости (например 280 000, а не 273 842).
 */
export function scaleCraftSoulCapacityToWeaponPool(rawSoulCapacityFromCraft: number): number {
  const r = Math.max(1, Math.round(rawSoulCapacityFromCraft))
  const scaled =
    Math.ceil((r * WAR_SOUL_POOL_SCALE_NUMERATOR) / WAR_SOUL_POOL_ROUND_STEP) *
    WAR_SOUL_POOL_ROUND_STEP
  return Math.max(WAR_SOUL_WEAPON_POOL_MIN, scaled)
}

/**
 * Бонусы тира Души Войны
 */
export interface WarSoulBonus {
  successBonus: number // +X% шанс успеха экспедиции
  goldBonus: number // +X% золота
  warSoulBonus: number // +X% к получаемой душе (на миссии; см. cross-slice)
  critChance: number // +X% шанс критического успеха
}

/**
 * Информация о тире Души Войны
 */
export interface WarSoulTierInfo {
  tier: number
  name: string
  icon: string
  color: string
  bgColor: string
  minWarSoul: number
  maxWarSoul: number
  description: string
  bonus: WarSoulBonus
}

/**
 * Данные тиров Души Войны (0–10).
 *
 * Калибровка (ориентиры при типичной награде ~70 душ/миссию на ранней игре, без крита и без учёта
 * будущих модификаторов миссии; средняя награда растёт с контентом и с `warSoulBonus` тира):
 * - Искра → Тлеющая: ~5–8 миссий (порог 500).
 * - Сильная → Благородная: ~30 миссий при ~200 душ/миссию в этом диапазоне (окно 6 000 очков).
 * - Легендарная → Великая: ~300–400 миссий при ~400 душ/миссию (окно 150 000).
 */
export const WAR_SOUL_TIERS: WarSoulTierInfo[] = [
  {
    tier: 0,
    name: 'Искра',
    icon: '✨',
    color: 'text-stone-400',
    bgColor: 'bg-stone-800/80',
    minWarSoul: 0,
    maxWarSoul: 500,
    description: 'Первые проблески боевого духа',
    bonus: { successBonus: 0, goldBonus: 0, warSoulBonus: 0, critChance: 0 },
  },
  {
    tier: 1,
    name: 'Тлеющая',
    icon: '🔥',
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
    minWarSoul: 500,
    maxWarSoul: 2_000,
    description: 'Начальный огонь боевых воспоминаний',
    bonus: { successBonus: 2, goldBonus: 3, warSoulBonus: 2, critChance: 0 },
  },
  {
    tier: 2,
    name: 'Горящая',
    icon: '⚡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
    minWarSoul: 2_000,
    maxWarSoul: 8_000,
    description: 'Укрепляющийся боевой дух',
    bonus: { successBonus: 4, goldBonus: 5, warSoulBonus: 3, critChance: 1 },
  },
  {
    tier: 3,
    name: 'Пылающая',
    icon: '💫',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
    minWarSoul: 8_000,
    maxWarSoul: 22_000,
    description: 'Яркая индивидуальность оружия',
    bonus: { successBonus: 6, goldBonus: 8, warSoulBonus: 5, critChance: 2 },
  },
  {
    tier: 4,
    name: 'Средняя',
    icon: '🌟',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/30',
    minWarSoul: 22_000,
    maxWarSoul: 28_000,
    description: 'Сформировавшаяся боевая аура',
    bonus: { successBonus: 8, goldBonus: 10, warSoulBonus: 7, critChance: 3 },
  },
  {
    tier: 5,
    name: 'Сильная',
    icon: '⭐',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
    minWarSoul: 28_000,
    maxWarSoul: 34_000,
    description: 'Мощный дух воина (узкое окно ~30 миссий при ~200 душ/миссию с учётом бонуса тира)',
    bonus: { successBonus: 10, goldBonus: 12, warSoulBonus: 10, critChance: 4 },
  },
  {
    tier: 6,
    name: 'Благородная',
    icon: '👑',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-900/30',
    minWarSoul: 34_000,
    maxWarSoul: 52_000,
    description: 'Величие в каждом ударе',
    bonus: { successBonus: 12, goldBonus: 15, warSoulBonus: 12, critChance: 5 },
  },
  {
    tier: 7,
    name: 'Величественная',
    icon: '🦅',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
    minWarSoul: 52_000,
    maxWarSoul: 72_000,
    description: 'Легендарная слава оружия',
    bonus: { successBonus: 15, goldBonus: 18, warSoulBonus: 15, critChance: 6 },
  },
  {
    tier: 8,
    name: 'Героическая',
    icon: '🏆',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-900/30',
    minWarSoul: 72_000,
    maxWarSoul: 100_000,
    description: 'Оружие героев прошлого',
    bonus: { successBonus: 18, goldBonus: 22, warSoulBonus: 18, critChance: 7 },
  },
  {
    tier: 9,
    name: 'Легендарная',
    icon: '⚔️',
    color: 'text-rose-400',
    bgColor: 'bg-rose-900/30',
    minWarSoul: 100_000,
    maxWarSoul: 250_000,
    description: 'Переписывающая историю (долгий путь до Великой ДВ: ~150k очков в этом тиру)',
    bonus: { successBonus: 20, goldBonus: 25, warSoulBonus: 20, critChance: 8 },
  },
  {
    tier: 10,
    name: 'Великая Душа Войны',
    icon: '☀️',
    color: 'text-amber-300',
    bgColor: 'bg-amber-600/40',
    minWarSoul: 250_000,
    maxWarSoul: Infinity,
    description: 'Абсолютное совершенство',
    bonus: { successBonus: 25, goldBonus: 30, warSoulBonus: 25, critChance: 10 },
  },
]

/**
 * Получить информацию о тире по количеству душ
 */
export function getWarSoulTier(warSoul: number, maxWarSoul: number = Infinity): WarSoulTierInfo {
  const effectiveWarSoul = Math.min(warSoul, maxWarSoul)

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
export function getWarSoulTierName(warSoul: number, maxWarSoul: number = Infinity): string {
  return getWarSoulTier(warSoul, maxWarSoul).name
}

/**
 * Получить иконку тира
 */
export function getWarSoulTierIcon(warSoul: number, maxWarSoul: number = Infinity): string {
  return getWarSoulTier(warSoul, maxWarSoul).icon
}

/**
 * Получить цвет тира
 */
export function getWarSoulTierColor(warSoul: number, maxWarSoul: number = Infinity): string {
  return getWarSoulTier(warSoul, maxWarSoul).color
}

/**
 * Получить фоновый цвет тира
 */
export function getWarSoulTierBgColor(warSoul: number, maxWarSoul: number = Infinity): string {
  return getWarSoulTier(warSoul, maxWarSoul).bgColor
}

/**
 * Получить бонусы тира
 */
export function getWarSoulTierBonus(warSoul: number, maxWarSoul: number = Infinity): WarSoulBonus {
  return getWarSoulTier(warSoul, maxWarSoul).bonus
}

/**
 * Получить прогресс к следующему тиру (0-100%)
 */
export function getProgressToNextTier(warSoul: number, maxWarSoul: number = Infinity): number {
  const effectiveWarSoul = Math.min(warSoul, maxWarSoul)
  const currentTier = getWarSoulTier(effectiveWarSoul, maxWarSoul)

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
export function getNextTierInfo(warSoul: number, maxWarSoul: number = Infinity): WarSoulTierInfo | null {
  const currentTier = getWarSoulTier(warSoul, maxWarSoul)
  const nextTierIndex = currentTier.tier + 1

  if (nextTierIndex >= WAR_SOUL_TIERS.length) {
    return null
  }

  return WAR_SOUL_TIERS[nextTierIndex]
}

/**
 * Верхняя граница шкалы души в UI: порог входа в следующий тир.
 * На максимальном тире — ёмкость пула на оружии (`maxWarSoul`), не табличный порог тира.
 */
export function resolveWarSoulProgressBarMax(warSoul: number, weaponPoolMax: number): number {
  const next = getNextTierInfo(warSoul, weaponPoolMax)
  if (next) {
    return Math.max(next.minWarSoul, 1)
  }
  if (!Number.isFinite(weaponPoolMax) || weaponPoolMax > 1e15) {
    return Math.max(warSoul, 1)
  }
  return Math.max(weaponPoolMax, 1)
}

/**
 * Проверить, достигнут ли максимальный тир
 */
export function isMaxTierReached(warSoul: number, maxWarSoul: number = Infinity): boolean {
  const tier = getWarSoulTier(warSoul, maxWarSoul)
  return tier.tier >= 10
}
