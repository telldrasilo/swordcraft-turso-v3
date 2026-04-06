import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CraftedWeaponV2 } from '@/types/craft-v2'
import type { RepairType, WeaponRepairCalc } from '@/data/repair-system'
import {
  applyMasteryDiscountToTechniquePlanCost,
  applyRepairToWeapon,
  craftedWeaponV2ToWeaponRepairCalc,
  executeRepair,
  getMaterialDeductions,
  getRepairAutoPickMaterialMarkup,
  getRepairOptionsForWeapon,
  getWeaponAutoRepairGoldCost,
  mapTechniqueIdsToRepairDiceProfile,
  mapTechniqueIdsToRepairTypeForDice,
  pickRepairTypeAllowedByTags,
  resolveWeaponRepairPlanEconomy,
} from '@/lib/store-utils/repair-utils'
import { DURABILITY_MAINTENANCE_TECHNIQUE_ID } from '@/data/weapon-damage/repair-techniques-registry'
import { buildWeaponRepairPlan } from '@/lib/weapon-damage/build-repair-plan'
import type { ActiveDamageTagEntry } from '@/types/weapon-damage'

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
  activeDamageTags: [],
  weaponLegacy: { hiddenMarks: [] },
  repairCondition: 'ok',
})

describe('craftedWeaponV2ToWeaponRepairCalc', () => {
  it('maps durability and tier for repair model', () => {
    const m = craftedWeaponV2ToWeaponRepairCalc(minimalWeapon())
    expect(m.durability).toBe(70)
    expect(m.maxDurability).toBe(100)
    expect(m.tier).toBe('common')
    expect(m.materials.ironIngot).toBe(2)
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

describe('getRepairOptionsForWeapon', () => {
  it('returns options from repair system', () => {
    const opts = getRepairOptionsForWeapon(baseCalc(), 1)
    expect(Array.isArray(opts)).toBe(true)
    expect(opts.length).toBeGreaterThan(0)
    expect(opts.every((o) => o.goldCost === 0)).toBe(true)
  })
})

describe('executeRepair', () => {
  const weaponWithIron: WeaponRepairCalc = {
    ...baseCalc(),
    materials: { ironIngot: 20 },
  }

  /** Ремонт всегда требует уголь в опции — см. getRepairMaterials */
  const plenty = { ironIngot: 999, coal: 999 }

  it('fails when repair type is not in options', () => {
    const r = executeRepair(weaponWithIron, 'enhancement', 1, plenty)
    expect(r.success).toBe(false)
    expect(r.error).toBe('Опция ремонта недоступна')
  })

  it('fails when materials are insufficient', () => {
    const r = executeRepair(weaponWithIron, 'quality', 1, { ironIngot: 0, coal: 999 })
    expect(r.success).toBe(false)
    expect(r.error).toMatch(/Недостаточно материалов/)
  })

  it('returns success when validation passes and repair roll succeeds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const r = executeRepair(weaponWithIron, 'quality', 1, plenty)
    expect(r.success).toBe(true)
    expect(r.result?.success).toBe(true)
    expect(r.result?.durabilityRestored).toBeGreaterThan(0)
  })

  it('counts materialStash toward repair material cost', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const r = executeRepair(
      weaponWithIron,
      'quality',
      1,
      { ironIngot: 0, coal: 999 },
      { iron_alloy: 999 }
    )
    expect(r.success).toBe(true)
  })
})

describe('getMaterialDeductions', () => {
  it('returns materials map for a valid repair type', () => {
    const w: WeaponRepairCalc = { ...baseCalc(), materials: { ironIngot: 10 } }
    const m = getMaterialDeductions('quick', w, 1)
    expect(Object.keys(m).length).toBeGreaterThan(0)
    expect((m as { ironIngot?: number }).ironIngot).toBeDefined()
  })

  it('returns empty object when type does not match any option', () => {
    const w = baseCalc()
    const m = getMaterialDeductions('not_a_type' as unknown as RepairType, w, 1)
    expect(m).toEqual({})
  })
})

describe('technique plan repair helpers', () => {
  it('mapTechniqueIdsToRepairDiceProfile uses standard for durability maintenance only', () => {
    expect(mapTechniqueIdsToRepairDiceProfile([DURABILITY_MAINTENANCE_TECHNIQUE_ID])).toBe('standard')
    expect(mapTechniqueIdsToRepairTypeForDice([DURABILITY_MAINTENANCE_TECHNIQUE_ID])).toBe('standard')
  })

  it('mapTechniqueIdsToRepairDiceProfile uses restoration for heavy soul/binding techniques', () => {
    expect(mapTechniqueIdsToRepairDiceProfile(['blade_soul_tending'])).toBe('restoration')
    expect(mapTechniqueIdsToRepairDiceProfile(['binding_relief'])).toBe('restoration')
    expect(mapTechniqueIdsToRepairDiceProfile(['edge_truing'])).toBe('standard')
  })

  it('resolveWeaponRepairPlanEconomy uses standard repair materials for durability maintenance; no gold', () => {
    const plan = buildWeaponRepairPlan([DURABILITY_MAINTENANCE_TECHNIQUE_ID])
    expect(plan).not.toBeNull()
    if (!plan) return
    const econ = resolveWeaponRepairPlanEconomy(minimalWeapon(), plan, 5)
    expect(econ.gold).toBe(0)
    expect(Object.keys(econ.materials).length).toBeGreaterThan(0)
  })

  it('pickRepairTypeAllowedByTags respects skverna allowedRepairTechniqueIds (G1)', () => {
    const tags: ActiveDamageTagEntry[] = [{ tagId: 'elemental_skverna_taint', severity: 'moderate' }]
    expect(pickRepairTypeAllowedByTags('quick', tags)).toBe('quality')
    expect(pickRepairTypeAllowedByTags('restoration', tags)).toBe('restoration')
  })

  it('applyMasteryDiscountToTechniquePlanCost scales materials only; gold always 0', () => {
    const plan = buildWeaponRepairPlan(['edge_truing'])
    expect(plan).not.toBeNull()
    if (!plan) return
    const discounted = applyMasteryDiscountToTechniquePlanCost(plan, 10)
    expect(discounted.gold).toBe(0)
    expect(discounted.materials.ironIngot).toBeGreaterThan(0)
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

describe('getWeaponRepairPowerScore / auto gold / auto-pick markup', () => {
  it('getRepairAutoPickMaterialMarkup растёт с атакой и ограничен min–max', () => {
    const low = { ...minimalWeapon(), stats: { ...minimalWeapon().stats, attack: 5 } }
    const high = { ...minimalWeapon(), stats: { ...minimalWeapon().stats, attack: 90 } }
    const mLow = getRepairAutoPickMaterialMarkup(low)
    const mHigh = getRepairAutoPickMaterialMarkup(high)
    expect(mHigh).toBeGreaterThanOrEqual(mLow)
    expect(mLow).toBeGreaterThanOrEqual(1.08)
    expect(mHigh).toBeLessThanOrEqual(1.35)
  })

  it('getWeaponAutoRepairGoldCost положителен', () => {
    expect(getWeaponAutoRepairGoldCost(minimalWeapon())).toBeGreaterThan(0)
  })
})
