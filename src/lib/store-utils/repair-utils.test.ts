import { describe, expect, it } from 'vitest'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import { craftedWeaponV2ToWeaponRepairCalc } from '@/lib/store-utils/repair-utils'

const minimalWeapon = (): CraftedWeaponV2 => ({
  id: 'w1',
  recipeId: 'basic_sword',
  prefix: 'Железный',
  baseName: 'меч',
  suffix: '',
  fullName: 'Железный меч',
  type: 'sword',
  tier: 1,
  materials: [{ partId: 'blade', materialId: 'iron', materialName: 'Железо', quantity: 2 }],
  stats: {
    attack: 20,
    durability: 80,
    maxDurability: 100,
    weight: 1,
    balance: 50,
    soulCapacity: 10,
    repairPotential: 1,
    enchantSlots: 0,
    enchantPower: 0,
  },
  quality: 50,
  qualityGrade: 'common',
  qualityRank: 'C',
  warSoul: 0,
  maxWarSoul: 10,
  createdAt: 0,
  adventureCount: 0,
  sellPrice: 10,
  hiddenTags: [],
  combatMaterialId: 'iron',
  currentDurability: 70,
  epicMultiplier: 1,
  techniquesUsed: [],
})

describe('craftedWeaponV2ToWeaponRepairCalc', () => {
  it('maps durability and tier for repair model', () => {
    const m = craftedWeaponV2ToWeaponRepairCalc(minimalWeapon())
    expect(m.durability).toBe(70)
    expect(m.maxDurability).toBe(100)
    expect(m.tier).toBe('common')
    expect(m.materials.iron).toBe(2)
  })
})
