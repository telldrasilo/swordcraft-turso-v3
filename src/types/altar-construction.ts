/**
 * Строительство алтаря зачарований (фазы I–V).
 * @see docs/Quests/ALTAR_REWORK/SPECIFICATION.md §1.2
 */

export type AltarPhase = 1 | 2 | 3 | 4 | 5

/** Подпись строки требования: ключ совпадает с id в `requiredMaterials` (что списывают со склада). */
export interface AltarRequiredMaterialDisplayHint {
  /** Каталожный id для названия целевого продукта (например слиток). */
  labelMaterialId: string
  /** Сколько единиц продукта подразумевается (плавка и т.п.). */
  producedQuantity: number
}

export interface AltarStage {
  id: string
  name: string
  durationSec: number
  techniqueId?: string
  description: string
}

export interface AltarPhaseConfig {
  phase: AltarPhase
  /** Заголовок для дорожной карты и панели фазы (локализованная строка). */
  roadmapTitle: string
  /** Краткое описание для тултипа и панели фазы. */
  roadmapDescription: string
  requiredMaterials: Record<string, number>
  /**
   * Подпись в UI отличается от фактического id списания (например показываем «8 слитков»,
   * а `requiredMaterials` содержит `iron_ore: 24`).
   */
  requiredMaterialDisplayHints?: Partial<Record<string, AltarRequiredMaterialDisplayHint>>
  requiredTechniques: string[]
  /** Техники обработки материалов (горн); опционально по фазам. */
  requiredMaterialProcessingTechniqueIds?: string[]
  stages: AltarStage[]
  totalDurationSec: number
}

/** Прогресс строительства в store (кумулятивно с флагами квеста на верхнем уровне store). */
export interface AltarConstructionState {
  /** Дублирует `altarUnlockedByForgottenForgeQuest`; синхронизируется при merge. */
  altarUnlocked: boolean
  /** Дублирует `altarBuiltInForge`; синхронизируется при merge. */
  altarBuilt: boolean
  completedPhases: AltarPhase[]
  activePhase: AltarPhase | null
  activePhaseStartTime: number
  activePhaseStageIndex: number
  activePhaseStageStartTime: number
  activePhaseStages: AltarStage[]
}

export const initialAltarConstructionState: AltarConstructionState = {
  altarUnlocked: false,
  altarBuilt: false,
  completedPhases: [],
  activePhase: null,
  activePhaseStartTime: 0,
  activePhaseStageIndex: 0,
  activePhaseStageStartTime: 0,
  activePhaseStages: [],
}
