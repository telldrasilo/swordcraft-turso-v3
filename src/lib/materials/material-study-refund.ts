import type { MaterialStudyTechnique } from '@/types/material-study'
import { getResourceKeyForMaterial } from '@/lib/craft/inventory-check'
import type { ResourceKey } from '@/store/slices/resources-slice'

/** Доля стоимости техники изучения, возвращаемая при отмене (баланс §7). */
export const MATERIAL_STUDY_CANCEL_RESOURCE_REFUND_RATIO = 0.5

type RefundPools = {
  addResource: (resource: ResourceKey, amount: number) => void
  addMaterialToStash: (materialId: string, amount: number) => void
}

/** Вернуть часть ресурсов/сташа по строкам `materialCosts` техники (как зеркало к списанию при старте). */
export function refundMaterialStudyTechniqueCosts(
  pools: RefundPools,
  technique: MaterialStudyTechnique,
  ratio = MATERIAL_STUDY_CANCEL_RESOURCE_REFUND_RATIO
): void {
  for (const { materialId, quantity } of technique.materialCosts) {
    const q = Math.floor(quantity * ratio)
    if (q <= 0) continue
    const rk = getResourceKeyForMaterial(materialId)
    if (rk) pools.addResource(rk, q)
    else pools.addMaterialToStash(materialId, q)
  }
}
