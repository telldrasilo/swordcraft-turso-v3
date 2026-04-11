/**
 * Чистая логика фаз строительства алтаря v2.
 * @see docs/Quests/ALTAR_REWORK/SPECIFICATION.md §7, ALTAR_BUILDING_V2 §4
 */

import { getAltarPhaseConfig } from '@/data/altar/altar-phases-config'
import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import type { AltarConstructionState, AltarPhase } from '@/types/altar-construction'

/** Базовые боевые приёмы крафта, как в CraftContainerV2 по умолчанию. */
export const ALTAR_BASELINE_CRAFT_TECHNIQUE_IDS = ['basic_forging', 'balanced_design'] as const

export function getEffectiveUnlockedCraftTechniques(unlockedCraftTechniqueIds: string[]): Set<string> {
  return new Set<string>([...ALTAR_BASELINE_CRAFT_TECHNIQUE_IDS, ...unlockedCraftTechniqueIds])
}

export function isMaterialProcessingTechniqueEffectiveUnlocked(
  id: string,
  unlockedMaterialProcessingTechniqueIds: string[]
): boolean {
  const t = getMaterialProcessingTechniqueById(id)
  if (!t) return false
  if (t.unlockedByDefault) return true
  return unlockedMaterialProcessingTechniqueIds.includes(id)
}

export interface CanStartAltarPhaseInput {
  phase: AltarPhase
  materialStash: Record<string, number>
  unlockedCraftTechniqueIds: string[]
  unlockedMaterialProcessingTechniqueIds: string[]
  construction: AltarConstructionState
}

export function canStartAltarPhase(input: CanStartAltarPhaseInput): boolean {
  const {
    phase,
    materialStash,
    unlockedCraftTechniqueIds,
    unlockedMaterialProcessingTechniqueIds,
    construction,
  } = input
  if (construction.activePhase != null) return false
  if (construction.completedPhases.includes(phase)) return false

  const prev = (phase - 1) as AltarPhase
  if (phase > 1 && !construction.completedPhases.includes(prev)) return false

  const cfg = getAltarPhaseConfig(phase)
  const tech = getEffectiveUnlockedCraftTechniques(unlockedCraftTechniqueIds)
  for (const tid of cfg.requiredTechniques) {
    if (!tech.has(tid)) return false
  }
  for (const pid of cfg.requiredMaterialProcessingTechniqueIds ?? []) {
    if (!isMaterialProcessingTechniqueEffectiveUnlocked(pid, unlockedMaterialProcessingTechniqueIds)) {
      return false
    }
  }
  for (const [mid, need] of Object.entries(cfg.requiredMaterials)) {
    if ((materialStash[mid] ?? 0) < need) return false
  }
  return true
}

/**
 * Списание материалов старта фазы. Фаза III: id из questItemIds не расходуются (только проверка в canStart).
 */
export function consumeMaterialsForAltarPhase(
  phase: AltarPhase,
  materialStash: Record<string, number>,
  questItemMaterialIds: readonly string[]
): Record<string, number> | null {
  const cfg = getAltarPhaseConfig(phase)
  const next: Record<string, number> = { ...materialStash }
  const skip = new Set(questItemMaterialIds)

  for (const [mid, need] of Object.entries(cfg.requiredMaterials)) {
    const have = next[mid] ?? 0
    if (have < need) return null
    if (phase === 3 && skip.has(mid)) continue
    next[mid] = have - need
  }
  return next
}

export type AltarConstructionTickResult =
  | { kind: 'noop' }
  | {
      kind: 'update'
      patch: Pick<AltarConstructionState, 'activePhaseStageIndex' | 'activePhaseStageStartTime'>
    }
  | { kind: 'phaseComplete'; phase: AltarPhase; constructionAfter: AltarConstructionState }

/** Догон таймера по wall-clock: несколько микроэтапов подряд после reload. */
export function computeAltarConstructionTick(
  ac: AltarConstructionState,
  nowMs: number
): AltarConstructionTickResult {
  if (ac.activePhase == null || ac.activePhaseStages.length === 0) return { kind: 'noop' }

  let t = ac.activePhaseStageStartTime
  let idx = ac.activePhaseStageIndex
  const stages = ac.activePhaseStages

  if (nowMs < t) return { kind: 'noop' }

  while (idx < stages.length) {
    const durMs = Math.max(0, stages[idx].durationSec) * 1000
    const end = t + durMs
    if (nowMs < end) {
      if (idx !== ac.activePhaseStageIndex || t !== ac.activePhaseStageStartTime) {
        return {
          kind: 'update',
          patch: { activePhaseStageIndex: idx, activePhaseStageStartTime: t },
        }
      }
      return { kind: 'noop' }
    }
    t = end
    idx += 1
  }

  const phase = ac.activePhase
  const donePhases = ac.completedPhases.includes(phase)
    ? [...ac.completedPhases]
    : [...ac.completedPhases, phase]

  const constructionAfter: AltarConstructionState = {
    ...ac,
    completedPhases: donePhases,
    activePhase: null,
    activePhaseStartTime: 0,
    activePhaseStageIndex: 0,
    activePhaseStageStartTime: 0,
    activePhaseStages: [],
  }

  return { kind: 'phaseComplete', phase, constructionAfter }
}

/**
 * Состояние после мгновенного завершения активной фазы (без событий).
 * Для отладочных кнопок и обхода таймера.
 */
export function altarConstructionStateAfterPhaseComplete(
  ac: AltarConstructionState
): AltarConstructionState | null {
  if (ac.activePhase == null) return null
  const phase = ac.activePhase
  const donePhases = ac.completedPhases.includes(phase)
    ? [...ac.completedPhases]
    : [...ac.completedPhases, phase]
  return {
    ...ac,
    completedPhases: donePhases,
    activePhase: null,
    activePhaseStartTime: 0,
    activePhaseStageIndex: 0,
    activePhaseStageStartTime: 0,
    activePhaseStages: [],
  }
}
