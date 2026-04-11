/**
 * Смысловые роли материалов в игровых процессах (фаза B семантики).
 * См. docs/MATERIAL_SEMANTIC_PROCESS_ROLES.md
 */

/** Игровой процесс, для которого запрашивается вклад материала. Расширяется по мере реестра в документе. */
export type MaterialProcessKind =
  | 'weapon_craft_v2'
  | 'refining_smelting'
  /** Выделка кожи / постройка `tannery`; отделено от плавки (фаза **3.4** roadmap). */
  | 'refining_tanning'

/**
 * Узкая роль в контексте процесса (общий словарь проекта).
 * Не дублирует MaterialClass: класс задаёт «что это», фасет — «как участвует в процессе P».
 */
export type MaterialProcessFacet =
  | 'smelt_fuel'
  | 'smelt_ore_charge'
  | 'weapon_body_metal'
  | 'weapon_body_wood'
  | 'weapon_body_mineral'
  | 'weapon_inlay_gem'
  | 'weapon_grip_leather'
  | 'organic_reagent'

export type MaterialProcessContributionSource =
  | 'explicit'
  | 'inferred_tags'
  | 'class_fallback'
  | 'unknown'

/** Параметры плавки (фаза C семантики): влияют на выход слитка при списании конкретных руд из пула. */
export interface MaterialRefiningSmeltingParams {
  /** 1.0 — эталон; &lt;1 — худший выход слитка на единицу шихты */
  oreChargeEfficiency: number
}

export interface MaterialProcessContribution {
  facets: MaterialProcessFacet[]
  source: MaterialProcessContributionSource
  refiningSmelting?: MaterialRefiningSmeltingParams
}
