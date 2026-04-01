import { describe, expect, it } from 'vitest'
import type { MaterialAssignment } from '@/types/craft-v2'
import { getRecipeById } from '@/data/recipes'
import type { LegacyWeaponRecipe } from '@/data/weapon-recipes'
import type { Resources } from '@/store/slices/resources-slice'
import {
  calculateCraftRequirements,
  checkInventoryForCraft,
  getCraftingCost,
  getMaterialAmountInInventory,
  getResourceKeyForMaterial,
  hasMaterialInInventory,
} from './inventory-check'

const emptyInventory = (): Resources => ({
  gold: 0,
  soulEssence: 0,
  wood: 0,
  stone: 0,
  iron: 0,
  coal: 0,
  copper: 0,
  tin: 0,
  silver: 0,
  goldOre: 0,
  mithril: 0,
  ironIngot: 0,
  copperIngot: 0,
  tinIngot: 0,
  bronzeIngot: 0,
  steelIngot: 0,
  silverIngot: 0,
  goldIngot: 0,
  mithrilIngot: 0,
  planks: 0,
  stoneBlocks: 0,
  leather: 0,
})

describe('getResourceKeyForMaterial', () => {
  it('maps known craft ids to inventory keys', () => {
    expect(getResourceKeyForMaterial('iron')).toBe('iron')
    expect(getResourceKeyForMaterial('steel')).toBe('steelIngot')
    expect(getResourceKeyForMaterial('oak')).toBe('wood')
  })

  it('returns null for unknown id', () => {
    expect(getResourceKeyForMaterial('nonexistent_material_xyz')).toBeNull()
  })
})

describe('hasMaterialInInventory / getMaterialAmountInInventory', () => {
  it('reads mapped resource counts', () => {
    const inv = { ...emptyInventory(), iron: 5 }
    expect(hasMaterialInInventory('iron', 5, inv)).toBe(true)
    expect(hasMaterialInInventory('iron', 6, inv)).toBe(false)
    expect(getMaterialAmountInInventory('iron', inv)).toBe(5)
  })

  it('returns false / 0 when material is not mapped', () => {
    const inv = emptyInventory()
    expect(hasMaterialInInventory('nonexistent_material_xyz', 1, inv)).toBe(false)
    expect(getMaterialAmountInInventory('nonexistent_material_xyz', inv)).toBe(0)
  })
})

describe('getCraftingCost (legacy recipe)', () => {
  it('copies recipe cost and adds forge coal', () => {
    const recipe = {
      id: 'legacy_test',
      name: 'Test',
      type: 'sword',
      tier: 'common',
      material: 'iron',
      cost: { iron: 7 },
      baseCraftTime: 60,
      baseSellPrice: 10,
      requiredLevel: 1,
      description: '',
      unlocked: true,
    } as LegacyWeaponRecipe

    expect(getCraftingCost(recipe, {})).toEqual({ iron: 7, coal: 3 })
  })
})

const basicSwordSelections = (): MaterialAssignment => ({
  blade: { materialId: 'iron', quantity: 3 },
  guard: { materialId: 'iron', quantity: 1 },
  grip: { materialId: 'oak', quantity: 1 },
  pommel: { materialId: 'iron', quantity: 1 },
})

describe('calculateCraftRequirements (V2)', () => {
  it('aggregates iron and wood from real recipe parts', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const map = calculateCraftRequirements(recipe!, basicSwordSelections())
    expect(map.get('iron')?.amount).toBe(5)
    expect(map.get('wood')?.amount).toBe(1)
  })

  it('expands steel alloy into raw iron and coal', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const map = calculateCraftRequirements(recipe!, {
      blade: { materialId: 'steel', quantity: 3 },
    })
    expect(map.get('iron')?.amount).toBe(6)
    expect(map.get('coal')?.amount).toBe(3)
  })
})

describe('checkInventoryForCraft', () => {
  it('returns canCraft when resources and forge coal are sufficient', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const inv = { ...emptyInventory(), iron: 20, wood: 10, coal: 5 }
    const r = checkInventoryForCraft(recipe!, basicSwordSelections(), inv)
    expect(r.canCraft).toBe(true)
    expect(r.missing.length).toBe(0)
    expect(r.fuelRequired?.sufficient).toBe(true)
  })

  it('sets canCraft false when materials are missing', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const inv = { ...emptyInventory(), iron: 1, wood: 0, coal: 5 }
    const r = checkInventoryForCraft(recipe!, basicSwordSelections(), inv)
    expect(r.canCraft).toBe(false)
    expect(r.missing.length).toBeGreaterThan(0)
    expect(r.requirements.some(q => q.resourceKey === 'iron')).toBe(true)
  })

  it('fails when forge coal is below base quantity', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const inv = { ...emptyInventory(), iron: 50, wood: 10, coal: 1 }
    const r = checkInventoryForCraft(recipe!, basicSwordSelections(), inv)
    expect(r.canCraft).toBe(false)
    expect(r.fuelRequired?.sufficient).toBe(false)
  })

  it('fills breakdownByPart for each selected part', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    const r = checkInventoryForCraft(recipe!, basicSwordSelections(), emptyInventory())
    expect(r.breakdownByPart.length).toBe(4)
    const blade = r.breakdownByPart.find(b => b.partId === 'blade')
    expect(blade?.materialId).toBe('iron')
  })
})

describe('getCraftingCost (V2 + selections)', () => {
  it('sums requirements from materialSelections and adds forge coal', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    expect(getCraftingCost(recipe!, basicSwordSelections())).toEqual({
      iron: 5,
      wood: 1,
      coal: 3,
    })
  })
})
