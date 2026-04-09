import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'
import { estimateWorkbenchQueueItemDurationMs } from '@/lib/workbench/workbench-queue'

/** Зафиксированные доли сегментов на старте сессии §8.5 (не пересчитывать при удалении чужих planned). */
export type WorkbenchBarBaseline = {
  order: string[]
  widthPctById: Record<string, number>
}

export function freezeWorkbenchBarBaseline(
  queue: readonly WorkbenchQueueItem[]
): WorkbenchBarBaseline {
  const order = queue.map((i) => i.queueItemId)
  const durs = queue.map((item) => estimateWorkbenchQueueItemDurationMs(item))
  const total = durs.reduce((a, b) => a + b, 0) || 1
  const widthPctById: Record<string, number> = {}
  queue.forEach((item, i) => {
    widthPctById[item.queueItemId] = (durs[i] / total) * 100
  })
  return { order, widthPctById }
}

export type WorkbenchBarSegmentView = {
  queueItemId: string
  widthPct: number
  item: WorkbenchQueueItem | null
  weaponLabel: string
  opLabel: string
}

function opLabelForItem(it: WorkbenchQueueItem | null): string {
  if (it == null) return '—'
  if (it.kind === 'repair') return 'Ремонт'
  if (it.kind === 'reforge_buff') return 'Усиление'
  return 'Пробуждение'
}

export function buildWorkbenchBarSegmentViews(
  baseline: WorkbenchBarBaseline | null,
  liveQueue: readonly WorkbenchQueueItem[],
  weaponNameById: Record<string, string>
): WorkbenchBarSegmentView[] {
  if (!baseline) {
    const durs = liveQueue.map((item) => estimateWorkbenchQueueItemDurationMs(item))
    const total = durs.reduce((a, b) => a + b, 0) || 1
    return liveQueue.map((item, i) => ({
      queueItemId: item.queueItemId,
      widthPct: (durs[i] / total) * 100,
      item,
      weaponLabel: weaponNameById[item.weaponId] ?? item.weaponId,
      opLabel: opLabelForItem(item),
    }))
  }

  return baseline.order.map((queueItemId) => {
    const item = liveQueue.find((q) => q.queueItemId === queueItemId) ?? null
    const widthPct = baseline.widthPctById[queueItemId] ?? 0
    const weaponId = item?.weaponId ?? ''
    const weaponLabel = weaponId
      ? weaponNameById[weaponId] ?? weaponId
      : 'Снято из очереди'
    return {
      queueItemId,
      widthPct,
      item,
      weaponLabel,
      opLabel: opLabelForItem(item),
    }
  })
}

export function findActiveSegmentIndex(
  segments: readonly WorkbenchBarSegmentView[],
  activeQueueItemId: string | null | undefined
): number {
  if (!activeQueueItemId) return -1
  const i = segments.findIndex((s) => s.queueItemId === activeQueueItemId)
  return i
}
