import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { RepairType, WeaponRepairCalc } from '@/data/repair-system'
import type { Worker } from '@/store/slices/workers-slice'
import {
  applyRepairToWeapon,
  calculateMaxRepairPercent,
  calculateRepairCost,
  canRepair,
  craftedWeaponV2ToWeaponRepairCalc,
  executeRepair,
  getMaterialDeductions,
  getRepairOptionsForWeapon,
} from '@/lib/store-utils/repair-utils'

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('maps numeric tier index to WeaponRepairCalc tier', () => {
    const w = { ...minimalWeapon(), tier: 3 }
    expect(craftedWeaponV2ToWeaponRepairCalc(w).tier).toBe('rare')
  })
})

const baseCalc = (): WeaponRepairCalc => ({
  tier: 'common',
  durability: 50,
  maxDurability: 100,
  warSoul: 5,
  attack: 20,
  epicMultiplier: 1,
  materials: {},
})

describe('calculateRepairCost', () => {
  it('returns 0 when nothing to restore', () => {
    expect(calculateRepairCost({ ...baseCalc(), durability: 100 }, 0)).toBe(0)
  })

  it('scales by tier and applies player discount (capped)', () => {
    const lost10 = { ...baseCalc(), durability: 90, maxDurability: 100 }
    expect(calculateRepairCost(lost10, 0)).toBe(10)

    const epic = { ...lost10, tier: 'epic' as const }
    expect(calculateRepairCost(epic, 0)).toBe(30)

    expect(calculateRepairCost(lost10, 10)).toBe(5)
  })
})

describe('calculateMaxRepairPercent', () => {
  it('uses 50 + level * 5 and caps at 100', () => {
    expect(calculateMaxRepairPercent(0)).toBe(50)
    expect(calculateMaxRepairPercent(5)).toBe(75)
    expect(calculateMaxRepairPercent(10)).toBe(100)
  })
})

describe('canRepair', () => {
  it('blocks full durability and gold checks', () => {
    expect(canRepair({ ...baseCalc(), durability: 100 }, 999, {}, 0).can).toBe(false)

    const damaged = { ...baseCalc(), durability: 50 }
    expect(canRepair(damaged, 0, {}, 0).can).toBe(false)
    expect(canRepair(damaged, 999, {}, 0).can).toBe(true)
  })
})

describe('getRepairOptionsForWeapon', () => {
  it('returns options from repair system', () => {
    const opts = getRepairOptionsForWeapon(baseCalc(), null)
    expect(Array.isArray(opts)).toBe(true)
    expect(opts.length).toBeGreaterThan(0)
  })
})

describe('executeRepair', () => {
  const weaponWithIron: WeaponRepairCalc = {
    ...baseCalc(),
    materials: { iron: 20 },
  }

  /** Ремонт всегда требует уголь в опции — см. getRepairMaterials */
  const plenty = { iron: 999, coal: 999 }

  it('fails when repair type is not in options', () => {
    const r = executeRepair(weaponWithIron, 'enhancement', null, 9999, plenty)
    expect(r.success).toBe(false)
    expect(r.error).toBe('Опция ремонта недоступна')
  })

  it('fails when materials are insufficient', () => {
    const r = executeRepair(weaponWithIron, 'quality', null, 9999, { iron: 0, coal: 999 })
    expect(r.success).toBe(false)
    expect(r.error).toMatch(/Недостаточно материалов/)
  })

  it('fails when gold is insufficient', () => {
    const r = executeRepair(weaponWithIron, 'quality', null, 0, plenty)
    expect(r.success).toBe(false)
    expect(r.error).toBe('Недостаточно золота')
  })

  it('fails when blacksmith stamina is too low', () => {
    const smith: Worker = {
      id: 'w1',
      name: 'Test',
      class: 'blacksmith',
      level: 10,
      experience: 0,
      stamina: 0,
      stats: {
        speed: 1,
        quality: 1,
        stamina_max: 100,
        intelligence: 1,
        loyalty: 1,
      },
      assignment: '',
      hiredAt: 0,
      hireCost: 0,
    }
    const r = executeRepair(weaponWithIron, 'quality', smith, 9999, plenty)
    expect(r.success).toBe(false)
    expect(r.error).toBe('У кузнеца недостаточно сил')
  })

  it('returns success when validation passes and repair roll succeeds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const r = executeRepair(weaponWithIron, 'quality', null, 9999, plenty)
    expect(r.success).toBe(true)
    expect(r.result?.success).toBe(true)
    expect(r.result?.durabilityRestored).toBeGreaterThan(0)
  })
})

describe('getMaterialDeductions', () => {
  it('returns materials map for a valid repair type', () => {
    const w: WeaponRepairCalc = { ...baseCalc(), materials: { iron: 10 } }
    const m = getMaterialDeductions('quick', w, null)
    expect(Object.keys(m).length).toBeGreaterThan(0)
    expect((m as { iron?: number }).iron).toBeDefined()
  })

  it('returns empty object when type does not match any option', () => {
    const w = baseCalc()
    const m = getMaterialDeductions('not_a_type' as unknown as RepairType, w, null)
    expect(m).toEqual({})
  })
})

describe('applyRepairToWeapon', () => {
  it('clamps durability to 100 and floors negative-side stats', () => {
    const w = { ...baseCalc(), id: 'x', durability: 95 }
    const next = applyRepairToWeapon(w, {
      success: true,
      durabilityRestored: 20,
      maxDurabilityBefore: 100,
      maxDurabilityAfter: 100,
      soulLost: 10,
      attackLost: 25,
      epicLost: 2,
      criticalFailure: false,
    })
    expect(next.durability).toBe(100)
    expect(next.warSoul).toBe(0)
    expect(next.attack).toBe(1)
    expect(next.epicMultiplier).toBe(1)
  })
})
