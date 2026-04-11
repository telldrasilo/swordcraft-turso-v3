/**
 * Черновик модели «операция внутри техники обработки» (фаза 0.3 roadmap, цель §3.2–§5.3).
 * Рантайм горна и process-generator пока опираются на refiningRecipeId + craftStageInsertions.
 */

/** Атомарный шаг цепочки обработки (плавка, проковка, …). */
export interface ProcessingOperation {
  id: string
  order: number
  /**
   * Фаза **3.3**: при отсутствии `refiningRecipeId` на технике — единственный такой id среди операций
   * или вывод по `stashInputsPerBatch` / `stashOutputMaterialId` в `refining-recipes`.
   */
  refiningRecipeId?: string
  /** Расход каталожных материалов за шаг (когда источник правды переедет из refining-recipes). */
  inputMaterialIds?: Record<string, number>
  outputMaterialIds?: Record<string, number>
  durationSeconds?: number
  /** Временная привязка к библиотеке этапов крафта до полной динамики таймлайна. */
  stageTypeHint?: string
}
