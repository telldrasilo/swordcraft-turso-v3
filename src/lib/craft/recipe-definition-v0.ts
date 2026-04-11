/**
 * Шаблон рецепта v0 → полный `WeaponRecipe` (CRAFT_LINE фаза 5, заготовка под CI).
 */

import type { WeaponRecipe } from '@/types/craft-v2'
import { createBasicSwordWeaponRecipe } from '@/data/recipes/basic-sword-recipe'
import { createCeremonialSwordWeaponRecipe } from '@/data/recipes/ceremonial-sword-recipe'

export interface RecipeDefinitionV0 {
  readonly id: string
  materialize(): WeaponRecipe
}

export const RECIPE_DEFINITIONS_V0: readonly RecipeDefinitionV0[] = [
  {
    id: 'basic_sword',
    materialize: createBasicSwordWeaponRecipe,
  },
  {
    id: 'ceremonial_sword',
    materialize: createCeremonialSwordWeaponRecipe,
  },
]

export function getRecipeDefinitionV0(defId: string): RecipeDefinitionV0 | undefined {
  return RECIPE_DEFINITIONS_V0.find(d => d.id === defId)
}
