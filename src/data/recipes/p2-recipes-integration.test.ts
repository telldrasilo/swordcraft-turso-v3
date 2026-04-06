/**
 * P2: каталог v2 — только формы; шаблоны заказов — weaponRecipes из legacy-recipe-rows.
 */

import { describe, expect, it } from 'vitest'
import { allRecipes, getRecipeById } from '@/data/recipes'
import { weaponRecipes } from '@/data/weapon-recipes'
import { LEGACY_WEAPON_RECIPE_ROWS } from '@/data/recipes/legacy-recipe-rows'

describe('recipe catalog (form-only v2)', () => {
  it('allRecipes содержит basic_sword и basic_mace, без iron_sword', () => {
    expect(getRecipeById('basic_sword')).toBeDefined()
    expect(getRecipeById('basic_mace')).toBeDefined()
    expect(getRecipeById('iron_sword')).toBeUndefined()
  })

  it('v2 basic_sword — форма без полей заказа', () => {
    const r = getRecipeById('basic_sword')
    expect(r?.parts.length).toBeGreaterThan(0)
    expect((r as Record<string, unknown> | undefined)?.orderMaterial).toBeUndefined()
  })

  it('weaponRecipes (заказы) совпадает по числу с legacy-rows и ссылается на форму', () => {
    expect(weaponRecipes.length).toBe(LEGACY_WEAPON_RECIPE_ROWS.length)
    const iron = weaponRecipes.find((w) => w.id === 'iron_sword')
    expect(iron?.shapeRecipeId).toBe('basic_sword')
    expect(iron?.material as string).toBe('iron')
  })

  it('id форм уникальны в allRecipes', () => {
    const ids = allRecipes.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
