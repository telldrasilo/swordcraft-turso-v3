import { describe, expect, it } from 'vitest'
import {
  FORGE_MATERIAL_STAGE_ALIASES,
  migrateCraftedWeaponForgeMaterials,
  migrateCraftPlanForgeMaterials,
} from '@/lib/craft/forge-material-migrate'
import type { CraftPlan } from '@/types/craft-v2'

describe('forge-material-migrate', () => {
  it('алиасы содержат iron → iron_alloy', () => {
    expect(FORGE_MATERIAL_STAGE_ALIASES.iron).toBe('iron_alloy')
    expect(FORGE_MATERIAL_STAGE_ALIASES.mithril).toBe('mithril_alloy')
  })

  it('migrateCraftPlanForgeMaterials переписывает материалы плана', () => {
    const plan: CraftPlan = {
      recipeId: 'basic_sword',
      materials: {
        blade: { materialId: 'iron', quantity: 3 },
        grip: { materialId: 'birch', quantity: 1 },
      },
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
        repairPotential: 0,
        enchantSlots: 0,
        enchantPower: 0,
      },
      estimatedQuality: 'common',
    }
    const out = migrateCraftPlanForgeMaterials(plan)
    if (!out) throw new Error('plan')
    expect(out.materials.blade.materialId).toBe('iron_alloy')
    expect(out.materials.grip.materialId).toBe('birch')
  })

  it('migrateCraftedWeaponForgeMaterials обновляет записи частей', () => {
    const w = migrateCraftedWeaponForgeMaterials({
      id: 'w1',
      recipeId: 'basic_sword',
      prefix: '',
      baseName: 'меч',
      suffix: '',
      fullName: 'меч',
      type: 'sword',
      tier: 1,
      materials: [
        { partId: 'blade', materialId: 'mithril', materialName: 'Мифрил', quantity: 2 },
      ],
      stats: {
        attack: 1,
        durability: 1,
        maxDurability: 1,
        weight: 1,
        balance: 1,
        soulCapacity: 1,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 0,
      },
      quality: 50,
      qualityGrade: 'common',
      qualityRank: 'C',
      warSoul: 0,
      maxWarSoul: 0,
      createdAt: 0,
      adventureCount: 0,
      sellPrice: 0,
      hiddenTags: ['sword', 'mithril', 'q:50', 'rank:C'],
      combatMaterialId: 'mithril',
      currentDurability: 100,
      epicMultiplier: 1,
      techniquesUsed: [],
      activeDamageTags: [],
      weaponLegacy: { hiddenMarks: [] },
      repairCondition: 'ok',
    })
    expect(w.materials[0]?.materialId).toBe('mithril_alloy')
    expect(w.combatMaterialId).toBe('mithril_alloy')
    expect(w.hiddenTags[1]).toBe('mithril_alloy')
  })
})
