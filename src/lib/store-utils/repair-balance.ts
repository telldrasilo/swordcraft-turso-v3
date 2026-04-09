/**
 * Чистые формулы баланса ремонта (мощность клинка, золото авто-ремонта, наценка автоподбора).
 * Вынесено отдельно от repair-utils.ts, чтобы клиентский бандл не тянул тяжёлый граф (repair-system и т.д.)
 * и не ловил циклические зависимости Webpack.
 */

import type { CraftedWeaponV2 } from '@/types/craft-v2'
import {
  REPAIR_AUTO_PICK_ATTACK_REF_MAX,
  REPAIR_AUTO_PICK_ATTACK_REF_MIN,
  REPAIR_AUTO_PICK_MARKUP_MAX,
  REPAIR_AUTO_PICK_MARKUP_MIN,
  WEAPON_AUTO_REPAIR_GOLD_BASE,
  WEAPON_AUTO_REPAIR_GOLD_PER_ATTACK_POINT,
} from '@/lib/store-utils/constants'

function clamp01(x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  return x
}

/**
 * Мощность клинка для баланса ремонта (наценки, золото авто-ремонта).
 * v1 — атака; при расширении метрики менять здесь (T5 в техдолге).
 */
export function getWeaponRepairPowerScore(weapon: CraftedWeaponV2): number {
  const a = weapon.stats?.attack
  const n = typeof a === 'number' && Number.isFinite(a) ? a : 1
  return Math.max(1, n)
}

/** @deprecated Ранее золото за авто-ремонт; механика удалена — оставлено для совместимости импортов. */
export function getWeaponAutoRepairGoldCost(weapon: CraftedWeaponV2): number {
  const power = getWeaponRepairPowerScore(weapon)
  return WEAPON_AUTO_REPAIR_GOLD_BASE + Math.floor(power * WEAPON_AUTO_REPAIR_GOLD_PER_ATTACK_POINT)
}

/** Наценка на материалы плана в режиме «Кузнец подберёт техники» — растёт с мощностью (attack). */
export function getRepairAutoPickMaterialMarkup(weapon: CraftedWeaponV2): number {
  const power = getWeaponRepairPowerScore(weapon)
  const denom = REPAIR_AUTO_PICK_ATTACK_REF_MAX - REPAIR_AUTO_PICK_ATTACK_REF_MIN
  const t = denom <= 0 ? 0 : clamp01((power - REPAIR_AUTO_PICK_ATTACK_REF_MIN) / denom)
  const raw = REPAIR_AUTO_PICK_MARKUP_MIN + t * (REPAIR_AUTO_PICK_MARKUP_MAX - REPAIR_AUTO_PICK_MARKUP_MIN)
  return Number(raw.toFixed(4))
}
