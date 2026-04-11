/**
 * Крафтовая линия (ENC roadmap §12): фазы порядка техник и сегменты UI.
 */

import type { EncyclopediaTechniqueRef } from '@/types/encyclopedia-techniques'

/** Фаза упорядочивания блоков техник на линии (§12.3). */
export type CraftLinePhase = 'material_preparation' | 'recipe_forming' | 'craft_finishing'

export const CRAFT_LINE_PHASE_ORDER: readonly CraftLinePhase[] = [
  'material_preparation',
  'recipe_forming',
  'craft_finishing',
]

const PHASE_RANK: Record<CraftLinePhase, number> = {
  material_preparation: 0,
  recipe_forming: 1,
  craft_finishing: 2,
}

export function craftLinePhaseRank(phase: CraftLinePhase): number {
  return PHASE_RANK[phase]
}

export function isCraftLinePhase(value: unknown): value is CraftLinePhase {
  return (
    value === 'material_preparation' ||
    value === 'recipe_forming' ||
    value === 'craft_finishing'
  )
}

export type CraftLineColorToken =
  | 'craftLine.material_preparation'
  | 'craftLine.recipe_forming'
  | 'craftLine.craft_finishing'

/** Сегмент из микрозадач техники (обработка или приём). */
export interface CraftLineTechniqueSegment {
  source: 'technique'
  techniqueRef: EncyclopediaTechniqueRef
  /** Индекс микрозадачи внутри техники; null если один синтетический шаг без индекса */
  microTaskIndex: number | null
  durationShare: number
  colorToken: CraftLineColorToken
  label: string
}

/** Сегмент из хребта рецепта (`RecipeCraftLineMicroStep`). */
export interface CraftLineBackboneSegment {
  source: 'recipe_backbone'
  recipeId: string
  stageIndex: number
  stableId: string
  durationShare: number
  colorToken: CraftLineColorToken
  label: string
}

/**
 * Плоский сегмент полосы: микрозадача техники или хребта.
 * Сумма `durationShare` по всем сегментам линии = 1 после нормализации.
 */
export type CraftLineSegment = CraftLineTechniqueSegment | CraftLineBackboneSegment

export function isCraftLineTechniqueSegment(s: CraftLineSegment): s is CraftLineTechniqueSegment {
  return s.source === 'technique'
}

export function isCraftLineBackboneSegment(s: CraftLineSegment): s is CraftLineBackboneSegment {
  return s.source === 'recipe_backbone'
}

/** Стабильный ключ сегмента для React (полоса, списки). */
export function craftLineSegmentReactKey(seg: CraftLineSegment, listIndex: number): string {
  if (seg.source === 'technique') {
    return `t:${seg.techniqueRef.kind}:${seg.techniqueRef.id}:${String(seg.microTaskIndex)}:${listIndex}`
  }
  return `b:${seg.recipeId}:${seg.stageIndex}:${seg.stableId}:${listIndex}`
}
