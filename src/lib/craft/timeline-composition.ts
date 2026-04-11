/**
 * Фазы **4.2–4.3** roadmap: чистая композиция черновика таймлайна из операций обработки и processMods боевых техник.
 * Рантайм крафта по-прежнему в `process-generator.ts`; здесь — согласованные строительные блоки для тестов и будущего переноса.
 */

import type { CraftTimelinePlanDraft, CraftTimelineStageRef } from '@/types/craft/timeline-plan-contract'
import type { ProcessMods } from '@/types/craft-v2'
import type { ProcessingOperation } from '@/types/materials/processing-operations'

/** Упорядоченные refs из `processingOperations` техники обработки (по `order`, затем `id`). */
export function stageRefsFromProcessingOperations(
  techniqueId: string,
  operations: ProcessingOperation[] | undefined
): CraftTimelineStageRef[] {
  if (!operations?.length) return []
  return [...operations]
    .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id))
    .map((op) => ({
      stageType: op.stageTypeHint ?? `proc_op:${op.id}`,
      durationSeconds: op.durationSeconds,
      sourceTechniqueId: techniqueId,
      processingOperationId: op.id,
    }))
}

/** MVP 4.2: базовые этапы рецепта (только типы) + хвост из обработки. */
export function appendProcessingRefsToRecipeStageTypes(
  recipeStageTypes: readonly string[],
  processingRefs: CraftTimelineStageRef[]
): CraftTimelinePlanDraft {
  const base: CraftTimelineStageRef[] = recipeStageTypes.map((stageType) => ({ stageType }))
  return { stageRefs: [...base, ...processingRefs] }
}

/**
 * Фаза 4.3: те же правила, что `applyTechniqueMods` в `process-generator`, для произвольных записей с `stageType`.
 */
export function applyCombatProcessModsToStageEntries<T extends { stageType: string }>(
  entries: T[],
  processModsList: Array<ProcessMods | undefined>
): T[] {
  let result: T[] = [...entries]
  for (const processMods of processModsList) {
    if (!processMods) continue
    const { replaceStage, addStage } = processMods
    if (replaceStage) {
      result = result.map((e) => {
        const next = replaceStage[e.stageType]
        return next != null && next !== e.stageType ? ({ ...e, stageType: next } as T) : e
      })
    }
    if (addStage) {
      const insertIndex = addStage.after
        ? result.findIndex((s) => s.stageType === addStage.after) + 1
        : addStage.before
          ? result.findIndex((s) => s.stageType === addStage.before)
          : result.length
      if (insertIndex >= 0) {
        result.splice(insertIndex, 0, { stageType: addStage.stage } as T)
      }
    }
  }
  return result
}

/** Зеркалит ветку `applyTechniqueMods` в `process-generator` для упорядоченных `stageType` (фаза 4.3). */
export function applyCombatProcessModsToStageTypes(
  stageTypes: string[],
  processModsList: Array<ProcessMods | undefined>
): string[] {
  return applyCombatProcessModsToStageEntries(
    stageTypes.map((stageType) => ({ stageType })),
    processModsList
  ).map((e) => e.stageType)
}
