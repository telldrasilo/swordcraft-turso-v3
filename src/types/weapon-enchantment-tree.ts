/**
 * Черновые типы модуля зачарований (канон: docs/systems/ENCHANTMENT_AWAKENING_CONCEPT.md).
 * Поля на экземпляре оружия опциональны до внедрения геймплея.
 */

/** Уровень пробуждения души на экземпляре (0 = древа нет). */
export type WeaponAwakeningLevel = 0 | 1 | 2 | 3

/**
 * Режим после второго пробуждения: продолжить первую ветвь или открыть вторую.
 * См. часть V концепта.
 */
export type EnchantmentSecondBranchMode = 'continue_first' | 'new_branch_B'

/**
 * Режим после третьего пробуждения: углубление одной из двух ветвей или третья ветвь.
 */
export type EnchantmentThirdBranchMode =
  | 'continue_first'
  | 'continue_second'
  | 'new_branch_C'

/** Один зафиксированный шаг древа перков на оружии. */
export interface EnchantmentTreeStep {
  branchId: string
  globalStepIndex: number
  perkId: string
  /** Уровень прокачки выбранного перка на этом шаге (минимум 1). */
  perkRank: number
}
