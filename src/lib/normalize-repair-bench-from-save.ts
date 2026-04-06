import type { RepairTechniqueStageRunState } from '@/store/slices/craft-slice'
import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'

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

/**
 * Активный прогон этапов ремонта: только если совпадает с верстаком и оружие есть в инвентаре.
 */
export function normalizeRepairTechniqueStageRunFromSave(
  raw: unknown,
  repairBenchWeaponId: string | null,
  weapons: readonly { id?: string }[]
): RepairTechniqueStageRunState | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const weaponId = o.weaponId
  if (typeof weaponId !== 'string' || weaponId.length === 0) return null
  if (repairBenchWeaponId !== weaponId) return null
  if (!weapons.some((w) => w?.id === weaponId)) return null
  const startedAt = o.startedAt
  if (typeof startedAt !== 'number' || !Number.isFinite(startedAt)) return null
  const techniqueIds = o.techniqueIds
  if (!Array.isArray(techniqueIds) || techniqueIds.length === 0) return null
  if (!techniqueIds.every((id) => typeof id === 'string' && id.length > 0)) return null

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
  }
}
