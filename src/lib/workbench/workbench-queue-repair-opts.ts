import type { RepairTechniqueExecutionOptions } from '@/types/repair-execution'
import { buildWeaponRepairPlan } from '@/lib/weapon-damage/build-repair-plan'

/** Для финала очереди верстака: пробросить число этапов плана в опции броска (бонус к успеху). */
export function mergeWorkbenchQueueRepairFinaleOpts(
  techniqueIds: readonly string[],
  executionOpts: RepairTechniqueExecutionOptions | undefined
): RepairTechniqueExecutionOptions | undefined {
  const plan = buildWeaponRepairPlan(techniqueIds)
  const n = plan?.stages.length ?? 0
  if (n <= 0) return executionOpts
  if (executionOpts == null) return { workbenchCompletedStages: n }
  return { ...executionOpts, workbenchCompletedStages: n }
}
