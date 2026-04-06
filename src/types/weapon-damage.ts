/**
 * Видимые повреждения и наследие клинка на экземпляре оружия (фаза 6 / фаза 1 данных).
 * @see docs/systems/DAMAGE_INVESTIGATION_AND_REPAIR_SYSTEM.md
 */

/** Тяжесть видимого повреждения (UI и будущие формулы) */
export type WeaponDamageSeverity = 'light' | 'moderate' | 'heavy'

/**
 * Состояние «нужна ли полноценная починка» для заказов и старта экспедиции.
 * @see DAMAGE_INVESTIGATION_AND_REPAIR_SYSTEM.md §10
 */
export type WeaponRepairCondition = 'ok' | 'needsProperRepair' | 'temporaryPatch'

/** Одна активная метка повреждения на экземпляре */
export interface ActiveDamageTagEntry {
  /** Стабильный id из реестра `DAMAGE_TAG_REGISTRY` */
  tagId: string
  severity: WeaponDamageSeverity
  /** Id шаблона события экспедиции (если известен) */
  sourceEventTemplateId?: string
  /** Время записи (мс), если есть */
  appliedAt?: number
}

/** Качество диагностики перед ремонтом (§9.1.1, модель v2) */
export type RepairDiagnosisTier = 'precise' | 'risky' | 'skipped'

/** Скрытое наследие клинка (мост к зачарованиям), не как «поломка» в UI */
export interface WeaponLegacy {
  /** Идентификаторы скрытых маркеров для будущего модуля чар */
  hiddenMarks: string[]
  /** Успешные «тяжёлые» ремонты (quality/restoration/enhancement) по этому экземпляру */
  bladeBondRepairCount?: number
  /** Когда завершится текущий сеанс осмотра (материалы уже списаны); после — `completeWeaponDeepInspect`. */
  deepInspectReadyAt?: number
  /** Время последней оплаченной процедуры «осмотреть глубже» (мс) */
  lastDeepInspectAt?: number
  /**
   * Снимок `analysisHint` на момент оплаты осмотра.
   * Не сбрасывается при снятии видимых тегов — в отличие от живого списка по `activeDamageTags`.
   */
  deepInspectNotes?: string[]
  /** Id тегов на момент последнего осмотра (контекст для UI / отладки) */
  deepInspectTagIds?: string[]
  /** Сколько раз завершён авто-ремонт по этому экземпляру */
  autoRepairCompletedCount?: number
  /**
   * Успешные ремонты с полным снятием тега (ключ — tagId). Задел под зачарование.
   * @see docs/systems/REPAIR_UI_UX_REDESIGN_SPEC.md §9.1
   */
  repairResolveCountByTagId?: Record<string, number>
  /** Теги, снятые с карточки, но сохранённые для истории / зачарования */
  archivedDamageTagIds?: string[]
  /**
   * Сколько раз ремонт снял тег после диагностики precise / risky / skipped (зачарование v2).
   * @see REPAIR_UI_UX_REDESIGN_SPEC.md §9.1.1
   */
  repairDiagnosisPreciseCountByTagId?: Record<string, number>
  repairDiagnosisRiskyCountByTagId?: Record<string, number>
  repairDiagnosisSkippedCountByTagId?: Record<string, number>
  /**
   * Веса шрамов после снятия физических видимых тегов (ключи `scar_*`, SPEC §1.1 / §2).
   * Хранится топ-3 по весу после каждого инкремента.
   */
  physicalScarWeights?: Record<string, number>
  /**
   * Веса шрамов по осям стихий после снятия `elemental_*` (ключи `fire`, `frost`, …).
   * Топ-3 по весу.
   */
  elementalScarWeights?: Record<string, number>
}
