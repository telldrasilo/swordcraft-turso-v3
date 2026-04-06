/**
 * Фаза 1b: явные оверрайды материаловедения для добываемых узлов
 * ([`gather-material-science-overrides.ts`](../../data/materials/library/gather-material-science-overrides.ts)).
 */

import { describe, it, expect } from 'vitest'
import { materialById } from '@/data/materials/library'
import { worldResourceNodes } from '@/data/materials/library/world-resource-nodes'
import { WORLD_RESOURCE_MATERIAL_SCIENCE } from '@/data/materials/library/gather-material-science-overrides'
import { collectPhase1bPriorityMaterialIds } from '@/lib/materials/phase1b-priority'

function overrideNonEmptyFieldCount(o: (typeof WORLD_RESOURCE_MATERIAL_SCIENCE)[string]): number {
  return (
    Object.keys(o.physical ?? {}).length +
    Object.keys(o.chemical ?? {}).length +
    Object.keys(o.arcane ?? {}).length +
    Object.keys(o.processing ?? {}).length
  )
}

describe('phase 1b — gatherable material science overrides', () => {
  const worldIds = new Set(worldResourceNodes.map((n) => n.identity.id))

  it('every worldResource id has a material-science override with at least one field', () => {
    for (const id of worldIds) {
      const block = WORLD_RESOURCE_MATERIAL_SCIENCE[id]
      expect(block, `${id}: add entry to WORLD_RESOURCE_MATERIAL_SCIENCE`).toBeDefined()
      if (block === undefined) throw new Error(`${id}: missing WORLD_RESOURCE_MATERIAL_SCIENCE entry`)
      expect(
        overrideNonEmptyFieldCount(block),
        `${id}: override must set at least one physical/chemical/arcane/processing field`
      ).toBeGreaterThan(0)
    }
  })

  it('no stray keys in WORLD_RESOURCE_MATERIAL_SCIENCE outside world catalog', () => {
    for (const id of Object.keys(WORLD_RESOURCE_MATERIAL_SCIENCE)) {
      expect(worldIds.has(id), `remove or fix stray material science key: ${id}`).toBe(true)
    }
  })

  it('override count matches world catalog size', () => {
    expect(Object.keys(WORLD_RESOURCE_MATERIAL_SCIENCE).length).toBe(worldIds.size)
  })

  it('priority phase1b ids resolve in library (expeditions, enc0, craft map)', () => {
    for (const id of collectPhase1bPriorityMaterialIds()) {
      expect(materialById[id], `missing MaterialNode: ${id}`).toBeDefined()
    }
  })

  it('priority gatherable ids receive calibrated nodes (merged in buildWorldNode)', () => {
    const priority = new Set(collectPhase1bPriorityMaterialIds())
    for (const id of worldIds) {
      if (!priority.has(id)) continue
      const node = materialById[id]
      expect(node, `missing MaterialNode: ${id}`).toBeDefined()
      if (node === undefined) throw new Error(`missing MaterialNode: ${id}`)
      expect(node.physical.hardness).toBeDefined()
      expect(node.chemical.reactivity).toBeDefined()
      expect(node.processing.workability).toBeDefined()
    }
  })
})
