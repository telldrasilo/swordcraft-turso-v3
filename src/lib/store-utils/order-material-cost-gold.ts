/**
 * Единая оценка «стоимости материалов заказа» в условном золоте по RESOURCE_SELL_PRICES.
 * Используется при генерации заказов и расчёте награды, чтобы не дублировать локальные таблицы цен.
 */

import type { ResourceKey } from '@/store/slices/resources-slice'
import { RESOURCE_SELL_PRICES } from '@/lib/store-utils/constants'

export function craftingResourceCostMapToGoldApprox(
  materialCostMap: Record<string, number>
): number {
  return Object.entries(materialCostMap).reduce((total, [resource, amount]) => {
    const price = RESOURCE_SELL_PRICES[resource as ResourceKey] ?? 1
    return total + (amount || 0) * price
  }, 0)
}
