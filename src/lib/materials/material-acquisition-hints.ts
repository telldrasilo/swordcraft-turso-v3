/**
 * Подсказки «как получить» для ENC (roadmap 5.1): техники обработки — через
 * [`material-processing-output-index`](./material-processing-output-index.ts); рецепты горна — отдельно.
 */

import { getMaterialProcessingTechniqueById } from '@/data/material-processing-techniques'
import { refiningRecipes } from '@/data/refining-recipes'
import { getGrantTargetMaterialId } from '@/lib/craft/inventory-check'
import { getProcessingTechniqueIdsProducingMaterial } from '@/lib/materials/material-processing-output-index'
import type { ResourceKey } from '@/store/slices/resources-slice'

/** Строки для UI: порядок стабилен (техники обработки по id техники, затем рецепты горна). */
export function getMaterialAcquisitionHintLines(materialId: string): string[] {
  const lines: string[] = []
  for (const tid of getProcessingTechniqueIdsProducingMaterial(materialId)) {
    const t = getMaterialProcessingTechniqueById(tid)
    if (t) lines.push(`Обработка: «${t.name}»`)
  }
  for (const r of refiningRecipes) {
    const out =
      r.stashOutputMaterialId ??
      getGrantTargetMaterialId(r.output.resource as ResourceKey)
    if (out !== materialId) continue
    lines.push(`Горн / переработка: «${r.name}»`)
  }
  return lines
}
