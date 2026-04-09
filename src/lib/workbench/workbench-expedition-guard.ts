import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'

export function isWorkbenchDispatchSessionActive(
  queue: readonly WorkbenchQueueItem[],
  stageRun: { source?: string } | null | undefined
): boolean {
  if (stageRun?.source === 'queue') return true
  return queue.some((i) => i.status === 'running')
}

/** Показать диалог §6.1: только запланированные пункты, сессия не запущена. */
export function shouldPromptExpeditionWorkbenchQueueDialog(
  weaponId: string,
  queue: readonly WorkbenchQueueItem[],
  stageRun: { source?: string } | null | undefined
): boolean {
  if (isWorkbenchDispatchSessionActive(queue, stageRun)) return false
  return queue.some((i) => i.weaponId === weaponId && i.status === 'planned')
}

export function countPlannedWorkbenchItemsForWeapon(
  weaponId: string,
  queue: readonly WorkbenchQueueItem[]
): number {
  return queue.filter((i) => i.weaponId === weaponId && i.status === 'planned').length
}
