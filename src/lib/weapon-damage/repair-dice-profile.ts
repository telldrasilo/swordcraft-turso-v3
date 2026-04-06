/**
 * Ось броска кубика ремонта (G1): пять уровней «тяжести» исходов.
 * Данные тегов и техник ссылаются на id техник, не на legacy-типах из `repair-system`.
 * Таблицы риска в `repair-system` подключаются в `repair-utils` через `repairDiceProfileToRepairType`.
 */

/** Совпадает по литералам с `RepairType` в repair-system, но семантически — только ось броска. */
export type RepairDiceProfile =
  | 'quick'
  | 'standard'
  | 'quality'
  | 'restoration'
  | 'enhancement'

export const ALL_REPAIR_DICE_PROFILES: readonly RepairDiceProfile[] = [
  'quick',
  'standard',
  'quality',
  'restoration',
  'enhancement',
] as const

/** Порядок «тяжести» для подбора ближайшего допустимого профиля при G1 */
export const REPAIR_DICE_PROFILE_ORDER: readonly RepairDiceProfile[] = ALL_REPAIR_DICE_PROFILES
