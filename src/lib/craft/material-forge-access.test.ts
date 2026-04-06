import { describe, it, expect } from 'vitest'
import {
  filterForgeExpertiseMaterials,
  getMaterialForgeExpertise,
  isMaterialUnlockedForForge,
} from '@/lib/craft/material-forge-access'
import { MIN_MATERIAL_EXPERTISE_FOR_CRAFT } from '@/lib/store-utils/constants'
import type { MaterialNode } from '@/types/materials/material-core'
import type { MaterialKnowledge } from '@/types/materials/knowledge'

const node = (id: string): MaterialNode =>
  ({
    identity: { id, name: id, class: 'metal', tags: [], origin: 'natural' },
    economy: { rarity: 1 },
    physical: { hardness: 1, elasticity: 1, toughness: 1, density: 1 },
    arcane: { conductivity: 1 },
    processing: { workability: 1 },
    summary: { basic: '', applied: '', strengths: [], weaknesses: [] },
  }) as unknown as MaterialNode

const baseK = (expertise: number): MaterialKnowledge => ({
  materialId: 'birch',
  expertise,
  discoveredAt: 0,
  lastUsedAt: 0,
  totalUses: 0,
  totalResearchTime: 0,
})

describe('material-forge-access', () => {
  it('isMaterialUnlockedForForge respects MIN', () => {
    const k: Record<string, MaterialKnowledge> = {
      birch: baseK(MIN_MATERIAL_EXPERTISE_FOR_CRAFT - 1),
    }
    expect(isMaterialUnlockedForForge('birch', k)).toBe(false)
    const k2: Record<string, MaterialKnowledge> = {
      birch: baseK(MIN_MATERIAL_EXPERTISE_FOR_CRAFT),
    }
    expect(isMaterialUnlockedForForge('birch', k2)).toBe(true)
  })

  it('getMaterialForgeExpertise defaults missing to 0', () => {
    expect(getMaterialForgeExpertise('oak', {})).toBe(0)
  })

  it('filterForgeExpertiseMaterials drops below threshold', () => {
    const mats = [node('a'), node('b')]
    const k: Record<string, MaterialKnowledge> = {
      a: { ...baseK(0), materialId: 'a' },
      b: { ...baseK(MIN_MATERIAL_EXPERTISE_FOR_CRAFT), materialId: 'b' },
    }
    const out = filterForgeExpertiseMaterials(mats, k)
    expect(out.map(m => m.identity.id)).toEqual(['b'])
  })
})
