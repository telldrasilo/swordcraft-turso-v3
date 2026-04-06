/**
 * Миграция id рецептов: линейки заказов (iron_sword, …) убраны из allRecipes;
 * в кузнице остаются только формы. Старые сохранения чиним здесь.
 */

import { LEGACY_WEAPON_RECIPE_ROWS } from '@/data/recipes/legacy-recipe-rows'
import { defaultShapeRecipeIdForWeaponType, legacyWeaponRecipeRowIds } from '@/data/weapon-recipes'
import type { CraftedWeaponV2, CraftPlan, ActiveCraftV2 } from '@/types/craft-v2'

const legacyRowById = new Map(LEGACY_WEAPON_RECIPE_ROWS.map((r) => [r.id, r]))

/** Стартовый набор форм v2 (как в craft-slice initialUnlockedRecipes). */
export const STARTER_SHAPE_RECIPE_IDS: readonly string[] = [
  'basic_sword',
  'basic_dagger',
  'basic_axe',
  'basic_mace',
  'basic_spear',
  'basic_hammer',
]

function shapeIdsFromLegacyTemplateId(templateId: string): string[] {
  const row = legacyRowById.get(templateId)
  const base = defaultShapeRecipeIdForWeaponType(row?.type ?? 'sword')
  if (!row) return [base]

  const out = new Set<string>([base])
  if (row.type === 'sword' && row.tier !== 'common') out.add('long_sword')
  if (row.type === 'axe' && row.tier !== 'common') out.add('battle_axe')
  return [...out]
}

/**
 * Нормализовать список разблокированных рецептов оружия после удаления линеек из каталога v2.
 */
export function migrateUnlockedWeaponRecipeIds(saved: string[] | undefined): string[] {
  const raw = saved?.length ? [...saved] : [...STARTER_SHAPE_RECIPE_IDS]
  const out = new Set<string>()

  for (const id of raw) {
    if (legacyWeaponRecipeRowIds.has(id)) {
      for (const s of shapeIdsFromLegacyTemplateId(id)) out.add(s)
    } else {
      out.add(id)
    }
  }
  for (const s of STARTER_SHAPE_RECIPE_IDS) out.add(s)
  return [...out]
}

export function migrateCraftPlanRecipeId(plan: CraftPlan | null): CraftPlan | null {
  if (!plan) return null
  const rid = plan.recipeId
  if (legacyWeaponRecipeRowIds.has(rid)) {
    const row = legacyRowById.get(rid)
    if (!row) return plan
    return { ...plan, recipeId: defaultShapeRecipeIdForWeaponType(row.type) }
  }
  return plan
}

export function migrateActiveCraftV2RecipeId(craft: ActiveCraftV2 | null): ActiveCraftV2 | null {
  if (!craft?.plan) return craft
  const plan = migrateCraftPlanRecipeId(craft.plan)
  if (!plan || plan === craft.plan) return craft
  return { ...craft, plan }
}

export function migrateCraftedWeaponV2RecipeId(w: CraftedWeaponV2): CraftedWeaponV2 {
  const rid = w.recipeId
  if (!rid || !legacyWeaponRecipeRowIds.has(rid)) return w
  const row = legacyRowById.get(rid)
  if (!row) return w
  return { ...w, recipeId: defaultShapeRecipeIdForWeaponType(row.type) }
}
