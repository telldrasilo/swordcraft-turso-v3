import { describe, expect, it } from 'vitest'
import { getRecipeById } from '@/data/recipes'
import { getMaterialById } from '@/data/materials'
import type { MaterialKnowledge } from '@/types/materials/knowledge'
import {
  filterDiscoveredMaterials,
  getMaterialQuantity,
  isMaterialAvailable,
  smartSortMaterials,
} from './material-sorting'

describe('filterDiscoveredMaterials', () => {
  it('keeps only materials with positive expertise', () => {
    const iron = getMaterialById('iron')
    const oak = getMaterialById('oak')
    expect(iron).toBeTruthy()
    expect(oak).toBeTruthy()
    if (!iron || !oak) throw new Error('fixture: iron / oak')
    const knowledge: Record<string, MaterialKnowledge> = {
      iron: {
        materialId: 'iron',
        expertise: 10,
        discoveredAt: 0,
        lastUsedAt: 0,
        totalUses: 1,
        totalResearchTime: 0,
      },
      oak: {
        materialId: 'oak',
        expertise: 0,
        discoveredAt: 0,
        lastUsedAt: 0,
        totalUses: 0,
        totalResearchTime: 0,
      },
    }
    const filtered = filterDiscoveredMaterials([iron, oak], knowledge)
    expect(filtered.map(m => m.identity.id)).toEqual(['iron'])
  })
})

describe('isMaterialAvailable / getMaterialQuantity', () => {
  it('uses inventory mapping for material id', () => {
    const iron = getMaterialById('iron')
    expect(iron).toBeDefined()
    if (!iron) throw new Error('fixture: iron')
    const inv = {
      gold: 0,
      soulEssence: 0,
      wood: 0,
      stone: 0,
      iron: 4,
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
    }
    expect(isMaterialAvailable(iron, inv)).toBe(true)
    expect(getMaterialQuantity(iron, inv)).toBe(4)
  })
})

describe('smartSortMaterials', () => {
  it('orders higher stock and expertise before lower', () => {
    const recipe = getRecipeById('basic_sword')
    const iron = getMaterialById('iron')
    const oak = getMaterialById('oak')
    expect(recipe).toBeTruthy()
    expect(iron).toBeTruthy()
    expect(oak).toBeTruthy()
    if (!recipe || !iron || !oak) throw new Error('fixture: basic_sword / iron / oak')
    const knowledge: Record<string, MaterialKnowledge> = {
      iron: {
        materialId: 'iron',
        expertise: 80,
        discoveredAt: 0,
        lastUsedAt: 0,
        totalUses: 1,
        totalResearchTime: 0,
      },
      oak: {
        materialId: 'oak',
        expertise: 10,
        discoveredAt: 0,
        lastUsedAt: 0,
        totalUses: 1,
        totalResearchTime: 0,
      },
    }
    const inv = {
      gold: 0,
      soulEssence: 0,
      wood: 0,
      stone: 0,
      iron: 100,
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

    }

    const sorted = smartSortMaterials([oak, iron], {

      inventory: inv,

      knowledge,

      recipe,

      partId: 'blade',

      blacksmithLevel: 5,

      dominantProperty: 'hardness',

    })

    expect(sorted[0].identity.id).toBe('iron')
  })
})
