/**
 * A2 подволна 2.2: списание только из materialStash по каталожным id.
 */
import { describe, expect, it } from 'vitest'
import { create } from 'zustand'
import { createEncyclopediaSlice, type EncyclopediaSlice } from '@/store/slices/encyclopedia-slice'
import { createResourcesSlice, type ResourcesSlice } from '@/store/slices/resources-slice'
import { createWorkersSlice, type WorkersSlice } from '@/store/slices/workers-slice'

type TStore = ResourcesSlice & EncyclopediaSlice & WorkersSlice

function makeStore() {
  return create<TStore>()((set, get, _store) => ({
    ...createResourcesSlice(set, get, _store),
    ...createWorkersSlice(set, get, _store),
    ...createEncyclopediaSlice(set, get, _store),
  }))
}

describe('tryDebitManyFromStash (A2)', () => {
  it('отказывает при нехватке на складе', () => {
    const s = makeStore()
    s.getState().addMaterialToStash('iron_ore', 2)
    expect(s.getState().tryDebitManyFromStash({ iron_ore: 3 })).toBe(false)
    expect(s.getState().materialStash.iron_ore).toBe(2)
  })

  it('списывает несколько id и уменьшает остатки', () => {
    const s = makeStore()
    s.getState().addMaterialToStash('iron_ore', 10)
    s.getState().addMaterialToStash('coal', 4)
    expect(s.getState().canDebitManyFromStash({ iron_ore: 3, coal: 2 })).toBe(true)
    expect(s.getState().tryDebitManyFromStash({ iron_ore: 3, coal: 2 })).toBe(true)
    expect(s.getState().materialStash.iron_ore).toBe(7)
    expect(s.getState().materialStash.coal).toBe(2)
  })
})

describe('grantResourceKeyFromWorld → stash (2.2b плавка)', () => {
  it('железная руда не дублирует resources.iron, списание горна берёт из stash', () => {
    const s = makeStore()
    s.getState().grantResourceKeyFromWorld('iron', 9)
    expect(s.getState().resources.iron).toBe(0)
    expect(s.getState().materialStash.iron_ore).toBe(9)
    s.getState().addMaterialToStash('coal', 6)
    const cost = { iron: 3, coal: 2 }
    expect(s.getState().canAffordCraftingCostWithStash(cost)).toBe(true)
    expect(s.getState().spendCraftingCostWithStash(cost)).toBe(true)
    expect(s.getState().materialStash.iron_ore).toBe(6)
    expect(s.getState().materialStash.coal).toBe(4)
    expect(s.getState().resources.iron).toBe(0)
    expect(s.getState().resources.coal).toBe(0)
  })

  it('лавка-эквивалент: addMaterialToStash(iron_ore) затем refine cost 1×1', () => {
    const s = makeStore()
    s.getState().addMaterialToStash('iron_ore', 3)
    s.getState().addMaterialToStash('coal', 2)
    expect(s.getState().spendCraftingCostWithStash({ iron: 1, coal: 1 })).toBe(true)
    expect(s.getState().materialStash.iron_ore).toBe(2)
    expect(s.getState().materialStash.coal).toBe(1)
  })
})
