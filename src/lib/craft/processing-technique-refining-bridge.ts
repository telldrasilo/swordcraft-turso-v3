import type { MaterialProcessingTechnique } from '@/data/material-processing-techniques'
import type { ProcessingOperation } from '@/types/materials/processing-operations'
import { refiningRecipes } from '@/data/refining-recipes'

/**
 * Фаза **3.3** roadmap: единая точка выбора id рецепта горна / `refining-recipes` для техники обработки.
 *
 * Приоритет:
 * 1. `refiningRecipeId` на технике (если задан непустой).
 * 2. Единственный непустой `refiningRecipeId` среди `processingOperations` (по порядку `order`).
 * 3. Ровно один рецепт с `stashInputsPerBatch` + `stashOutputMaterialId`, совпадающий с суммой I/O операций.
 */
export function getEffectiveRefiningRecipeId(tech: MaterialProcessingTechnique): string {
  const top = tech.refiningRecipeId?.trim()
  if (top) return top

  const ops = sortedOperations(tech.processingOperations)
  const fromOps = uniqueNonEmpty(
    ops.map((o) => o.refiningRecipeId?.trim()).filter((x): x is string => Boolean(x && x.length))
  )
  if (fromOps.length === 1) return fromOps[0]
  if (fromOps.length > 1) {
    throw new Error(
      `[getEffectiveRefiningRecipeId] technique ${tech.id}: conflicting refiningRecipeId on operations`
    )
  }

  const merged = mergeOperationMaterialMaps(ops)
  const inferred = inferRefiningRecipeIdFromStashIo(merged)
  if (inferred) return inferred

  throw new Error(
    `[getEffectiveRefiningRecipeId] technique ${tech.id}: cannot resolve refining recipe id (set refiningRecipeId or operations I/O)`
  )
}

function sortedOperations(ops: ProcessingOperation[] | undefined): ProcessingOperation[] {
  if (!ops?.length) return []
  return [...ops].sort((a, b) => a.order - b.order)
}

function uniqueNonEmpty(ids: string[]): string[] {
  return [...new Set(ids)]
}

function mergeOperationMaterialMaps(ops: ProcessingOperation[]): {
  inputs: Record<string, number>
  outputs: Record<string, number>
} {
  const inputs: Record<string, number> = {}
  const outputs: Record<string, number> = {}
  for (const op of ops) {
    addQuantities(inputs, op.inputMaterialIds)
    addQuantities(outputs, op.outputMaterialIds)
  }
  return { inputs, outputs }
}

function addQuantities(target: Record<string, number>, delta: Record<string, number> | undefined): void {
  if (!delta) return
  for (const [k, v] of Object.entries(delta)) {
    target[k] = (target[k] ?? 0) + v
  }
}

function recordMaterialTotalsEqual(
  a: Record<string, number> | undefined,
  b: Record<string, number>
): boolean {
  if (!a) return false
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const key of ka) {
    if ((a[key] ?? 0) !== (b[key] ?? 0)) return false
  }
  return true
}

/** Рецепты только со stash-материалами (без расчёта по пулам `RawResource`). */
function inferRefiningRecipeIdFromStashIo(merged: {
  inputs: Record<string, number>
  outputs: Record<string, number>
}): string | undefined {
  const outKeys = Object.keys(merged.outputs)
  if (outKeys.length !== 1) return undefined
  const outMaterialId = outKeys[0]
  const outAmount = merged.outputs[outMaterialId]
  if (outAmount === undefined || outAmount <= 0) return undefined
  if (Object.keys(merged.inputs).length === 0) return undefined

  const matches = refiningRecipes.filter(
    (r) =>
      r.stashInputsPerBatch != null &&
      r.stashOutputMaterialId === outMaterialId &&
      recordMaterialTotalsEqual(r.stashInputsPerBatch, merged.inputs) &&
      r.output.amount === outAmount
  )
  if (matches.length === 1) return matches[0].id
  return undefined
}
