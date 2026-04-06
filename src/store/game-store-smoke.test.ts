/**
 * P2-Store-03: дымовой тест composed store (без UI).
 */

import { describe, it, expect } from 'vitest'
import { useGameStore } from '@/store/game-store-composed'

describe('game-store smoke', () => {
  it('стартовые разблокировки оружия: только basic_sword; остальные формы — у интенданта', () => {
    const { unlockedRecipes } = useGameStore.getState()
    expect(unlockedRecipes.weaponRecipes).toEqual(['basic_sword'])
    expect(unlockedRecipes.weaponRecipes).not.toContain('basic_mace')
    expect(unlockedRecipes.weaponRecipes).not.toContain('iron_sword')
  })

  it('getRecipeById доступен через материалы/рецепты — магазин не ломается', () => {
    const { unlockedRecipes } = useGameStore.getState()
    expect(unlockedRecipes.refiningRecipes.length).toBeGreaterThan(0)
  })
})
