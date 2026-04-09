/**
 * Постройка узла зачарований по квесту «Эхо забытой кузни» (крафт v2, рецепт P1).
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md
 */

export const FORGOTTEN_FORGE_ALTAR_RECIPE_ID = 'forgotten_forge_altar_node' as const

/** Части рецепта узла: каноничные реагенты III фазы вне стандартного маппинга materialTypes → class. */
export const ALTAR_PART_ID_SOUL_PEAT = 'altar_soul_peat' as const
export const ALTAR_PART_ID_SOUL_HERBS = 'altar_soul_herbs' as const

const ALTAR_FORGE_EXTRA_MATERIAL_IDS_BY_PART: Record<string, readonly string[]> = {
  [ALTAR_PART_ID_SOUL_PEAT]: ['peat'],
  [ALTAR_PART_ID_SOUL_HERBS]: ['mist_herbs'],
}

/**
 * Дополнительные каталожные id для слота планировщика (merge поверх базового пула кандидатов).
 * @see docs/systems/ENCHANTMENT_MODULE_PHASE2_ALTAR_CONSTRUCTION.md §4.2
 */
export function getAltarForgeExtraMaterialIds(partId: string): readonly string[] {
  return ALTAR_FORGE_EXTRA_MATERIAL_IDS_BY_PART[partId] ?? []
}

export function isForgottenForgeAltarRecipe(recipeId: string): boolean {
  return recipeId === FORGOTTEN_FORGE_ALTAR_RECIPE_ID
}
