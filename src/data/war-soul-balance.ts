/**
 * Константы баланса Soul Potential (множитель награды души войны за миссию).
 * @see docs/systems/WAR_SOUL_CONCEPT_AND_FORECAST.md
 */

/** Пул души на оружии не ограничивается — используется как числовой «бесконечный» потолок для кода. */
export const WAR_SOUL_POOL_UNCAPPED = Number.MAX_SAFE_INTEGER

export function isWarSoulPoolUncapped(maxWarSoul: number | undefined): boolean {
  return maxWarSoul !== undefined && maxWarSoul > 1e15
}

export const SOUL_POTENTIAL_BASE = 1.0
export const SOUL_POTENTIAL_MIN = 0.85
export const SOUL_POTENTIAL_MAX = 3.0

/** Нормализация weaponEffects.soulCapacity (каталог металлов/дерева/камня и т.д.). */
export const SOUL_EFFECT_STAT_MIN = 10
export const SOUL_EFFECT_STAT_MAX = 200

export const SOUL_MATERIAL_SCORE_SCALE = 0.95

/** Веса частей при расчёте materialScore (сумма = 1). */
export const SOUL_PART_WEIGHT: Record<string, number> = {
  blade: 0.4,
  guard: 0.25,
  grip: 0.2,
  pommel: 0.15,
}

/** Суммарный вклад синергий до clamp. */
export const SOUL_SYNERGY_CAP = 0.6

/** Множитель для technique.effects.conductivityBonus (проценты техники → прибавка к raw). */
export const SOUL_TECHNIQUE_CONDUCTIVITY_K = 0.0025

export const SOUL_TECHNIQUE_SCORE_MIN = -0.1
export const SOUL_TECHNIQUE_SCORE_MAX = 0.3
