import { describe, expect, it } from 'vitest'
import {
  compareCraftLineBlockMeta,
  getEffectiveCraftLineMetaForCombatTechnique,
  getEffectiveCraftLineMetaForProcessing,
} from '@/lib/craft/craft-line-meta'
import { getTechniqueById } from '@/data/techniques'

describe('craft-line-meta (ENC P5a)', () => {
  it('defaults processing to material_preparation', () => {
    const m = getEffectiveCraftLineMetaForProcessing(undefined)
    expect(m.phase).toBe('material_preparation')
    expect(m.order).toBe(0)
  })

  it('defaults combat technique to craft_finishing', () => {
    const t = getTechniqueById('basic_forging')
    expect(t).toBeDefined()
    if (!t) return
    const m = getEffectiveCraftLineMetaForCombatTechnique(t)
    expect(m.phase).toBe('craft_finishing')
  })

  it('compareCraftLineBlockMeta orders phases', () => {
    const prep = { phase: 'material_preparation' as const, order: 9, sortId: 'b' }
    const fin = { phase: 'craft_finishing' as const, order: 0, sortId: 'a' }
    expect(compareCraftLineBlockMeta(prep, fin)).toBeLessThan(0)
  })
})
