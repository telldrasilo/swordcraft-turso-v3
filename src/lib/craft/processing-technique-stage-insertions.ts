/**
 * Склейка этапов обработки для таймлайна крафта (фаза 4.x).
 * Вынесено из `process-generator`, чтобы UI мог импортировать без циклов с `@/data/materials`.
 */

import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'

export type ProcessingTechniqueStageInsertionSpec = {
  stageType: string
  afterStageType?: string
  beforeStageType?: string
  durationSeconds?: number
}

/** `craftStageInsertions` ∪ `processingOperations.stageTypeHint` (без дублей по `stageType` из craft). */
export function collectProcessingTechniqueStageInsertions(
  tech: MaterialProcessingTechnique
): ProcessingTechniqueStageInsertionSpec[] {
  const craft = tech.craftStageInsertions ?? []
  const sortedOps = [...(tech.processingOperations ?? [])].sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id)
  )

  const defaultAfter =
    craft.find((c) => c.afterStageType != null)?.afterStageType ?? 'prep_heating'
  const defaultBefore = craft.find((c) => c.beforeStageType != null)?.beforeStageType

  const fromCraftTypes = new Set(craft.map((c) => c.stageType))
  const out: ProcessingTechniqueStageInsertionSpec[] = []

  for (const c of craft) {
    const op = sortedOps.find((o) => o.stageTypeHint === c.stageType)
    const dur =
      c.durationSeconds != null && c.durationSeconds > 0
        ? c.durationSeconds
        : op?.durationSeconds != null && op.durationSeconds > 0
          ? op.durationSeconds
          : undefined
    out.push({
      stageType: c.stageType,
      afterStageType: c.afterStageType,
      beforeStageType: c.beforeStageType,
      durationSeconds: dur,
    })
  }

  for (const op of sortedOps) {
    const st = op.stageTypeHint
    if (!st || fromCraftTypes.has(st)) continue
    out.push({
      stageType: st,
      afterStageType: defaultAfter,
      beforeStageType: defaultBefore,
      durationSeconds: op.durationSeconds != null && op.durationSeconds > 0 ? op.durationSeconds : undefined,
    })
  }

  return out
}

/** UI: те же этапы, что попадут в `generateCraftStages`. */
export function getProcessingTechniqueTimelinePreview(
  tech: MaterialProcessingTechnique
): { stageType: string; durationSeconds?: number }[] {
  return collectProcessingTechniqueStageInsertions(tech).map(({ stageType, durationSeconds }) => ({
    stageType,
    durationSeconds,
  }))
}
