/**
 * Разблокированные **техники обработки** (плавка и т.п.) для планировщика и калькулятора.
 * Боевые приёмы (`allTechniques`) сюда не входят — их список задаётся отдельно.
 */

export interface PlannerUnlockedTechniquesInput {
  playerLevel: number
  unlockedMaterialProcessingTechniqueIds: string[]
}

/** Уровень, с которого в MVP доступна тщательная плавка без отдельной награды. */
export const FINE_IRON_SMELT_UNLOCK_LEVEL = 5

/** Уровень для базовой плавки меди в кузне (совпадает с `requiredLevel` рецепта `copper_ingot`). */
export const BASIC_COPPER_SMELT_UNLOCK_LEVEL = 3

/** Уровень для базовой плавки мифрила в кузне (совпадает с `requiredLevel` рецепта `mithril_ingot`). */
export const BASIC_MITHRIL_SMELT_UNLOCK_LEVEL = 20

/** Совпадает с `requiredLevel` рецептов плавильни (`refining-recipes.ts`). */
export const BASIC_TIN_SMELT_UNLOCK_LEVEL = 3
export const BASIC_BRONZE_SMELT_UNLOCK_LEVEL = 5
export const BASIC_STEEL_SMELT_UNLOCK_LEVEL = 8
export const BASIC_SILVER_SMELT_UNLOCK_LEVEL = 10
export const BASIC_GOLD_SMELT_UNLOCK_LEVEL = 15

export function getPlannerUnlockedTechniqueIds(
  input: PlannerUnlockedTechniquesInput
): string[] {
  const level = Math.max(1, input.playerLevel)
  const extra = input.unlockedMaterialProcessingTechniqueIds ?? []
  const set = new Set<string>([...extra])
  if (level >= BASIC_COPPER_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_copper_smelt')
  }
  if (level >= BASIC_TIN_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_tin_smelt')
  }
  if (level >= BASIC_BRONZE_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_bronze_smelt')
  }
  if (level >= BASIC_STEEL_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_steel_smelt')
  }
  if (level >= BASIC_SILVER_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_silver_smelt')
  }
  if (level >= BASIC_GOLD_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_gold_smelt')
  }
  if (level >= FINE_IRON_SMELT_UNLOCK_LEVEL) {
    set.add('forge_fine_iron_smelt')
  }
  if (level >= BASIC_MITHRIL_SMELT_UNLOCK_LEVEL) {
    set.add('forge_basic_mithril_smelt')
  }
  return [...set]
}
