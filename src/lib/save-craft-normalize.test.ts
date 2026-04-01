import { describe, expect, it } from 'vitest'
import {
  defaultCraftV2Persisted,
  isActiveCraftV2Shape,
  isLegacySliceActiveCraftShape,
  mergeCraftV2PersistedFromSave,
  mergeLegacyActiveCraftForSlice,
  normalizeActiveCraftColumn,
} from '@/lib/save-craft-normalize'
import { initialActiveCraft } from '@/store/slices/craft-slice'

describe('save-craft-normalize', () => {
  it('detects ActiveCraftV2 shape', () => {
    expect(
      isActiveCraftV2Shape({
        id: 'x',
        plan: {},
        stages: [],
        status: 'running',
      })
    ).toBe(true)
    expect(isActiveCraftV2Shape({ progress: 0 })).toBe(false)
  })

  it('detects legacy slice shape', () => {
    expect(
      isLegacySliceActiveCraftShape({
        recipeId: 'iron_sword',
        progress: 10,
        weaponName: 'x',
      })
    ).toBe(true)
  })

  it('normalizeActiveCraftColumn prefers craftV2Persisted.activeCraft', () => {
    const v2 = { id: 'c', plan: {}, stages: [], status: 'running' as const }
    const merged = { ...defaultCraftV2Persisted, activeCraft: v2 }
    expect(normalizeActiveCraftColumn({}, merged)).toBe(v2)
  })

  it('mergeCraftV2PersistedFromSave hoists v2 from activeCraft column', () => {
    const v2 = { id: 'c', plan: { recipeId: 'basic_sword' }, stages: [], status: 'running' as const }
    const out = mergeCraftV2PersistedFromSave(null, v2)
    expect(out.activeCraft).toBe(v2)
  })

  it('mergeLegacyActiveCraftForSlice restores slice fields', () => {
    const o = mergeLegacyActiveCraftForSlice({
      recipeId: 'iron_sword',
      progress: 50,
      weaponName: 'Test',
      startTime: 1,
      endTime: 2,
      quality: 3,
    })
    expect(o.recipeId).toBe('iron_sword')
    expect(o.progress).toBe(50)
    expect(o.weaponName).toBe('Test')
  })

  it('mergeLegacyActiveCraftForSlice returns initial for non-legacy', () => {
    expect(mergeLegacyActiveCraftForSlice(null)).toEqual(initialActiveCraft)
  })
})
