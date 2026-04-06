import { describe, expect, it } from 'vitest'
import type { CraftPlan } from '@/types/craft-v2'
import {
  migrateCraftPlanRecipeId,
  migrateUnlockedWeaponRecipeIds,
} from '@/lib/recipe-id-migrate'

describe('recipe-id-migrate', () => {
  it('maps iron_* unlocks to shape ids', () => {
    const out = migrateUnlockedWeaponRecipeIds(['iron_sword', 'iron_dagger', 'long_sword'])
    expect(out).toContain('basic_sword')
    expect(out).toContain('basic_dagger')
    expect(out).toContain('long_sword')
    expect(out).not.toContain('iron_sword')
  })

  it('rewrites craft plan recipeId from template to shape', () => {
    const planIn: CraftPlan = {
      recipeId: 'iron_axe',
      materials: {},
      techniques: [],
      shouldPurchaseMaterials: false,
      estimatedTime: 0,
      estimatedStats: {
        attack: 0,
        durability: 0,
        maxDurability: 0,
        weight: 0,
        balance: 0,
        soulCapacity: 0,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 0,
      },
      estimatedQuality: 'common',
    }
    const plan = migrateCraftPlanRecipeId(planIn)
    expect(plan?.recipeId).toBe('basic_axe')
  })
})
