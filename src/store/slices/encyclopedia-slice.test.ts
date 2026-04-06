import { describe, expect, it } from 'vitest'
import { create } from 'zustand'
import { createEncyclopediaSlice } from './encyclopedia-slice'

describe('encyclopedia-slice useMaterialAmount', () => {
  it('applies use gain for each unit (totalUses matches count)', () => {
    const useStore = create(createEncyclopediaSlice)
    useStore.getState().useMaterialAmount('phase6_test_ore', 4)
    const k = useStore.getState().materialKnowledge['phase6_test_ore']
    expect(k).toBeDefined()
    expect(k?.totalUses).toBe(4)
    expect((k?.expertise ?? 0) > 0).toBe(true)
  })
})
