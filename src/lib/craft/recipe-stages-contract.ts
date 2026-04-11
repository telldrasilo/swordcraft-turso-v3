/**
 * Компактная сериализация `stages` для контрактных тестов / снимков CI (RECIPE_TEMPLATE §14).
 */

import type { WeaponRecipe } from '@/types/craft-v2'

export type RecipeStageContractRow = {
  stageType: string
  material: string | null
  target: string | null
}

export function recipeStagesContractRows(stages: WeaponRecipe['stages']): RecipeStageContractRow[] {
  return stages.map(s => ({
    stageType: s.stageType,
    material: s.material ?? null,
    target: s.target ?? null,
  }))
}

/** Стабильная однострочная строка для `toMatchSnapshot` (без пробелов вокруг `:`). */
export function serializeRecipeStagesContract(stages: WeaponRecipe['stages']): string {
  return JSON.stringify(recipeStagesContractRows(stages))
}
