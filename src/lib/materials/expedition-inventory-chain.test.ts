import { describe, expect, it } from 'vitest'
import type { Resources } from '@/store/slices/resources-slice'
import { getRefiningRecipe } from '@/data/refining-recipes'
import {
  canAffordCraftingCostWithStash,
  checkInventoryForCraft,
  getRefiningCraftingCost,
} from '@/lib/craft/inventory-check'
import { getRecipeById } from '@/data/recipes'
import type { MaterialAssignment } from '@/types/craft-v2'

const emptyResources = (): Resources => ({
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

/**
 * Цепочка «лут по канону фазы 3 → тот же stash тратится горном / крафтом» (чистые функции).
 * Полный контур store (`addMaterialToStash` → `spendCraftingCostWithStash` + ENC) — [`materials-phase7-store-chain.test.ts`](../../store/materials-phase7-store-chain.test.ts).
 */
describe('expedition stash → refine / craft chain', () => {
  it('stash iron_ore + уголь покрывают стоимость двух партий плавки железа', () => {
    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const cost = getRefiningCraftingCost(recipe, 2)
    const inv = { ...emptyResources() }
    const stash = { iron_ore: 50, coal: 20 }
    expect(canAffordCraftingCostWithStash(cost, inv, stash)).toBe(true)
  })

  it('stash oak суммируется с wood: только слитки в resources, брёвна в stash — basic_sword доступен', () => {
    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const selections: MaterialAssignment = {
      blade: { materialId: 'iron', quantity: 3 },
      guard: { materialId: 'iron', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron', quantity: 1 },
    }
    const inv = { ...emptyResources(), ironIngot: 25, wood: 0 }
    const stash = { oak: 5, coal: 5 }
    const r = checkInventoryForCraft(recipe, selections, inv, stash)
    expect(r.canCraft).toBe(true)
  })
})
