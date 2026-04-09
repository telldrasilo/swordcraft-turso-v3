/**
 * Единая очередь верстака (ремонт + перековка в перспективе).
 * Сохранение: ключ persist/облако по-прежнему `repairQueuePlan`, формат — массив WorkbenchQueueItem.
 */

import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import { buildWeaponRepairPlan } from '@/lib/weapon-damage/build-repair-plan'
import { getWeaponRepairPlanTotalDurationMs } from '@/lib/weapon-damage/repair-stage-timing'
import { generateIdWithPrefix } from '@/lib/store-utils/generators'
import { buildReforgeWeaponWorkbenchPlan } from '@/lib/reforge/reforge-workbench-plan'

export type WorkbenchQueueItemKind = 'repair' | 'reforge_buff' | 'reforge_awaken'

export type WorkbenchQueueItemStatus = 'planned' | 'running' | 'done' | 'error'

export interface WorkbenchQueueItemBase {
  queueItemId: string
  weaponId: string
  status: WorkbenchQueueItemStatus
  errorMessage?: string
  queuedAt: number
}

export interface WorkbenchRepairQueueItem extends WorkbenchQueueItemBase {
  kind: 'repair'
  techniqueIds: string[]
  executionOpts?: RepairTechniqueExecutionOptions
}

export interface WorkbenchReforgeBuffQueueItem extends WorkbenchQueueItemBase {
  kind: 'reforge_buff'
  techniqueId: string
}

export interface WorkbenchReforgeAwakenQueueItem extends WorkbenchQueueItemBase {
  kind: 'reforge_awaken'
  techniqueId: string
}

export type WorkbenchQueueItem =
  | WorkbenchRepairQueueItem
  | WorkbenchReforgeBuffQueueItem
  | WorkbenchReforgeAwakenQueueItem

/** Совместимость с прежним именем типа (только ремонт). */
export type RepairQueuePlanItem = WorkbenchRepairQueueItem

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === 'object' && !Array.isArray(x)
}

function normalizeStatus(x: unknown): WorkbenchQueueItemStatus {
  if (x === 'planned' || x === 'running' || x === 'done' || x === 'error') return x
  return 'planned'
}

/**
 * Нормализация одной записи из сейва (legacy без `kind` / `queueItemId` → repair).
 */
export function normalizeWorkbenchQueueItemFromSave(raw: unknown, fallbackIndex: number): WorkbenchQueueItem | null {
  if (!isRecord(raw)) return null
  const weaponId = typeof raw.weaponId === 'string' ? raw.weaponId : ''
  if (!weaponId) return null

  const status = normalizeStatus(raw.status)
  const queuedAt = typeof raw.queuedAt === 'number' ? raw.queuedAt : Date.now()
  const errorMessage = typeof raw.errorMessage === 'string' ? raw.errorMessage : undefined
  const queueItemId =
    typeof raw.queueItemId === 'string' && raw.queueItemId.length > 0
      ? raw.queueItemId
      : `wq_${weaponId}_${queuedAt}_${fallbackIndex}`

  const kindRaw = raw.kind
  if (kindRaw === 'reforge_buff' || kindRaw === 'reforge_awaken') {
    const techniqueId = typeof raw.techniqueId === 'string' ? raw.techniqueId : ''
    if (!techniqueId) return null
    const base = { queueItemId, weaponId, status, queuedAt, ...(errorMessage ? { errorMessage } : {}) }
    if (kindRaw === 'reforge_buff') {
      return { kind: 'reforge_buff', ...base, techniqueId }
    }
    return { kind: 'reforge_awaken', ...base, techniqueId }
  }

  const techniqueIds = Array.isArray(raw.techniqueIds)
    ? raw.techniqueIds.filter((id): id is string => typeof id === 'string')
    : []
  const executionOpts =
    raw.executionOpts != null && isRecord(raw.executionOpts)
      ? (raw.executionOpts as RepairTechniqueExecutionOptions)
      : undefined

  return {
    kind: 'repair',
    queueItemId,
    weaponId,
    status,
    queuedAt,
    techniqueIds,
    ...(executionOpts ? { executionOpts } : {}),
    ...(errorMessage ? { errorMessage } : {}),
  }
}

export function normalizeWorkbenchQueueFromSave(raw: unknown): WorkbenchQueueItem[] {
  if (!Array.isArray(raw)) return []
  const out: WorkbenchQueueItem[] = []
  raw.forEach((item, index) => {
    const n = normalizeWorkbenchQueueItemFromSave(item, index)
    if (n) out.push(n)
  })
  return out
}

export function removeAllPlannedQueueItemsForWeapon(
  queue: readonly WorkbenchQueueItem[],
  weaponId: string
): WorkbenchQueueItem[] {
  return queue.filter((item) => !(item.weaponId === weaponId && item.status === 'planned'))
}

/** Оценка длительности пункта для полосы прогресса (мс). */
export function estimateWorkbenchQueueItemDurationMs(item: WorkbenchQueueItem): number {
  if (item.kind === 'repair') {
    const plan = buildWeaponRepairPlan(item.techniqueIds)
    if (!plan) return 0
    return getWeaponRepairPlanTotalDurationMs(plan)
  }
  const plan = buildReforgeWeaponWorkbenchPlan(item.techniqueId)
  return plan ? getWeaponRepairPlanTotalDurationMs(plan) : 0
}

export function isEligibleWorkbenchQueueItemStatus(status: WorkbenchQueueItemStatus): boolean {
  return status === 'planned' || status === 'error'
}

export function findNextWorkbenchQueueItemIndex(
  items: readonly WorkbenchQueueItem[],
  afterIndex: number
): number {
  for (let i = afterIndex + 1; i < items.length; i++) {
    if (isEligibleWorkbenchQueueItemStatus(items[i].status)) return i
  }
  for (let i = 0; i < afterIndex; i++) {
    if (isEligibleWorkbenchQueueItemStatus(items[i].status)) return i
  }
  return -1
}

export function findNextWorkbenchQueueItemIndexAfterFailure(
  items: readonly WorkbenchQueueItem[],
  afterIndex: number
): number {
  for (let i = afterIndex + 1; i < items.length; i++) {
    if (isEligibleWorkbenchQueueItemStatus(items[i].status)) return i
  }
  return -1
}

/**
 * Следующий пункт только со статусом `planned` (не подхватывает `error`, чтобы авто-очередь
 * не зацикливалась на провальных пунктах).
 */
export function findNextPlannedWorkbenchQueueItemIndex(
  items: readonly WorkbenchQueueItem[],
  afterIndex: number
): number {
  for (let i = afterIndex + 1; i < items.length; i++) {
    if (items[i].status === 'planned') return i
  }
  for (let i = 0; i < afterIndex; i++) {
    if (items[i].status === 'planned') return i
  }
  return -1
}

export function createRepairWorkbenchQueueItem(params: {
  weaponId: string
  techniqueIds: string[]
  executionOpts?: RepairTechniqueExecutionOptions
}): WorkbenchRepairQueueItem {
  return {
    kind: 'repair',
    queueItemId: generateIdWithPrefix('wq'),
    weaponId: params.weaponId,
    techniqueIds: [...params.techniqueIds],
    ...(params.executionOpts ? { executionOpts: params.executionOpts } : {}),
    status: 'planned',
    queuedAt: Date.now(),
  }
}

export function createReforgeBuffWorkbenchQueueItem(params: {
  weaponId: string
  techniqueId: string
}): WorkbenchReforgeBuffQueueItem {
  return {
    kind: 'reforge_buff',
    queueItemId: generateIdWithPrefix('wq'),
    weaponId: params.weaponId,
    techniqueId: params.techniqueId,
    status: 'planned',
    queuedAt: Date.now(),
  }
}

export function createReforgeAwakenWorkbenchQueueItem(params: {
  weaponId: string
  techniqueId: string
}): WorkbenchReforgeAwakenQueueItem {
  return {
    kind: 'reforge_awaken',
    queueItemId: generateIdWithPrefix('wq'),
    weaponId: params.weaponId,
    techniqueId: params.techniqueId,
    status: 'planned',
    queuedAt: Date.now(),
  }
}

export function isWorkbenchRepairItem(
  item: WorkbenchQueueItem
): item is WorkbenchRepairQueueItem {
  return item.kind === 'repair'
}

export function filterWorkbenchRepairQueueItems(
  queue: readonly WorkbenchQueueItem[]
): WorkbenchRepairQueueItem[] {
  return queue.filter(isWorkbenchRepairItem)
}

/** Число уникальных клинков с задачами planned/running (сводка «на верстаке»). */
export function countUniqueActiveWorkbenchWeaponIds(queue: readonly WorkbenchQueueItem[]): number {
  const ids = new Set<string>()
  for (const i of queue) {
    if (i.status === 'planned' || i.status === 'running') ids.add(i.weaponId)
  }
  return ids.size
}

export function weaponHasActiveWorkbenchWork(
  queue: readonly WorkbenchQueueItem[],
  weaponId: string
): boolean {
  return queue.some(
    (i) => i.weaponId === weaponId && (i.status === 'planned' || i.status === 'running')
  )
}

export function hasPlannedOrRunningQueueItemOfKind(
  queue: readonly WorkbenchQueueItem[],
  weaponId: string,
  kind: WorkbenchQueueItemKind
): boolean {
  return queue.some(
    (i) =>
      i.weaponId === weaponId &&
      i.kind === kind &&
      (i.status === 'planned' || i.status === 'running')
  )
}

/** Перестановка только planned; running не двигаем. */
export function reorderPlannedWorkbenchQueueItems(
  queue: readonly WorkbenchQueueItem[],
  fromIndex: number,
  toIndex: number
): WorkbenchQueueItem[] | null {
  if (fromIndex === toIndex) return [...queue]
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= queue.length || toIndex >= queue.length) {
    return null
  }
  const copy = [...queue]
  const moving = copy[fromIndex]
  if (!moving || moving.status !== 'planned') return null
  const targetSlot = copy[toIndex]
  if (targetSlot?.status === 'running') return null
  copy.splice(fromIndex, 1)
  copy.splice(toIndex, 0, moving)
  return copy
}
