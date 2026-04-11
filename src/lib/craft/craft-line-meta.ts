/**
 * Эффективные фаза и порядок техник на Крафтовой линии (ENC P5a, §12.3).
 */

import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'
import type { Technique } from '@/types/craft-v2'
import type { CraftLinePhase } from '@/types/craft-line'
import { craftLinePhaseRank } from '@/types/craft-line'

export interface EffectiveCraftLineMeta {
  phase: CraftLinePhase
  order: number
}

export function getEffectiveCraftLineMetaForProcessing(
  p: Pick<MaterialProcessingTechnique, 'craftLinePhase' | 'craftLineOrder'> | undefined
): EffectiveCraftLineMeta {
  return {
    phase: p?.craftLinePhase ?? 'material_preparation',
    order: p?.craftLineOrder ?? 0,
  }
}

export function getEffectiveCraftLineMetaForCombatTechnique(t: Technique): EffectiveCraftLineMeta {
  return {
    phase: t.craftLinePhase ?? 'craft_finishing',
    order: t.craftLineOrder ?? 0,
  }
}

/** Сортировка блоков: фаза → порядок → стабильный id. */
export function compareCraftLineBlockMeta(
  a: EffectiveCraftLineMeta & { sortId: string },
  b: EffectiveCraftLineMeta & { sortId: string }
): number {
  const pr = craftLinePhaseRank(a.phase) - craftLinePhaseRank(b.phase)
  if (pr !== 0) return pr
  if (a.order !== b.order) return a.order - b.order
  return a.sortId.localeCompare(b.sortId, 'ru')
}
