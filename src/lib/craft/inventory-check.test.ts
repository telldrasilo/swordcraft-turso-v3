import { describe, expect, it } from 'vitest'
import type { MaterialAssignment } from '@/types/craft-v2'
import { getRecipeById } from '@/data/recipes'
import type { LegacyWeaponRecipe } from '@/data/weapon-recipes'
import type { ResourceKey, Resources } from '@/store/slices/resources-slice'
import { getRefiningRecipe } from '@/data/refining-recipes'
import {
  applyCraftingCostSpend,
  applyRefiningFullSpend,
  calculateCraftRequirements,
  canAffordCraftingCostWithStash,
  canAffordRefiningStart,
  canCatalogMaterialSpendInForgeCraft,
  checkInventoryForCraft,
  computePoolSpendDeltas,
  computeRefiningSmeltingOutputMultiplier,
  getCatalogMaterialIdsForResourceKey,
  getCraftingCost,
  getRefiningCraftingCost,
  getMaterialAmountInInventory,
  getAvailableAmountForResourceKey,
  getGrantTargetMaterialId,
  getResourceKeyForMaterial,
  hasMaterialInInventory,
  migrateLegacyMaterialResourcesToStash,
  removeResourceKeyFromPools,
  RESOURCE_GRANT_STASH_FALLBACK,
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

describe('migrateLegacyMaterialResourcesToStash', () => {
  it('moves mapped resource amounts into stash and zeros resources', () => {
    const inv = { ...emptyInventory(), iron: 10, gold: 100 }
    const stash = { iron: 2 }
    const out = migrateLegacyMaterialResourcesToStash(inv, stash)
    expect(out.resources.iron).toBe(0)
    expect(out.resources.gold).toBe(100)
    expect(out.materialStash.iron_ore).toBe(12)
  })

  it('is idempotent when resources material keys are already zero', () => {
    const inv = { ...emptyInventory(), gold: 50 }
    const stash = { iron_ore: 5 }
    const out = migrateLegacyMaterialResourcesToStash(inv, stash)
    expect(out.resources.gold).toBe(50)
    expect(out.materialStash).toEqual(stash)
    expect(out.resources.iron).toBe(0)
  })

  it('merges pre-phase-3 stash keys (iron) into canonical ore ids', () => {
    const inv = emptyInventory()
    const out = migrateLegacyMaterialResourcesToStash(inv, { iron: 4, iron_ore: 1 })
    expect(out.materialStash.iron_ore).toBe(5)
    expect(out.materialStash.iron).toBeUndefined()
  })

  it('is idempotent: second application does not change resources or stash (2.4 sweep)', () => {
    const inv = { ...emptyInventory(), iron: 5, coal: 2 }
    const stash: Record<string, number> = { iron_ore: 1 }
    const m1 = migrateLegacyMaterialResourcesToStash(inv, stash)
    const m2 = migrateLegacyMaterialResourcesToStash(m1.resources, m1.materialStash)
    expect(m2.resources).toEqual(m1.resources)
    expect(m2.materialStash).toEqual(m1.materialStash)
    expect(m2.resources.iron).toBe(0)
    expect(m2.resources.coal).toBe(0)
  })

  it('RESOURCE_GRANT_STASH_FALLBACK aligns with getGrantTargetMaterialId (bridge subset)', () => {
    for (const [rk, mid] of Object.entries(RESOURCE_GRANT_STASH_FALLBACK)) {
      expect(getGrantTargetMaterialId(rk as ResourceKey)).toBe(mid)
    }
  })
})

describe('getGrantTargetMaterialId', () => {
  it('returns null for currency / essence', () => {
    expect(getGrantTargetMaterialId('gold')).toBeNull()
    expect(getGrantTargetMaterialId('soulEssence')).toBeNull()
  })

  it('returns canonical ore / raw stage id from refining map (audit phase 3)', () => {
    expect(getGrantTargetMaterialId('iron')).toBe('iron_ore')
    expect(getGrantTargetMaterialId('mithril')).toBe('mithril_ore')
    expect(getGrantTargetMaterialId('goldOre')).toBe('gold_ore')
    expect(getGrantTargetMaterialId('stone')).toBe('basic_stone')
  })

  it('returns catalog id when material key matches ResourceKey', () => {
    expect(getGrantTargetMaterialId('coal')).toBe('coal')
  })

  it('uses explicit fallback for aggregates without same-named material id', () => {
    expect(getGrantTargetMaterialId('wood')).toBe('oak')
    expect(getGrantTargetMaterialId('steelIngot')).toBe('steel')
    expect(getGrantTargetMaterialId('planks')).toBe('processed_wood')
  })
})

describe('getResourceKeyForMaterial', () => {
  it('maps known craft ids to inventory keys', () => {
    expect(getResourceKeyForMaterial('iron')).toBe('ironIngot')
    expect(getResourceKeyForMaterial('iron_ore')).toBe('iron')
    expect(getResourceKeyForMaterial('steel')).toBe('steelIngot')
    expect(getResourceKeyForMaterial('oak')).toBe('wood')
    expect(getResourceKeyForMaterial('coal')).toBe('coal')
  })

  it('returns null for unknown id', () => {
    expect(getResourceKeyForMaterial('nonexistent_material_xyz')).toBeNull()
  })
})

describe('iron and mithril ore pools (TD-INV-1)', () => {
  it('alternative iron ores share ResourceKey iron with iron_ore', () => {
    for (const id of ['iron_ore', 'bog_iron', 'depth_iron', 'cold_iron_ore', 'living_ore'] as const) {
      expect(getResourceKeyForMaterial(id)).toBe('iron')
    }
  })

  it('star_metal maps to mithril pool with mithril_ore', () => {
    expect(getResourceKeyForMaterial('mithril_ore')).toBe('mithril')
    expect(getResourceKeyForMaterial('star_metal')).toBe('mithril')
  })

  it('getAvailableAmountForResourceKey sums stash across all ids in the iron pool', () => {
    const inv = emptyInventory()
    const stash = { iron_ore: 1, bog_iron: 2, cold_iron_ore: 3 }
    expect(getAvailableAmountForResourceKey(inv, stash, 'iron')).toBe(6)
  })
})

describe('wood, leather, and stone pools (TD-INV-1 analog, audit §2.7 / A1)', () => {
  it('getAvailableAmountForResourceKey sums stash across wood pool (core + bridge)', () => {
    const inv = { ...emptyInventory(), wood: 2 }
    const stash = { oak: 1, pine: 2, rotten_wood: 3, spirit_wood: 4 }
    expect(getAvailableAmountForResourceKey(inv, stash, 'wood')).toBe(12)
  })

  it('getAvailableAmountForResourceKey sums leather pool (core + bridge)', () => {
    const inv = emptyInventory()
    const stash = { raw_leather: 2, shadow_leather: 3, dragon_scale: 1 }
    expect(getAvailableAmountForResourceKey(inv, stash, 'leather')).toBe(6)
  })

  it('getAvailableAmountForResourceKey sums stone pool (core + bridge)', () => {
    const inv = { ...emptyInventory(), stone: 5 }
    const stash = { basic_stone: 1, red_stone: 2, clay: 3 }
    expect(getAvailableAmountForResourceKey(inv, stash, 'stone')).toBe(11)
  })
})

describe('computeRefiningSmeltingOutputMultiplier (semantic phase C)', () => {
  it('is 1 for canonical iron_ore only', () => {
    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const inv = { ...emptyInventory() }
    const stash = { iron_ore: 30, coal: 10 }
    expect(computeRefiningSmeltingOutputMultiplier(recipe, 1, inv, stash)).toBeCloseTo(1, 5)
  })

  it('matches bog_iron oreChargeEfficiency when only bog_iron feeds the iron pool', () => {
    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const inv = { ...emptyInventory() }
    const stash = { bog_iron: 30, coal: 10 }
    expect(computeRefiningSmeltingOutputMultiplier(recipe, 1, inv, stash)).toBeCloseTo(0.88, 5)
  })
})

describe('hasMaterialInInventory / getMaterialAmountInInventory', () => {
  it('reads mapped resource counts (catalog iron = слиток, не руда)', () => {
    const inv = { ...emptyInventory(), ironIngot: 5 }
    expect(hasMaterialInInventory('iron', 5, inv)).toBe(true)
    expect(hasMaterialInInventory('iron', 6, inv)).toBe(false)
    expect(getMaterialAmountInInventory('iron', inv)).toBe(5)
  })

  it('суммирует stash и resources для ironIngot (iron_alloy + слиток на складе)', () => {
    const inv = { ...emptyInventory(), ironIngot: 2 }
    const stash = { iron_alloy: 4 }
    expect(getMaterialAmountInInventory('iron', inv, stash)).toBe(6)
    expect(hasMaterialInInventory('iron', 6, inv, stash)).toBe(true)
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
      cost: { ironIngot: 7 },
      baseCraftTime: 60,
      baseSellPrice: 10,
      requiredLevel: 1,
      description: '',
      unlocked: true,
    } as LegacyWeaponRecipe

    expect(getCraftingCost(recipe, {})).toEqual({ ironIngot: 7, coal: 3 })
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
    if (!recipe) throw new Error('fixture: basic_sword')
    const map = calculateCraftRequirements(recipe, basicSwordSelections())
    expect(map.get('ironIngot')?.amount).toBe(5)
    expect(map.get('wood')?.amount).toBe(1)
  })

  it('expands steel alloy into iron ingots and coal', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const map = calculateCraftRequirements(recipe, {
      blade: { materialId: 'steel', quantity: 3 },
    })
    expect(map.get('ironIngot')?.amount).toBe(6)
    expect(map.get('coal')?.amount).toBe(3)
  })
})

describe('canCatalogMaterialSpendInForgeCraft', () => {
  it('is true for mapped catalog ids and steel alloy', () => {
    expect(canCatalogMaterialSpendInForgeCraft('iron')).toBe(true)
    expect(canCatalogMaterialSpendInForgeCraft('oak')).toBe(true)
    expect(canCatalogMaterialSpendInForgeCraft('steel')).toBe(true)
  })

  it('is false for catalog ids without MATERIAL_TO_RESOURCE', () => {
    expect(canCatalogMaterialSpendInForgeCraft('___unmapped_test_material_id___')).toBe(false)
  })

  it('is true for former ENC-only ids after TD-INV-2 bridge', () => {
    expect(canCatalogMaterialSpendInForgeCraft('acorns')).toBe(true)
    expect(canCatalogMaterialSpendInForgeCraft('wild_herbs')).toBe(true)
    expect(canCatalogMaterialSpendInForgeCraft('void_crystal')).toBe(true)
  })
})

describe('partMaterialSupply ore_smelt (phase C)', () => {
  const ironAlloySwordSelections = (): MaterialAssignment => ({
    blade: { materialId: 'iron_alloy', quantity: 3 },
    guard: { materialId: 'iron_alloy', quantity: 1 },
    grip: { materialId: 'oak', quantity: 1 },
    pommel: { materialId: 'iron_alloy', quantity: 1 },
  })

  const bladeOreSupply = {
    blade: {
      mode: 'ore_smelt' as const,
      processingTechniqueId: 'forge_basic_iron_smelt' as const,
    },
  }

  it('getCraftingCost expands only ore-smelt parts to iron ore and smelting coal', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const mats = ironAlloySwordSelections()
    const direct = getCraftingCost(recipe, mats)
    const ore = getCraftingCost(recipe, mats, bladeOreSupply)

    expect(direct.ironIngot).toBe(5)
    expect(direct.planks ?? direct.wood).toBe(1)
    expect(ore.ironIngot).toBe(2)
    expect(ore.iron).toBeCloseTo(9, 5)
    expect(ore.coal).toBeGreaterThan(direct.coal ?? 0)
  })

  it('checkInventoryForCraft allows ore path when ingots are short but iron pool is sufficient', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const mats = ironAlloySwordSelections()
    const inv = {
      ...emptyInventory(),
      ironIngot: 2,
      wood: 10,
      iron: 20,
    }
    const stashCoal15 = { coal: 15 }
    const noOre = checkInventoryForCraft(recipe, mats, inv, {})
    expect(noOre.canCraft).toBe(false)

    const withOre = checkInventoryForCraft(recipe, mats, inv, stashCoal15, bladeOreSupply)
    expect(withOre.canCraft).toBe(true)

    // Раньше проверялись только +3 угля «горна» отдельно от угля плавки — крафт открывали, spend падал.
    const invTightCoal = { ...inv }
    const tight = checkInventoryForCraft(recipe, mats, invTightCoal, { coal: 8 }, bladeOreSupply)
    expect(tight.canCraft).toBe(false)
    expect(tight.missing.some(m => m.resourceKey === 'coal')).toBe(true)
  })
})

describe('checkInventoryForCraft', () => {
  it('blocks craft with forgeSpendBlockReason when material is not on forge warehouse mapping', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const bad: MaterialAssignment = {
      ...basicSwordSelections(),
      grip: { materialId: '___unmapped_test_material_id___', quantity: 1 },
    }
    const r = checkInventoryForCraft(recipe, bad, emptyInventory())
    expect(r.canCraft).toBe(false)
    expect(r.forgeSpendBlockReason).toMatch(/не подключён/i)
    expect(r.requirements.length).toBe(0)
  })

  it('returns canCraft when resources and forge coal are sufficient', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const inv = { ...emptyInventory(), ironIngot: 20, wood: 10 }
    const r = checkInventoryForCraft(recipe, basicSwordSelections(), inv, { coal: 5 })
    expect(r.canCraft).toBe(true)
    expect(r.missing.length).toBe(0)
    expect(r.fuelRequired?.sufficient).toBe(true)
  })

  it('sets canCraft false when materials are missing', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const inv = { ...emptyInventory(), ironIngot: 1, wood: 0 }
    const r = checkInventoryForCraft(recipe, basicSwordSelections(), inv, { coal: 5 })
    expect(r.canCraft).toBe(false)
    expect(r.missing.length).toBeGreaterThan(0)
    expect(r.requirements.some(q => q.resourceKey === 'ironIngot')).toBe(true)
  })

  it('fails when forge coal is below base quantity', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const inv = { ...emptyInventory(), iron: 50, wood: 10 }
    const r = checkInventoryForCraft(recipe, basicSwordSelections(), inv, { coal: 1 })
    expect(r.canCraft).toBe(false)
    expect(r.fuelRequired?.sufficient).toBe(false)
  })

  it('fills breakdownByPart for each selected part', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const r = checkInventoryForCraft(recipe, basicSwordSelections(), emptyInventory())
    expect(r.breakdownByPart.length).toBe(4)
    const blade = r.breakdownByPart.find(b => b.partId === 'blade')
    expect(blade?.materialId).toBe('iron')
  })

  it('canCraft uses materialStash when resources are empty', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const inv = emptyInventory()
    const stash = {
      iron_alloy: 20,
      oak: 10,
      coal: 5,
    }
    const r = checkInventoryForCraft(recipe, basicSwordSelections(), inv, stash)
    expect(r.canCraft).toBe(true)
  })

  it('counts catalog coal id in stash toward forge fuel', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    const inv = { ...emptyInventory(), ironIngot: 50, wood: 10, coal: 0 }
    const stash = { coal: 5 }
    const r = checkInventoryForCraft(recipe, basicSwordSelections(), inv, stash)
    expect(r.fuelRequired?.sufficient).toBe(true)
    expect(r.canCraft).toBe(true)
  })
})

describe('getRefiningCraftingCost / canAffordCraftingCostWithStash', () => {
  it('aggregates inputs and extra coal for smelting', () => {
    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    expect(getRefiningCraftingCost(recipe, 2)).toEqual({
      iron: 6,
      coal: 4,
    })
  })

  it('allows refining from stash-only canonical ore ids and coal', () => {
    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const inv = { ...emptyInventory(), iron: 0, coal: 0 }
    const stash = { iron_ore: 9, coal: 6 }
    const cost = getRefiningCraftingCost(recipe, 3)
    expect(canAffordCraftingCostWithStash(cost, inv, stash)).toBe(true)
    const out = applyCraftingCostSpend(cost, inv, stash)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.resources.iron).toBe(0)
    expect(out.resources.coal).toBe(0)
    expect(out.materialStash.iron_ore).toBeUndefined()
    expect(out.materialStash.coal).toBeUndefined()
  })

  it('tanned_leather_tan: no ResourceKey inputs; stash debit raw_leather only', () => {
    const recipe = getRefiningRecipe('tanned_leather_tan')
    expect(recipe).toBeDefined()
    if (!recipe) return
    expect(getRefiningCraftingCost(recipe, 2)).toEqual({})
    const inv = emptyInventory()
    const stash = { raw_leather: 5 }
    expect(canAffordRefiningStart(recipe, 2, inv, stash)).toBe(true)
    const spent = applyRefiningFullSpend(recipe, 2, inv, stash)
    expect(spent.ok).toBe(true)
    if (!spent.ok) return
    expect(spent.materialStash.raw_leather).toBe(3)
  })
})

describe('removeResourceKeyFromPools', () => {
  it('removes from stash before resources (same order as craft spend)', () => {
    const inv = { ...emptyInventory(), iron: 5 }
    const stash = { iron_ore: 3 }
    const out = removeResourceKeyFromPools('iron', 4, inv, stash)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.resources.iron).toBe(4)
    expect(out.materialStash.iron_ore).toBeUndefined()
  })

  it('returns ok false when total across pools is insufficient', () => {
    const inv = { ...emptyInventory(), iron: 1 }
    const stash = { iron_ore: 1 }
    const out = removeResourceKeyFromPools('iron', 5, inv, stash)
    expect(out.ok).toBe(false)
  })
})

describe('computePoolSpendDeltas', () => {
  it('reports stash and resource decrements only', () => {
    const beforeInv = { ...emptyInventory(), iron: 10, gold: 100 }
    const afterInv = { ...beforeInv, iron: 7, gold: 150 }
    const beforeStash = { iron_ore: 5, coal: 2 }
    const afterStash = { iron_ore: 2, coal: 2 }
    const d = computePoolSpendDeltas(beforeInv, beforeStash, afterInv, afterStash)
    expect(d.stashDecrements).toEqual({ iron_ore: 3 })
    expect(d.resourceDecrements).toEqual({ iron: 3 })
  })
})

describe('getCatalogMaterialIdsForResourceKey', () => {
  it('returns lexicographically sorted catalog ids for iron pool', () => {
    const ids = getCatalogMaterialIdsForResourceKey('iron')
    expect(ids.includes('iron_ore')).toBe(true)
    expect(ids).toEqual([...ids].sort())
  })
})

describe('applyCraftingCostSpend', () => {
  it('drains stash mapped ids before resources.iron', () => {
    const inv = { ...emptyInventory(), iron: 10, coal: 0 }
    const stash = { iron_ore: 3, coal: 5 }
    const out = applyCraftingCostSpend({ iron: 5, coal: 3 }, inv, stash)
    expect(out.ok).toBe(true)
    if (!out.ok) return
    expect(out.resources.iron).toBe(8)
    expect(out.materialStash.iron_ore).toBeUndefined()
    expect(out.materialStash.coal).toBe(2)
  })
})

describe('getAvailableAmountForResourceKey', () => {
  it('aggregates all material ids mapped to wood', () => {
    const inv = { ...emptyInventory(), wood: 1 }
    const stash = { oak: 2, birch: 4 }
    expect(getAvailableAmountForResourceKey(inv, stash, 'wood')).toBe(7)
  })

  it('includes world-resource stash ids in iron and ingot pools', () => {
    const inv = emptyInventory()
    const stash = { bog_iron: 10, ancient_metal: 2 }
    expect(getAvailableAmountForResourceKey(inv, stash, 'iron')).toBe(10)
    expect(getAvailableAmountForResourceKey(inv, stash, 'ironIngot')).toBe(2)
  })

  it('maps peat (gatherable fuel) to coal pool', () => {
    const inv = emptyInventory()
    expect(getAvailableAmountForResourceKey(inv, { peat: 4 }, 'coal')).toBe(4)
  })

  it('coal pool is stash-only: ignores resources.coal', () => {
    const inv = { ...emptyInventory(), coal: 100 }
    expect(getAvailableAmountForResourceKey(inv, {}, 'coal')).toBe(0)
    expect(getAvailableAmountForResourceKey(inv, { coal: 3 }, 'coal')).toBe(3)
  })

  it('coal spend does not debit resources.coal', () => {
    const inv = { ...emptyInventory(), coal: 50 }
    const out = applyCraftingCostSpend({ coal: 2 }, inv, { coal: 1 })
    expect(out.ok).toBe(false)
    const ok = applyCraftingCostSpend({ coal: 2 }, inv, { coal: 2 })
    expect(ok.ok).toBe(true)
    if (!ok.ok) return
    expect(ok.resources.coal).toBe(50)
    expect(ok.materialStash.coal).toBeUndefined()
  })
})

describe('world-resource → ResourceKey bridge', () => {
  it('maps expedition ore variants and star_metal', () => {
    expect(getResourceKeyForMaterial('bog_iron')).toBe('iron')
    expect(getResourceKeyForMaterial('depth_iron')).toBe('iron')
    expect(getResourceKeyForMaterial('cold_iron_ore')).toBe('iron')
    expect(getResourceKeyForMaterial('living_ore')).toBe('iron')
    expect(getResourceKeyForMaterial('star_metal')).toBe('mithril')
  })

  it('core entries override bridge when both define same id', () => {
    expect(getResourceKeyForMaterial('silver_ore')).toBe('silver')
    expect(getResourceKeyForMaterial('mithril_ore')).toBe('mithril')
  })
})

describe('stone domain chain (A2 2.3)', () => {
  it('stone_blocks: cost stone оплачивается из stash (basic_stone + fieldstone), без resources.stone', () => {
    const recipe = getRefiningRecipe('stone_blocks')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const inv = emptyInventory()
    const stash: Record<string, number> = { basic_stone: 1, fieldstone: 2 }
    const cost = getRefiningCraftingCost(recipe, 1)
    expect(cost).toEqual({ stone: 3 })
    expect(canAffordCraftingCostWithStash(cost, inv, stash)).toBe(true)
    const r = applyCraftingCostSpend(cost, inv, stash)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.resources.stone).toBe(0)
    expect(r.materialStash.basic_stone).toBeUndefined()
    expect(r.materialStash.fieldstone).toBeUndefined()
  })
})

describe('leather domain chain (A2 2.3)', () => {
  it('crafting cost leather оплачивается из stash (raw_leather + bridge id), без resources.leather', () => {
    const inv = emptyInventory()
    const stash: Record<string, number> = { raw_leather: 1, shadow_leather: 3 }
    const cost = { leather: 4 }
    expect(canAffordCraftingCostWithStash(cost, inv, stash)).toBe(true)
    const r = applyCraftingCostSpend(cost, inv, stash)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.resources.leather).toBe(0)
    expect(r.materialStash.raw_leather).toBeUndefined()
    expect(r.materialStash.shadow_leather).toBeUndefined()
  })
})

describe('wood domain chain (A2 2.3)', () => {
  it('wood_planks: cost wood оплачивается из stash (oak + birch), без resources.wood', () => {
    const recipe = getRefiningRecipe('wood_planks')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const inv = emptyInventory()
    const stash: Record<string, number> = { oak: 1, birch: 1 }
    const cost = getRefiningCraftingCost(recipe, 1)
    expect(cost).toEqual({ wood: 2 })
    expect(canAffordCraftingCostWithStash(cost, inv, stash)).toBe(true)
    const r = applyCraftingCostSpend(cost, inv, stash)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.resources.wood).toBe(0)
    expect(r.materialStash.oak).toBeUndefined()
    expect(r.materialStash.birch).toBeUndefined()
  })
})

describe('smelting domain chain (A2 2.2)', () => {
  it('refining iron ingot: cost оплачивается из materialStash (iron_ore, coal)', () => {
    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const inv = emptyInventory()
    const stash: Record<string, number> = { iron_ore: 9, coal: 6 }
    const cost = getRefiningCraftingCost(recipe, 1)
    expect(canAffordCraftingCostWithStash(cost, inv, stash)).toBe(true)
    const r = applyCraftingCostSpend(cost, inv, stash)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.materialStash.iron_ore).toBe(6)
    expect(r.materialStash.coal).toBe(4)
  })
})

describe('getCraftingCost (V2 + selections)', () => {
  it('sums requirements from materialSelections and adds forge coal', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) throw new Error('fixture: basic_sword')
    expect(getCraftingCost(recipe, basicSwordSelections())).toEqual({
      ironIngot: 5,
      wood: 1,
      coal: 3,
    })
  })
})
