import { describe, expect, it } from 'vitest'
import { allMaterials, materialById } from './material-registry-manifest'

describe('material-registry-manifest (§1.1)', () => {
  it('allMaterials и materialById согласованы, id уникальны', () => {
    expect(allMaterials.length).toBeGreaterThan(0)
    expect(Object.keys(materialById).length).toBe(allMaterials.length)
    const seen = new Set<string>()
    for (const m of allMaterials) {
      const id = m.identity.id
      expect(seen.has(id), `duplicate id: ${id}`).toBe(false)
      seen.add(id)
      expect(materialById[id]).toBe(m)
    }
  })
})
