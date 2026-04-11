import { describe, expect, it } from 'vitest'
import { materialById } from '@/data/materials/library'
import { compareMaterialNodesForEncyclopediaList } from '@/lib/materials/encyclopedia-display-order'

describe('compareMaterialNodesForEncyclopediaList (phase 5.1)', () => {
  it('orders by tier then name', () => {
    const ironOre = materialById['iron_ore']
    const birch = materialById['birch']
    expect(ironOre).toBeDefined()
    expect(birch).toBeDefined()
    if (!ironOre || !birch) return
    const d = compareMaterialNodesForEncyclopediaList(ironOre, birch)
    expect(typeof d).toBe('number')
    const d2 = compareMaterialNodesForEncyclopediaList(birch, birch)
    expect(d2).toBe(0)
  })
})
