import type { RepairQueuePlanItem } from '@/store/slices/craft-slice'

export function isEligibleRepairQueueStatus(status: RepairQueuePlanItem['status']): boolean {
  return status === 'planned' || status === 'error'
}

/**
 * Следующий кандидат строго после `afterIndex`, затем обход с начала до `afterIndex`.
 * Индекс `afterIndex` не рассматривается повторно — после ошибки на единственном пункте
 * очередь останавливается, а не зацикливается.
 */
export function findNextRepairQueueItemIndex(
  items: readonly RepairQueuePlanItem[],
  afterIndex: number
): number {
  for (let i = afterIndex + 1; i < items.length; i++) {
    if (isEligibleRepairQueueStatus(items[i].status)) return i
  }
  for (let i = 0; i < afterIndex; i++) {
    if (isEligibleRepairQueueStatus(items[i].status)) return i
  }
  return -1
}

/** После ошибки не оборачиваемся к предыдущим индексам — как в синхронном прогоне очереди. */
export function findNextRepairQueueItemIndexAfterFailure(
  items: readonly RepairQueuePlanItem[],
  afterIndex: number
): number {
  for (let i = afterIndex + 1; i < items.length; i++) {
    if (isEligibleRepairQueueStatus(items[i].status)) return i
  }
  return -1
}
