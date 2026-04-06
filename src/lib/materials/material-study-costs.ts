import type { CraftingCost } from '@/store/slices/resources-slice'
import { getResourceKeyForMaterial } from '@/lib/craft/inventory-check'

/** Свести расход каталожных материалов к пулу `CraftingCost` для `spendCraftingCostWithStash`. */
export function catalogMaterialCostsToCraftingCost(
  costs: { materialId: string; quantity: number }[]
): CraftingCost {
  const out: CraftingCost = {}
  for (const { materialId, quantity } of costs) {
    if (!materialId || quantity <= 0) continue
    const key = getResourceKeyForMaterial(materialId)
    if (!key) continue
    out[key] = (out[key] ?? 0) + quantity
  }
  return out
}
