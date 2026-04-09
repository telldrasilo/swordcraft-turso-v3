import type {
  RepairTechniqueStageRunSource,
  RepairTechniqueStageRunState,
} from '@/store/slices/craft-slice'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import type { WorkbenchQueueItem } from '@/lib/workbench/workbench-queue'

/**
 * Слот верстака ремонта в облачном/бэкап-сейве: только id существующего оружия или null.
 */
export function normalizeRepairBenchWeaponIdFromSave(
  raw: unknown,
  weapons: readonly { id?: string }[]
): string | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string' || raw.length === 0) return null
  return weapons.some((w) => w?.id === raw) ? raw : null
}

export function normalizeRepairBenchWeaponIdsFromSave(
  rawIds: unknown,
  rawLegacyId: unknown,
  weapons: readonly { id?: string }[]
): string[] {
  const available = new Set(weapons.map((w) => w.id).filter((id): id is string => Boolean(id)))
  const out: string[] = []
  const push = (id: unknown) => {
    if (typeof id !== 'string' || id.length === 0) return
    if (!available.has(id)) return
    if (!out.includes(id)) out.push(id)
  }
  if (Array.isArray(rawIds)) {
    for (const id of rawIds) push(id)
  }
  if (out.length === 0) {
    push(normalizeRepairBenchWeaponIdFromSave(rawLegacyId, weapons))
  }
  return out
}

export function normalizeRepairBenchSelectedWeaponIdFromSave(
  rawSelectedId: unknown,
  benchIds: string[]
): string | null {
  if (typeof rawSelectedId === 'string' && benchIds.includes(rawSelectedId)) return rawSelectedId
  return benchIds[0] ?? null
}

/**
 * Активный прогон этапов: оружие должно быть в инвентаре.
 * Для source === queue при наличии `workbenchQueue` проверяется `activeQueueItemId`.
 */
export function normalizeRepairTechniqueStageRunFromSave(
  raw: unknown,
  weapons: readonly { id?: string }[],
  workbenchQueue?: readonly WorkbenchQueueItem[]
): RepairTechniqueStageRunState | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const weaponId = o.weaponId
  if (typeof weaponId !== 'string' || weaponId.length === 0) return null
  if (!weapons.some((w) => w?.id === weaponId)) return null

  let source: RepairTechniqueStageRunSource | undefined
  if (o.source === 'queue' || o.source === 'adhoc') {
    source = o.source
  }

  const activeQueueItemId =
    typeof o.activeQueueItemId === 'string' && o.activeQueueItemId.length > 0
      ? o.activeQueueItemId
      : undefined
  if (source === 'queue' && activeQueueItemId && workbenchQueue) {
    const hit = workbenchQueue.some(
      (i) => i.queueItemId === activeQueueItemId && i.weaponId === weaponId
    )
    if (!hit) return null
  }

  const startedAt = o.startedAt
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) return null

  const wrRaw = o.workbenchReforge as { kind?: string; techniqueId?: string } | undefined
  let techniqueIds = o.techniqueIds
  if ((!Array.isArray(techniqueIds) || techniqueIds.length === 0) && wrRaw?.techniqueId) {
    techniqueIds = [wrRaw.techniqueId]
  }
  if (!Array.isArray(techniqueIds) || techniqueIds.length === 0) return null
  if (!techniqueIds.every((id) => typeof id === 'string' && id.length > 0)) return null

  let workbenchReforge: { kind: 'reforge_buff' | 'reforge_awaken'; techniqueId: string } | undefined
  if (wrRaw?.techniqueId && (wrRaw.kind === 'reforge_buff' || wrRaw.kind === 'reforge_awaken')) {
    workbenchReforge = { kind: wrRaw.kind, techniqueId: wrRaw.techniqueId }
  }

  let executionOpts: RepairTechniqueExecutionOptions | undefined
  if (o.executionOpts !== undefined && o.executionOpts !== null) {
    if (typeof o.executionOpts === 'object' && !Array.isArray(o.executionOpts)) {
      executionOpts = o.executionOpts as RepairTechniqueExecutionOptions
    }
  }

  return {
    weaponId,
    startedAt,
    techniqueIds: [...techniqueIds],
    ...(executionOpts !== undefined ? { executionOpts } : {}),
    ...(source ? { source } : {}),
    ...(activeQueueItemId ? { activeQueueItemId } : {}),
    ...(workbenchReforge ? { workbenchReforge } : {}),
  }
}
