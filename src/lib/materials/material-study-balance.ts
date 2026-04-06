/**
 * Баланс изучения материалов в энциклопедии.
 * Модификаторы вынесены в одну точку — позже сюда можно подставить ветку талантов без правок slice.
 */

import {
  MATERIAL_STUDY_COMPLETION_FAILURE_CHANCE,
  MATERIAL_STUDY_FAILURE_PITY_GAIN,
  MATERIAL_STUDY_MAX_WORKERS_ON_STUDY,
  MATERIAL_STUDY_WORKER_SPEED_PER_ASSIGNED,
} from '@/lib/store-utils/constants'

export interface MaterialStudyBalanceModifiers {
  /** Множитель к baseDurationMs техники (таланты, баффы). */
  durationMultiplier: number
  /** Нижняя граница случайного прироста экспертизы, % (целое). */
  expertiseGainMin: number
  /** Верхняя граница случайного прироста экспертизы, % (целое). */
  expertiseGainMax: number
}

/**
 * Источник правды для модификаторов. Заглушка: вернуть ветку талантов, когда модуль будет готов.
 */
export function getMaterialStudyBalanceModifiers(): MaterialStudyBalanceModifiers {
  return {
    durationMultiplier: 1,
    expertiseGainMin: 2,
    expertiseGainMax: 6,
  }
}

export function resolveStudyDurationMs(techniqueBaseDurationMs: number): number {
  const m = getMaterialStudyBalanceModifiers()
  return Math.max(0, Math.round(techniqueBaseDurationMs * m.durationMultiplier))
}

/**
 * Случайный прирост экспертизы в процентах (целые в диапазоне [min, max]).
 */
export function rollMaterialStudyExpertiseGain(random: () => number = Math.random): number {
  const mod = getMaterialStudyBalanceModifiers()
  const lo = Math.round(Math.min(mod.expertiseGainMin, mod.expertiseGainMax))
  const hi = Math.round(Math.max(mod.expertiseGainMin, mod.expertiseGainMax))
  const span = hi - lo + 1
  return lo + Math.floor(random() * span)
}

export function getMaterialStudyExpertiseGainRangeLabel(): string {
  const mod = getMaterialStudyBalanceModifiers()
  const lo = Math.round(Math.min(mod.expertiseGainMin, mod.expertiseGainMax))
  const hi = Math.round(Math.max(mod.expertiseGainMin, mod.expertiseGainMax))
  return `${lo}–${hi}%`
}

export function formatStudyDurationMinutes(durationMs: number): string {
  const m = Math.max(1, Math.round(durationMs / 60_000))
  return `${m} мин`
}

export function computeMaterialStudyWorkerSpeedFactor(workerCount: number): number {
  const n = Math.max(
    0,
    Math.min(MATERIAL_STUDY_MAX_WORKERS_ON_STUDY, Math.floor(workerCount))
  )
  return 1 + n * MATERIAL_STUDY_WORKER_SPEED_PER_ASSIGNED
}

/** Длительность после применения ускорения рабочими (делитель к базовой длительности). */
export function resolveStudyDurationWithWorkers(
  techniqueBaseDurationMs: number,
  workerCount: number
): number {
  const base = resolveStudyDurationMs(techniqueBaseDurationMs)
  const factor = computeMaterialStudyWorkerSpeedFactor(workerCount)
  return Math.max(0, Math.round(base / factor))
}

export type MaterialStudyCompletionKind = 'success' | 'failure'

export function rollMaterialStudyCompletionOutcome(
  random: () => number = Math.random
): { kind: MaterialStudyCompletionKind; gain: number } {
  if (random() < MATERIAL_STUDY_COMPLETION_FAILURE_CHANCE) {
    return { kind: 'failure', gain: MATERIAL_STUDY_FAILURE_PITY_GAIN }
  }
  return { kind: 'success', gain: rollMaterialStudyExpertiseGain(random) }
}
