/**
 * Текстовые подсказки для ремонта: сколько сырья и угля нужно переплавить,
 * если не хватает производного ресурса (слиток, доски и т.д.).
 */

import { refiningRecipes } from '@/data/refining-recipes'
import { getMaterialShopInfo } from '@/data/material-shop'
import type { ResourceKey } from '@/store/slices/resources-slice'

/**
 * Возвращает строку с расчётом переработки по `refining-recipes.ts`, или null,
 * если для этого ключа нет рецепта переплавки (например золото / soulEssence).
 */
export function formatRepairRefiningHint(
  targetKey: ResourceKey,
  shortAmount: number,
  playerLevel: number
): string | null {
  if (shortAmount <= 0) return null

  const recipe = refiningRecipes.find((r) => r.output.resource === targetKey)
  if (!recipe) return null

  const perBatchOut = recipe.output.amount
  const batches = Math.ceil(shortAmount / perBatchOut)

  const inputChunks = recipe.inputs.map((inp) => {
    const total = inp.amount * batches
    const name = getMaterialShopInfo(inp.resource)?.name ?? String(inp.resource)
    return `${total}× ${name}`
  })

  const coalPerBatch = recipe.extraCost?.coal ?? 0
  const coalTotal = coalPerBatch * batches
  const coalLabel = getMaterialShopInfo('coal')?.name ?? 'Уголь'
  const coalChunk = coalTotal > 0 ? ` и ${coalTotal}× ${coalLabel}` : ''

  const levelOk = playerLevel >= recipe.requiredLevel
  const levelPart = levelOk
    ? ''
    : ` Доступно с уровня кузницы ${recipe.requiredLevel}.`

  return `Переплавка: ${inputChunks.join(', ')}${coalChunk} — рецепт «${recipe.name}» (${batches}× партия).${levelPart}`
}
