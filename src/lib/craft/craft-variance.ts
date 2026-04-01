/**
 * Асимметричный разброс характеристик крафта от средней экспертизы материалов.
 */

import type { MaterialAssignment } from '@/types/craft-v2'
import type { StatRange } from '@/types/forecast'
import {
  CRAFT_VARIANCE_DOWN_MAX,
  CRAFT_VARIANCE_DOWN_MIN,
  CRAFT_VARIANCE_UP_MAX,
  CRAFT_VARIANCE_UP_MIN,
  CRAFT_VARIANCE_WEIGHT_DOWN_SCALE,
  CRAFT_VARIANCE_WEIGHT_UP_SCALE,
} from './constants'

export function calculateAverageExpertise(
  materials: MaterialAssignment,
  materialExpertise: Record<string, number>
): number {
  const values = Object.values(materials).map((m) => materialExpertise[m.materialId] ?? 0)
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** Доля снижения от базы: убывает с ростом экспертизы (0–100). */
export function craftVarianceDownFactor(avgExpertise: number): number {
  const e = Math.max(0, Math.min(100, avgExpertise))
  return CRAFT_VARIANCE_DOWN_MIN + (CRAFT_VARIANCE_DOWN_MAX - CRAFT_VARIANCE_DOWN_MIN) * (1 - e / 100)
}

/** Доля повышения над базой: растёт с экспертизой (0–100). */
export function craftVarianceUpFactor(avgExpertise: number): number {
  const e = Math.max(0, Math.min(100, avgExpertise))
  return CRAFT_VARIANCE_UP_MIN + (CRAFT_VARIANCE_UP_MAX - CRAFT_VARIANCE_UP_MIN) * (e / 100)
}

function bandFromBase(
  base: number,
  down: number,
  up: number
): Pick<StatRange, 'min' | 'max' | 'variance'> {
  const min = Math.max(0, Math.round(base * (1 - down)))
  const max = Math.max(min, Math.round(base * (1 + up)))
  const variance = (down + up) / 2
  return { min, max, variance }
}

/** Диапазон для атаки / прочности / души и т.п. */
export function statRangeFromBase(
  base: number,
  avgExpertise: number
): StatRange {
  const down = craftVarianceDownFactor(avgExpertise)
  const up = craftVarianceUpFactor(avgExpertise)
  const { min, max, variance } = bandFromBase(base, down, up)
  return { min, max, current: base, variance }
}

/** Вес: меньший относительный разброс. */
export function weightStatRangeFromBase(
  base: number,
  avgExpertise: number
): StatRange {
  const down = craftVarianceDownFactor(avgExpertise) * CRAFT_VARIANCE_WEIGHT_DOWN_SCALE
  const up = craftVarianceUpFactor(avgExpertise) * CRAFT_VARIANCE_WEIGHT_UP_SCALE
  const { min, max, variance } = bandFromBase(base, down, up)
  return { min, max, current: base, variance }
}
