/**
 * Опции выполнения ремонта по техникам (модель v2: диагностика, авто-подбор).
 * @see docs/systems/REPAIR_UI_UX_REDESIGN_SPEC.md
 */

import type { RepairDiagnosisTier } from '@/types/weapon-damage'

export type RepairDiagnosisExecutionMode = 'manual_inspection' | 'auto_pick' | 'auto_repair'

export interface RepairTechniqueExecutionOptions {
  diagnosis?: {
    mode: RepairDiagnosisExecutionMode
    /**
     * Ручной осмотр: true — precise, false — risky, нет ключа — skipped для этого тега.
     */
    hypothesisByTagId?: Record<string, boolean>
  }
  /** Наценка на материалы плана (автоподбор; см. getRepairAutoPickMaterialMarkup) */
  materialCostMultiplier?: number
}

/** Tier §9.1.1 для снятого тега; `null` — не копить счётчики диагностики (старые вызовы без opts). */
export function diagnosisTierForRemovedTag(
  tagId: string,
  diagnosis: RepairTechniqueExecutionOptions['diagnosis'] | undefined
): RepairDiagnosisTier | null {
  if (!diagnosis) return null
  if (diagnosis.mode === 'auto_pick' || diagnosis.mode === 'auto_repair') return 'skipped'
  const h = diagnosis.hypothesisByTagId?.[tagId]
  if (h === true) return 'precise'
  if (h === false) return 'risky'
  return 'skipped'
}
