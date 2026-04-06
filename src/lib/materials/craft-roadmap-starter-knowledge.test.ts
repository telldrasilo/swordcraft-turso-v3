import { describe, it, expect } from 'vitest'
import { mergeCraftRoadmapStarterKnowledge } from '@/lib/materials/craft-roadmap-starter-knowledge'
import { CRAFT_STARTER_KNOWLEDGE_EXPERTISE, CRAFT_STARTER_KNOWLEDGE_MATERIAL_IDS } from '@/lib/store-utils/constants'

describe('mergeCraftRoadmapStarterKnowledge', () => {
  it('raises starter set to at least CRAFT_STARTER_KNOWLEDGE_EXPERTISE', () => {
    const m = mergeCraftRoadmapStarterKnowledge({})
    for (const id of CRAFT_STARTER_KNOWLEDGE_MATERIAL_IDS) {
      expect(m[id]?.expertise).toBeGreaterThanOrEqual(CRAFT_STARTER_KNOWLEDGE_EXPERTISE)
    }
  })

  it('does not lower existing expertise above starter', () => {
    const m = mergeCraftRoadmapStarterKnowledge({
      birch: {
        materialId: 'birch',
        expertise: 40,
        discoveredAt: 1,
        lastUsedAt: 1,
        totalUses: 0,
        totalResearchTime: 0,
      },
    })
    expect(m.birch.expertise).toBe(40)
  })
})
