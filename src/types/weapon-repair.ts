/**
 * Многоэтапный ремонт по техникам (фаза 3b).
 * Не путать с legacy `RepairType` в `data/repair-system.ts`.
 *
 * @see docs/systems/DAMAGE_INVESTIGATION_AND_REPAIR_SYSTEM.md (раздел про техники и этапы)
 */

/** Категория этапа в таймлайне починки */
export type RepairStageCategory = 'preparation' | 'work' | 'finishing'

/** Шаблон одного этапа внутри техники */
export interface RepairStageTemplate {
  id: string
  name: string
  baseDurationSec: number
  category: RepairStageCategory
}

/** Базовые — без покупки; узкоспециализированные — у интенданта гильдии. */
export type RepairTechniqueTier = 'basic' | 'specialized'

/** Описание техники починки (данные + UI) */
export interface RepairTechniqueDefinition {
  id: string
  name: string
  description: string
  /** Какие id тегов из DAMAGE_TAG_REGISTRY техника может снять при успешном прохождении плана */
  clearsTagIds: string[]
  stages: RepairStageTemplate[]
  goldCost: number
  /** Ключи как в CraftingCost / склад (каноничные id ресурсов) */
  materials: Record<string, number>
  /** Базовые техники доступны с начала; остальное — расширение контента */
  unlock: 'base' | 'guild' | 'quest' | string
  /** Ранг доступа: базовые бесплатно; specialized — покупка у интенданта (`unlockedRepairTechniqueIds`). */
  repairTier: RepairTechniqueTier
  /** Соответствует «тяжёлым» тегам: показать предупреждение до этапов */
  requiresPrepWarning?: boolean
}

/** Этап итогового плана после слияния выбранных техник */
export interface MergedRepairStage {
  order: number
  stageTemplateId: string
  name: string
  baseDurationSec: number
  category: RepairStageCategory
  sourceTechniqueId: string
  sourceTechniqueName: string
}

/** Собранный план починки (не исполняется до прохождения этапов в store/UI) */
export interface WeaponRepairPlan {
  techniqueIds: string[]
  stages: MergedRepairStage[]
  totalGold: number
  mergedMaterials: Record<string, number>
}

/** Активная сессия ремонта на экземпляре (store; опционально persist позже) */
export interface ActiveWeaponRepairSession {
  weaponId: string
  plan: WeaponRepairPlan
  currentStageIndex: number
  startedAt: number
}
