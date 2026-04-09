import { createRepairWorkbenchQueueItem, type WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'

/**
 * Для id из легаси `repairBenchWeaponIds`: если для weaponId ещё нет repair-задачи
 * в статусе planned или running, добавляет planned repair с пустым techniqueIds
 * (игрок должен отредактировать задачу — см. дорожную карту §A1).
 */
export function appendRepairQueueItemsFromLegacyBenchIds(params: {
  benchIds: readonly string[]
  queue: readonly WorkbenchQueueItem[]
}): { queue: WorkbenchQueueItem[]; addedCount: number } {
  const { benchIds, queue } = params
  const next = [...queue]
  let addedCount = 0

  const hasActiveRepair = (weaponId: string) =>
    next.some(
      (i) =>
        i.weaponId === weaponId &&
        i.kind === 'repair' &&
        (i.status === 'planned' || i.status === 'running')
    )

  for (const weaponId of benchIds) {
    if (!weaponId || hasActiveRepair(weaponId)) continue
    next.push(
      createRepairWorkbenchQueueItem({
        weaponId,
        techniqueIds: [],
      })
    )
    addedCount += 1
  }

  return { queue: next, addedCount }
}
