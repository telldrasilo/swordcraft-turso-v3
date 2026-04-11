/**
 * Обратный индекс: `materialId` → id техник обработки, для которых этот материал — **выход**
 * (I/O `processingOperations` + выход связанного рецепта `refining-recipes` через `getEffectiveRefiningRecipeId`).
 * @see docs/MATERIALS_SINGLE_SOURCE_ROADMAP.md §10
 */

import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'
import { allMaterialProcessingTechniques } from '@/data/material-processing-techniques'
import { refiningRecipes } from '@/data/refining-recipes'
import { getEffectiveRefiningRecipeId } from '@/lib/craft/processing-technique-refining-bridge'
import { getGrantTargetMaterialId } from '@/lib/craft/inventory-check'
import type { ResourceKey } from '@/store/slices/resources-slice'

const REFINING_BY_ID = new Map(refiningRecipes.map((r) => [r.id, r]))

/** Каналожные id продукта техники: ключи `outputMaterialIds` операций + выход рецепта горна (если есть). */
export function getCatalogOutputMaterialIdsForProcessingTechnique(
  tech: MaterialProcessingTechnique
): string[] {
  const out = new Set<string>()
  for (const op of tech.processingOperations ?? []) {
    for (const mid of Object.keys(op.outputMaterialIds ?? {})) {
      if (mid.length > 0) out.add(mid)
    }
  }
  const rid = getEffectiveRefiningRecipeId(tech)
  const recipe = REFINING_BY_ID.get(rid)
  if (recipe) {
    const mid =
      recipe.stashOutputMaterialId ??
      getGrantTargetMaterialId(recipe.output.resource as ResourceKey)
    if (mid) out.add(mid)
  }
  return [...out].sort()
}

function buildMaterialIdToProcessingTechniqueIds(): Map<string, readonly string[]> {
  const acc = new Map<string, Set<string>>()
  for (const tech of allMaterialProcessingTechniques) {
    for (const mid of getCatalogOutputMaterialIdsForProcessingTechnique(tech)) {
      let set = acc.get(mid)
      if (!set) {
        set = new Set()
        acc.set(mid, set)
      }
      set.add(tech.id)
    }
  }
  const result = new Map<string, readonly string[]>()
  for (const [mid, ids] of acc) {
    result.set(mid, Object.freeze([...ids].sort()))
  }
  return result
}

let cachedMap: ReadonlyMap<string, readonly string[]> | null = null

/** Индекс materialId → отсортированные `technique.id` (детерминированно). */
export function getMaterialIdToProcessingTechniqueIds(): ReadonlyMap<string, readonly string[]> {
  if (!cachedMap) {
    cachedMap = Object.freeze(buildMaterialIdToProcessingTechniqueIds())
  }
  return cachedMap
}

export function getProcessingTechniqueIdsProducingMaterial(materialId: string): readonly string[] {
  return getMaterialIdToProcessingTechniqueIds().get(materialId) ?? []
}

/** Каталожные id, которые когда-либо фигурируют как выход техники (для контракта §8). */
export function collectMaterialProcessingOutputIndexMaterialIds(): string[] {
  return [...getMaterialIdToProcessingTechniqueIds().keys()].sort()
}
