/**
 * Фаза **4.1** roadmap (`docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md` §7): контракт композиции этапов без полного UI таймлайна.
 */

export interface CraftTimelineStageRef {
  stageType: string
  durationSeconds?: number
  sourceTechniqueId?: string
  /** Связь с `MaterialProcessingTechnique.processingOperations[].id` (фаза 3+). */
  processingOperationId?: string
}

/** Результат чистой функции «план крафта → упорядоченные этапы» (MVP: типы + тест на сборку). */
export interface CraftTimelinePlanDraft {
  stageRefs: CraftTimelineStageRef[]
}
