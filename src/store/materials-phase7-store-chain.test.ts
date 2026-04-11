/**
 * Фаза 7 аудита материалов: цепочка «приход в stash (как с экспедиции) → списание тем же механизмом, что крафт/плавка».
 * Store: resources-slice + encyclopedia-slice (без полного game-store).
 */
import { describe, expect, it } from 'vitest'
import { create } from 'zustand'
import { getRecipeById } from '@/data/recipes'
import { getRefiningRecipe } from '@/data/refining-recipes'
import type { MaterialAssignment } from '@/types/craft-v2'
import { getCraftingCost, getRefiningCraftingCost } from '@/lib/craft/inventory-check'
import { createEncyclopediaSlice, type EncyclopediaSlice } from '@/store/slices/encyclopedia-slice'
import {
  createResourcesSlice,
  initialResources,
  type ResourcesSlice,
} from '@/store/slices/resources-slice'

type ChainStore = ResourcesSlice & EncyclopediaSlice

function createChainStore() {
  return create<ChainStore>()((set, get, _store) => ({
    ...createResourcesSlice(set, get, _store),
    ...createEncyclopediaSlice(set, get, _store),
  }))
}

describe('materials phase 7 — expedition-like stash → spendCraftingCostWithStash', () => {
  it('руда в stash: iron_ore тратится на стоимость плавки iron_ingot', () => {
    const store = createChainStore()
    store.getState().addMaterialToStash('iron_ore', 10)
    store.getState().addMaterialToStash('coal', 10)

    const recipe = getRefiningRecipe('iron_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const cost = getRefiningCraftingCost(recipe, 1)

    expect(store.getState().spendCraftingCostWithStash(cost)).toBe(true)
    expect(store.getState().materialStash.iron_ore).toBe(7)
    expect(store.getState().materialStash.coal).toBe(10 - (cost.coal ?? 0))
    expect(store.getState().resources.coal).toBe(initialResources.coal)

    const kn = store.getState().materialKnowledge['iron_ore']
    expect(kn).toBeDefined()
    expect((kn?.totalUses ?? 0) >= 3).toBe(true)
  })

  it('дерево в stash: oak + ironIngot в resources — списание крафта basic_sword', () => {
    const store = createChainStore()
    store.getState().addMaterialToStash('oak', 5)
    store.setState({
      resources: {
        ...store.getState().resources,
        ironIngot: 30,
      },
    })
    store.getState().addMaterialToStash('coal', 10)

    const recipe = getRecipeById('basic_sword')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const selections: MaterialAssignment = {
      blade: { materialId: 'iron', quantity: 3 },
      guard: { materialId: 'iron', quantity: 1 },
      grip: { materialId: 'oak', quantity: 1 },
      pommel: { materialId: 'iron', quantity: 1 },
    }
    const cost = getCraftingCost(recipe, selections)

    expect(store.getState().spendCraftingCostWithStash(cost)).toBe(true)
    expect(store.getState().materialStash.oak).toBe(4)
    expect(store.getState().materialKnowledge.oak).toBeDefined()
  })

  it('сплав: copper_ore + tin_ore в stash — стоимость bronze_ingot (два металла + уголь)', () => {
    const store = createChainStore()
    store.getState().addMaterialToStash('copper_ore', 10)
    store.getState().addMaterialToStash('tin_ore', 10)
    store.getState().addMaterialToStash('coal', 20)

    const recipe = getRefiningRecipe('bronze_ingot')
    expect(recipe).toBeDefined()
    if (!recipe) return
    const cost = getRefiningCraftingCost(recipe, 1)

    expect(store.getState().spendCraftingCostWithStash(cost)).toBe(true)
    expect(store.getState().materialStash.copper_ore).toBe(8)
    expect(store.getState().materialStash.tin_ore).toBe(9)
    expect(store.getState().materialKnowledge.copper_ore).toBeDefined()
    expect(store.getState().materialKnowledge.tin_ore).toBeDefined()
  })
})
