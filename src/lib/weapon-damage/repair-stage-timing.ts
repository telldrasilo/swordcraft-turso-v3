/**
 * Расчёт текущего этапа и прогресса по прошедшему времени (для UI починки по техникам).
 */

import type { WeaponRepairPlan } from '@/types/weapon-repair'

/** Не ускорять слишком короткие этапы ниже этого порога (мс), чтобы полоска была читаемой */
export const WEAPON_REPAIR_STAGE_MIN_DURATION_MS = 500

function stageDurationMs(baseDurationSec: number): number {
  return Math.max(WEAPON_REPAIR_STAGE_MIN_DURATION_MS, baseDurationSec * 1000)
}

export interface RepairStageProgressView {
  /** Индекс текущего этапа (0-based) */
  stageIndex: number
  /** Прогресс внутри этапа 0–100 */
  progressInStage: number
  /** Все этапы завершены по таймеру */
  allStagesComplete: boolean
}

/**
 * По суммарному времени с начала ремонта возвращает индекс этапа и прогресс.
 * После последнего этапа: allStagesComplete=true, stageIndex=последний, progressInStage=100.
 */
export function getRepairStageProgressFromElapsed(
  plan: WeaponRepairPlan,
  elapsedMs: number
): RepairStageProgressView {
  const stages = plan.stages
  if (stages.length === 0) {
    return { stageIndex: 0, progressInStage: 100, allStagesComplete: true }
  }

  let acc = 0
  for (let i = 0; i < stages.length; i++) {
    const dur = stageDurationMs(stages[i].baseDurationSec)
    const end = acc + dur
    if (elapsedMs < end) {
      const inStage = elapsedMs - acc
      return {
        stageIndex: i,
        progressInStage: Math.min(100, (inStage / dur) * 100),
        allStagesComplete: false,
      }
    }
    acc = end
  }

  return {
    stageIndex: stages.length - 1,
    progressInStage: 100,
    allStagesComplete: true,
  }
}

/** Суммарная длительность плана в мс */
export function getWeaponRepairPlanTotalDurationMs(plan: WeaponRepairPlan): number {
  return plan.stages.reduce((sum, s) => sum + stageDurationMs(s.baseDurationSec), 0)
}
