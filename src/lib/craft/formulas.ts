/**
 * Чистые формулы крафта v2 (без обращения к данным рецептов).
 */

import { CRAFT_PERCENT_SCALE } from './constants'

/** Умножить значение на бонус в «процентах» (например 15 → +15%). */
export function applyPercentMultiplier(value: number, bonusPercent: number): number {
  return value * (1 + bonusPercent / CRAFT_PERCENT_SCALE)
}

/**
 * Вклад материала: base × (effect%/100) × (quantity/divisor).
 * Для attackBonus/durabilityBonus с quantity/2.
 */
export function contributionFromMaterialPercent(
  base: number,
  effectPercent: number,
  quantity: number,
  quantityDivisor: number
): number {
  return base * (effectPercent / CRAFT_PERCENT_SCALE) * (quantity / quantityDivisor)
}
