/**
 * План этапов перековки на верстаке — тот же контракт `WeaponRepairPlan`, что и у ремонта,
 * чтобы переиспользовать `useWeaponRepairStageRun` и `getRepairStageProgressFromElapsed`.
 */

import type { MergedRepairStage, WeaponRepairPlan } from '@/types/weapon-repair'
import { getReforgeTechniqueById } from '@/data/reforge/reforge-techniques-registry'
import { getWeaponRepairPlanTotalDurationMs } from '@/lib/weapon-damage/repair-stage-timing'

const REFORGE_STAGE_PREP_SEC = 3
const REFORGE_STAGE_MAIN_SEC = 6

/** План этапов для таймера перековки (после этапов — applyReforgeTechniquePure). */
export function buildReforgeWeaponWorkbenchPlan(techniqueId: string): WeaponRepairPlan | null {
  const t = getReforgeTechniqueById(techniqueId)
  if (!t) return null

  const label =
    t.reforgeType === 'awakenScar' ? `Пробуждение: ${t.name}` : `Перековка: ${t.name}`

  const stages: MergedRepairStage[] = [
    {
      order: 0,
      stageTemplateId: `reforge_prep_${techniqueId}`,
      name: 'Подготовка',
      baseDurationSec: REFORGE_STAGE_PREP_SEC,
      category: 'preparation',
      sourceTechniqueId: techniqueId,
      sourceTechniqueName: t.name,
    },
    {
      order: 1,
      stageTemplateId: `reforge_main_${techniqueId}`,
      name: label,
      baseDurationSec: REFORGE_STAGE_MAIN_SEC,
      category: 'work',
      sourceTechniqueId: techniqueId,
      sourceTechniqueName: t.name,
    },
  ]

  return {
    techniqueIds: [techniqueId],
    stages,
    totalGold: 0,
    mergedMaterials: {},
  }
}

/** Суммарная длительность перековки на верстаке (мс), для полосы очереди и UI. */
export function getReforgeWorkbenchTotalDurationMs(techniqueId: string): number {
  const plan = buildReforgeWeaponWorkbenchPlan(techniqueId)
  if (!plan) return 0
  return getWeaponRepairPlanTotalDurationMs(plan)
}

export function getReforgeWorkbenchStages(techniqueId: string): MergedRepairStage[] {
  return buildReforgeWeaponWorkbenchPlan(techniqueId)?.stages ?? []
}
